<template>
	<canvas
		id="scaled_display"
		ref="sd"
		:height="bitmapHeight"
		:width="bitmapWidth"
		:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', cursor }"
		draggable="true"
		@click="onUiClick"
		@touchstart="onTouchStart"
		@dragstart="onDragStart"
		@touchmove="onSpriteDragMove"
		@mousemove="onSpriteDragMove"
		@touchend="onSpriteDrop"
		@mouseup="onSpriteDrop"
		@dragover="onDragOver"
		@drop="onDrop"
		@mouseenter="onMouseEnter"
		>HTML5 is required to use the Doki Doki Dialog Generator.
	</canvas>
</template>

<script lang="ts">
import { MutationPayload } from 'vuex';
import { RenderContext } from '@/renderer/rendererContext';
import { registerAsset } from '@/asset-manager';
import eventBus, {
	ColorPickedEvent,
	InvalidateRenderEvent,
} from '@/eventbus/event-bus';
import { IObject, ISetObjectPositionMutation } from '@/store/objects';
import { ICreateSpriteAction } from '@/store/objectTypes/sprite';
import { SceneRenderer } from '@/renderables/scene-renderer';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent } from 'vue';
import getConstants from '@/constants';
import { IPanel } from '@/store/panels';

export default defineComponent({
	props: {
		canvasWidth: { default: 0 },
		canvasHeight: { default: 0 },
		preLoading: { type: Boolean },
	},
	data: () => ({
		sdCtx: null! as CanvasRenderingContext2D,
		currentlyRendering: false,
		queuedRender: null as null | number,
		showingLast: false,
		dropSpriteCount: 0,
		dropPreventClick: false,

		draggedObject: null as DeepReadonly<IObject> | null,
		dragXOffset: 0,
		dragYOffset: 0,
		dragXOriginal: 0,
		dragYOriginal: 0,
	}),
	computed: {
		selection(): IObject['id'] | null {
			return this.$store.state.ui.selection;
		},
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		lqRendering(): boolean {
			return this.$store.state.ui.lqRendering;
		},
		sceneRender(): SceneRenderer {
			return new SceneRenderer(
				this.$store,
				this.$store.state.panels.currentPanel,
				this.bitmapWidth,
				this.bitmapHeight
			);
		},
		bitmapHeight(): number {
			this.preLoading;
			return getConstants().Base.screenHeight;
		},
		bitmapWidth(): number {
			this.preLoading;
			return getConstants().Base.screenWidth;
		},
		pickerMode(): boolean {
			return this.$store.state.ui.pickColor;
		},
		cursor(): 'default' | 'crosshair' {
			return this.pickerMode ? 'crosshair' : 'default';
		},
	},
	methods: {
		async download(): Promise<void> {
			const url = await this.sceneRender.download();

			await this.vuexHistory.transaction(async () => {
				const oldUrl = this.$store.state.ui.lastDownload;

				this.$store.commit('ui/setLastDownload', url);
				if (oldUrl) {
					URL.revokeObjectURL(oldUrl);
				}
			});
		},
		invalidateRender() {
			if (this.queuedRender) return;
			this.queuedRender = requestAnimationFrame(() => this.render_());
		},
		async render_(): Promise<void> {
			if (this.queuedRender) {
				cancelAnimationFrame(this.queuedRender);
				this.queuedRender = null;
			}

			if (this.$store.state.unsafe) return;

			await this.sceneRender.render(!this.lqRendering, true);
			this.display();
		},
		renderLoadingScreen() {
			if (!this.sdCtx) return;
			const loadingScreen = document.createElement('canvas');
			loadingScreen.height = this.bitmapHeight;
			loadingScreen.width = this.bitmapWidth;
			const rctx = RenderContext.make(loadingScreen, true, false);
			rctx.drawText({
				text: 'Starting...',
				x: loadingScreen.width / 2,
				y: loadingScreen.height / 2,
				align: 'center',
				outline: {
					width: 5,
					style: '#b59',
				},
				font: '32px riffic',
				fill: {
					style: 'white',
				},
			});
			this.sdCtx!.drawImage(loadingScreen, this.canvasWidth, this.canvasHeight);
		},
		display(): void {
			if (!this.sdCtx) return;
			this.showingLast = false;
			this.sceneRender.paintOnto(this.sdCtx, {
				x: 0,
				y: 0,
				w: this.bitmapWidth,
				h: this.bitmapHeight,
			});
		},
		toRendererCoordinate(x: number, y: number): [number, number] {
			const sd = this.$refs.sd as HTMLCanvasElement;
			const rx = x - sd.offsetLeft;
			const ry = y - sd.offsetTop;
			const sx = (rx / sd.offsetWidth) * sd.width;
			const sy = (ry / sd.offsetWidth) * sd.width;
			return [sx, sy];
		},
		onUiClick(e: MouseEvent): void {
			const [sx, sy] = this.toRendererCoordinate(e.clientX, e.clientY);

			if (this.pickerMode) {
				const data = this.sdCtx.getImageData(sx, sy, 1, 1).data;
				const hex = `rgba(${data[0].toString()},${data[1].toString()},${data[2].toString()},${(
					data[3] / 255
				).toString()})`;
				this.vuexHistory.transaction(() => {
					this.$store.commit('ui/setColorPicker', false);
					eventBus.fire(new ColorPickedEvent(hex));
				});
				return;
			}

			if (this.dropPreventClick) {
				this.dropPreventClick = false;
				return;
			}

			const objects = this.sceneRender.objectsAt(sx, sy);

			const currentObjectIdx = objects.findIndex((id) => id === this.selection);
			let selectedObject: IObject['id'] | null;

			if (currentObjectIdx === 0) {
				selectedObject = null;
			} else if (currentObjectIdx !== -1) {
				// Select the next lower character
				selectedObject = objects[currentObjectIdx - 1];
			} else {
				selectedObject = objects[objects.length - 1] ?? null;
			}

			if (this.$store.state.ui.selection === selectedObject) return;
			this.vuexHistory.transaction(() => {
				this.$store.commit('ui/setSelection', selectedObject);
			});
		},
		onDragStart(e: DragEvent) {
			e.preventDefault();
			if (!this.selection) return;
			this.draggedObject = this.currentPanel.objects[this.selection];
			const [x, y] = this.toRendererCoordinate(e.clientX, e.clientY);
			this.dragXOffset = x - this.draggedObject.x;
			this.dragYOffset = y - this.draggedObject.y;
			this.dragXOriginal = this.draggedObject.x;
			this.dragYOriginal = this.draggedObject.y;
		},
		onTouchStart(e: TouchEvent) {
			if (!this.selection) return;
			this.draggedObject = this.currentPanel.objects[this.selection];
			const [x, y] = this.toRendererCoordinate(
				e.touches[0].clientX,
				e.touches[0].clientY
			);
			this.dragXOffset = x - this.draggedObject.x;
			this.dragYOffset = y - this.draggedObject.y;
			this.dragXOriginal = this.draggedObject.x;
			this.dragYOriginal = this.draggedObject.y;
		},
		onDragOver(e: DragEvent) {
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer!.dropEffect = 'copy';
		},
		onSpriteDragMove(e: MouseEvent | TouchEvent) {
			if (this.draggedObject) {
				e.preventDefault();

				// Formatter quirk
				// tslint:disable:indent
				let [x, y] =
					e instanceof MouseEvent
						? this.toRendererCoordinate(e.clientX, e.clientY)
						: this.toRendererCoordinate(
								e.touches[0].clientX,
								e.touches[0].clientY
						  );
				// tslint:enable:indent
				x -= this.dragXOffset;
				y -= this.dragYOffset;

				const deltaX = Math.abs(x - this.dragXOriginal);
				const deltaY = Math.abs(y - this.dragYOriginal);

				if (deltaX + deltaY > 1) this.dropPreventClick = true;

				if (e.shiftKey) {
					if (deltaX > deltaY) {
						y = this.dragYOriginal;
					} else {
						x = this.dragXOriginal;
					}
				}

				this.vuexHistory.transaction(() => {
					this.$store.dispatch('panels/setPosition', {
						panelId: this.draggedObject!.panelId,
						id: this.draggedObject!.id,
						x,
						y,
					} as ISetObjectPositionMutation);
				});
			}
		},
		async onDrop(e: DragEvent) {
			e.stopPropagation();
			e.preventDefault();

			if (!e.dataTransfer) return;

			for (const item of e.dataTransfer.items) {
				if (item.kind === 'file' && item.type.match(/image.*/)) {
					const name = 'dropCustomAsset' + ++this.dropSpriteCount;
					const url = registerAsset(name, item.getAsFile()!);

					await this.vuexHistory.transaction(async () => {
						await this.$store.dispatch('panels/createSprite', {
							assets: [
								{
									hq: url,
									lq: url,
									sourcePack: 'dddg.generated.uploaded-sprites',
								},
							],
						} as ICreateSpriteAction);
					});
				}
			}
		},
		onSpriteDrop(e: MouseEvent | TouchEvent) {
			if (this.draggedObject) {
				if ('TouchEvent' in window && e instanceof TouchEvent) {
					this.dropPreventClick = false;
				}
				this.draggedObject = null;
			}
		},
		onMouseEnter(e: MouseEvent) {
			if (e.buttons !== 1) {
				this.draggedObject = null;
			}
		},
	},
	watch: {
		canvasWidth() {
			this.display();
		},
		canvasHeight() {
			this.display();
		},
	},
	async created(): Promise<void> {
		eventBus.subscribe(InvalidateRenderEvent, () => this.invalidateRender());
		this.$store.subscribe((mut: MutationPayload) => {
			if (mut.type === 'panels/setPanelPreview') return;
			if (mut.type === 'panels/currentPanel') return;
			this.invalidateRender();
		});
	},
	mounted(): void {
		const sd = this.$refs.sd as HTMLCanvasElement;
		this.sdCtx = sd.getContext('2d')!;

		this.renderLoadingScreen();
		this.invalidateRender();
	},
});
</script>

<style lang="scss"></style>
