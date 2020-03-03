<template>
	<canvas
		id="scaled_display"
		ref="sd"
		:height="bitmapHeight"
		:width="bitmapWidth"
		:style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
		draggable
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
	>HTML5 is required to use the Doki Doki Dialog Generator.</canvas>
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
// tslint:disable:member-ordering
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';
import { Store, MutationPayload } from 'vuex';
import { IRootState } from '@/store';
import { Renderer } from '@/renderer/renderer';
import { IRenderable } from '@/models/renderable';
import { IBackground, color, Background } from '@/models/background';
import { IHistorySupport } from '@/plugins/vuex-history';
import { RenderContext } from '@/renderer/rendererContext';
import { getAsset, registerAsset } from '@/asset-manager';
import eventBus, { InvalidateRenderEvent } from '@/eventbus/event-bus';
import { ICreateTextBoxAction, ITextBox } from '@/store/objectTypes/textbox';
import {
	IObject,
	ISetObjectPositionMutation,
	IRemoveObjectAction,
	IObjectsState,
} from '@/store/objects';
import { ICreateSpriteAction, ISprite } from '@/store/objectTypes/sprite';
import { Character } from '@/models/character';
import {
	IShiftCharacterSlotAction,
	ICharacter,
} from '@/store/objectTypes/characters';
import { Sprite } from '@/models/sprite';
import { TextBox } from '@/models/textbox';
import { ISetCurrentMutation, IPanel } from '@/store/panels';
import content from '@/store/content';
import { SceneRenderer } from '../models/scene-renderer';
import { DeepReadonly } from '../util/readonly';
import { screenHeight, screenWidth } from '@/constants/base';

@Component({})
export default class Render extends Vue {
	public $store!: Store<DeepReadonly<IRootState>>;

	private sdCtx: CanvasRenderingContext2D | undefined;

	private get selection(): string | null {
		return this.$store.state.ui.selection;
	}

	private currentlyRendering: boolean = false;

	private queuedRender: number | null = null;
	private showingLast: boolean = false;

	private dropSpriteCount = 0;
	private dropPreventClick = false;

	@Prop({ type: Number, default: 0 }) private readonly canvasWidth!: number;
	@Prop({ type: Number, default: 0 }) private readonly canvasHeight!: number;

	@State('lqRendering', { namespace: 'ui' })
	private readonly lqRendering!: boolean;

	private vuexHistory!: IHistorySupport;

	private get sceneRender() {
		return new SceneRenderer(
			this.$store,
			this.$store.state.panels.currentPanel,
			this.bitmapWidth,
			this.bitmapHeight
		);
	}

	private get bitmapHeight(): number {
		return screenHeight;
	}
	private get bitmapWidth(): number {
		return screenWidth;
	}

	public async blendOver(imageUrl: string): Promise<void> {}

	public async download(): Promise<void> {
		const url = await this.sceneRender.download();

		this.vuexHistory.transaction(async () => {
			const oldUrl = this.$store.state.ui.lastDownload;

			this.$store.commit('ui/setLastDownload', url);
			if (oldUrl) {
				URL.revokeObjectURL(oldUrl);
			}
		});
	}

	private invalidateRender() {
		if (this.queuedRender) return;
		this.queuedRender = requestAnimationFrame(() => this.render_());
	}

	private async render_(): Promise<void> {
		if (this.queuedRender) {
			cancelAnimationFrame(this.queuedRender);
			this.queuedRender = null;
		}

		if (this.$store.state.unsafe) return;

		await this.sceneRender.render(!this.lqRendering);
		this.display();
	}

	private async created(): Promise<void> {
		eventBus.subscribe(InvalidateRenderEvent, command => this.invalidateRender);
		this.$store.subscribe((mut: MutationPayload) => {
			if (mut.type === 'panels/setPanelPreview') return;
			if (mut.type === 'panels/currentPanel') return;
			this.invalidateRender();
		});
	}

	private mounted(): void {
		const sd = this.$refs.sd as HTMLCanvasElement;
		this.sdCtx = sd.getContext('2d') || undefined;

		this.renderLoadingScreen();
		this.invalidateRender();
	}

	private renderLoadingScreen() {
		if (!this.sdCtx) return;
		const loadingScreen = document.createElement('canvas');
		loadingScreen.height = this.bitmapHeight;
		loadingScreen.width = this.bitmapWidth;
		const rctx = new RenderContext(
			loadingScreen.getContext('2d')!,
			true,
			false
		);
		rctx.drawText({
			text: 'Starting...',
			// tslint:disable-next-line: no-magic-numbers
			x: loadingScreen.width / 2,
			// tslint:disable-next-line: no-magic-numbers
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
	}

	@Watch('canvasWidth')
	@Watch('canvasHeight')
	private display(): void {
		if (!this.sdCtx) return;
		this.showingLast = false;
		this.sceneRender.paintOnto(
			this.sdCtx,
			0,
			0,
			this.bitmapWidth,
			this.bitmapHeight
		);
	}

	private toRendererCoordinate(x: number, y: number): [number, number] {
		const sd = this.$refs.sd as HTMLCanvasElement;
		const rx = x - sd.offsetLeft;
		const ry = y - sd.offsetTop;
		const sx = (rx / sd.offsetWidth) * sd.width;
		const sy = (ry / sd.offsetWidth) * sd.width;
		return [sx, sy];
	}

	private onUiClick(e: MouseEvent): void {
		if (this.dropPreventClick) {
			this.dropPreventClick = false;
			return;
		}

		const [sx, sy] = this.toRendererCoordinate(e.clientX, e.clientY);

		const objects = this.sceneRender.objectsAt(sx, sy);

		const currentObjectIdx = objects.findIndex(id => id === this.selection);
		let selectedObject: string | null;

		if (currentObjectIdx === 0) {
			selectedObject = null;
		} else if (currentObjectIdx !== -1) {
			// Select the next lower character
			selectedObject = objects[currentObjectIdx - 1];
		} else {
			selectedObject = objects[objects.length - 1] || null;
		}

		this.$store.commit('ui/setSelection', selectedObject);
	}

	private draggedObject: IObject | null = null;
	private dragXOffset: number = 0;
	private dragYOffset: number = 0;
	private dragXOriginal: number = 0;
	private dragYOriginal: number = 0;

	private onDragStart(e: DragEvent) {
		e.preventDefault();
		if (!this.selection) return;
		this.draggedObject = this.$store.state.objects.objects[this.selection];
		const [x, y] = this.toRendererCoordinate(e.clientX, e.clientY);
		this.dragXOffset = x - this.draggedObject.x;
		this.dragYOffset = y - this.draggedObject.y;
		this.dragXOriginal = this.draggedObject.x;
		this.dragYOriginal = this.draggedObject.y;
	}

	private onTouchStart(e: TouchEvent) {
		if (!this.selection) return;
		this.draggedObject = this.$store.state.objects.objects[this.selection];
		const [x, y] = this.toRendererCoordinate(
			e.touches[0].clientX,
			e.touches[0].clientY
		);
		this.dragXOffset = x - this.draggedObject.x;
		this.dragYOffset = y - this.draggedObject.y;
		this.dragXOriginal = this.draggedObject.x;
		this.dragYOriginal = this.draggedObject.y;
	}

	private onDragOver(e: DragEvent) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer!.dropEffect = 'copy';
	}

	private onSpriteDragMove(e: MouseEvent | TouchEvent) {
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
				this.$store.dispatch('objects/setPosition', {
					id: this.draggedObject!.id,
					x,
					y,
				} as ISetObjectPositionMutation);
			});
		}
	}

	private async onDrop(e: DragEvent) {
		e.stopPropagation();
		e.preventDefault();

		if (!e.dataTransfer) return;

		for (const item of e.dataTransfer.items) {
			if (item.kind === 'file' && item.type.match(/image.*/)) {
				const name = 'dropCustomAsset' + ++this.dropSpriteCount;
				const url = registerAsset(name, item.getAsFile()!);

				this.vuexHistory.transaction(async () => {
					await this.$store.dispatch('objects/createSprite', {
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
	}

	private onSpriteDrop(e: MouseEvent | TouchEvent) {
		if (this.draggedObject) {
			if ('TouchEvent' in window && e instanceof TouchEvent) {
				this.dropPreventClick = false;
			}
			this.draggedObject = null;
		}
	}

	private onMouseEnter(e: MouseEvent) {
		if (e.buttons !== 1) {
			this.draggedObject = null;
		}
	}
}
</script>

<style lang="scss"></style>
