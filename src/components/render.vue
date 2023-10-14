<!--
	Displays the preview render that makes up most of the user interface
-->
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
		@contextmenu.prevent
		>HTML5 is required to use the Doki Doki Dialog Generator.
	</canvas>
</template>

<script lang="ts">
import { MutationPayload } from 'vuex';
import { RenderContext } from '@/renderer/rendererContext';
import eventBus, {
	ColorPickedEvent,
	InvalidateRenderEvent,
	RenderUpdatedEvent,
	StateLoadingEvent,
} from '@/eventbus/event-bus';
import { IObject, ISetObjectPositionMutation } from '@/store/objects';
import { ICreateSpriteAction } from '@/store/objectTypes/sprite';
import { SceneRenderer } from '@/renderables/scene-renderer';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent, markRaw } from 'vue';
import getConstants from '@/constants';
import { IPanel } from '@/store/panels';
import { disposeCanvas } from '@/util/canvas';
import { transaction } from '@/plugins/vuex-history';

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

		sceneRendererCache: null as SceneRenderer | null,
	}),
	computed: {
		selection(): IObject['id'] | null {
			return this.$store.state.ui.selection ?? null;
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
			if (this.preLoading) return null;
			const panelId = this.$store.state.panels.currentPanel;
			if (!this.sceneRendererCache) {
				console.log('New scene renderer!');
				// eslint-disable-next-line vue/no-side-effects-in-computed-properties
				this.sceneRendererCache = markRaw(
					new SceneRenderer(
						this.$store,
						panelId,
						this.bitmapWidth,
						this.bitmapHeight
					)
				);
			} else {
				this.sceneRendererCache.setPanelId(panelId);
			}
			return this.sceneRendererCache as SceneRenderer;
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

			await transaction(() => {
				const oldUrl = this.$store.state.ui.lastDownload;

				this.$store.commit('ui/setLastDownload', url);
				if (oldUrl != null) {
					URL.revokeObjectURL(oldUrl);
				}
			});
		},
		invalidateRender() {
			if (this.queuedRender != null) return;
			this.queuedRender = requestAnimationFrame(this.render_);
		},
		async render_(): Promise<void> {
			if (this.queuedRender != null) {
				cancelAnimationFrame(this.queuedRender);
				this.queuedRender = null;
			}
			if (this.preLoading) return;

			if (this.$store.state.unsafe) return;

			try {
				await this.sceneRender.render(!this.lqRendering, true, false);
			} catch (e) {
				console.log(e);
			}
			this.display();
			eventBus.fire(new RenderUpdatedEvent());
		},
		renderLoadingScreen() {
			const loadingScreen = document.createElement('canvas');
			loadingScreen.height = this.bitmapHeight;
			loadingScreen.width = this.bitmapWidth;
			try {
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
				this.sdCtx!.drawImage(
					loadingScreen,
					this.canvasWidth,
					this.canvasHeight
				);
			} finally {
				disposeCanvas(loadingScreen);
			}
		},
		display(): void {
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
				transaction(() => {
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

			transaction(() => {
				if (this.$store.state.ui.selection === selectedObject) return;
				this.$store.commit('ui/setSelection', selectedObject);
			});
		},
		onDragStart(e: DragEvent) {
			e.preventDefault();
			if (this.selection === null) return;
			this.draggedObject = this.currentPanel.objects[this.selection];
			const [x, y] = this.toRendererCoordinate(e.clientX, e.clientY);
			this.dragXOffset = x - this.draggedObject.x;
			this.dragYOffset = y - this.draggedObject.y;
			this.dragXOriginal = this.draggedObject.x;
			this.dragYOriginal = this.draggedObject.y;
		},
		onTouchStart(e: TouchEvent) {
			if (this.selection === null) return;
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
			if (!this.draggedObject) return;
			e.preventDefault();
			let [x, y] =
				e instanceof MouseEvent
					? this.toRendererCoordinate(e.clientX, e.clientY)
					: this.toRendererCoordinate(
							e.touches[0].clientX,
							e.touches[0].clientY
					  );
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
			transaction(async () => {
				await this.$store.dispatch('panels/setPosition', {
					panelId: this.draggedObject!.panelId,
					id: this.draggedObject!.id,
					x,
					y,
				} as ISetObjectPositionMutation);
			});
		},
		async onDrop(e: DragEvent) {
			e.stopPropagation();
			e.preventDefault();

			if (!e.dataTransfer) return;

			for (const item of e.dataTransfer.items) {
				if (item.kind === 'file' && item.type.match(/image.*/)) {
					const file = item.getAsFile()!;
					const url = URL.createObjectURL(file);
					try {
						const assetUrl: string = await this.$store.dispatch(
							'uploadUrls/add',
							{
								name: file.name,
								url,
							}
						);

						await transaction(async () => {
							await this.$store.dispatch('panels/createSprite', {
								panelId: this.$store.state.panels.currentPanel,
								assets: [
									{
										hq: assetUrl,
										lq: assetUrl,
										sourcePack: 'dddg.uploaded.sprites',
									},
								],
							} as ICreateSpriteAction);
						});
					} catch (e) {
						URL.revokeObjectURL(url);
					}
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
	created(): void {
		if (typeof WeakRef !== 'undefined') {
			const self = new WeakRef(this);
			(window as any).getMainSceneRenderer = function () {
				return self.deref()?.sceneRender;
			};
		} else {
			(window as any).getMainSceneRenderer = () => {
				return this.sceneRender;
			};
		}
		eventBus.subscribe(InvalidateRenderEvent, () => this.invalidateRender());
		eventBus.subscribe(StateLoadingEvent, () => {
			const cache = this.sceneRendererCache;
			if (cache) {
				cache.setPanelId(-1);
			}
		});
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
	unmounted(): void {
		this.sceneRendererCache?.dispose();
	},
});
</script>

<style lang="scss">
canvas {
	position: fixed;
	display: block;
}
</style>
