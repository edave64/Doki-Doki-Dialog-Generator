<template>
	<canvas
		id="scaled_display"
		ref="sd"
		height="720"
		width="1280"
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
import { VariantBackground } from '../models/variant-background';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { Renderer } from '@/renderer/renderer';
import { IRenderable } from '@/models/renderable';
import { IBackground, color } from '@/models/background';
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
import { ISetCurrentMutation } from '@/store/background';
import content from '@/store/content';

@Component({})
export default class Render extends Vue {
	public $store!: Store<IRootState>;

	private sdCtx: CanvasRenderingContext2D | undefined;

	private get selection(): string | null {
		return this.$store.state.ui.selection;
	}

	private renderer: Renderer = new Renderer();
	private currentlyRendering: boolean = false;

	private queuedRender: number | null = null;
	private showingLast: boolean = false;

	private dropSpriteCount = 0;
	private dropPreventClick = false;

	@Prop({ type: Number, default: 0 }) private readonly canvasWidth!: number;
	@Prop({ type: Number, default: 0 }) private readonly canvasHeight!: number;

	@State('lqRendering', { namespace: 'ui' })
	private readonly lqRendering!: boolean;

	public async blendOver(imageUrl: string): Promise<void> {
		const completed = await this.renderer.render(rc => {
			return new Promise((resolve, reject) => {
				const img = new Image();
				img.addEventListener('load', () => {
					rc.drawImage({
						image: img,
						x: 0,
						y: 0,
						w: 1280,
						h: 720,
					});
					resolve();
				});
				img.src = imageUrl;
			});
		}, true);
		if (completed) this.display();
	}

	public async download(): Promise<void> {
		const url = await this.renderer.download(this.renderCallback, 'panel.png');

		this.history.transaction(async () => {
			const oldUrl = this.$store.state.ui.lastDownload;

			this.$store.commit('ui/setLastDownload', url);
			if (oldUrl) {
				URL.revokeObjectURL(oldUrl);
			}
		});
	}

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get currentBackground(): IBackground | null {
		switch (this.$store.state.background.current) {
			case 'buildin.static-color':
				color.color = this.$store.state.background.color;
				return color;
			default:
				const current = this.$store.state.content.current.backgrounds.find(
					background =>
						background.label === this.$store.state.background.current
				)!;
				if (!current) return null;
				const variant = current.variants[this.$store.state.background.variant];
				if (!variant) return null;
				return new VariantBackground(
					current.label,
					variant,
					this.$store.state.background.flipped
				);
		}
	}

	private invalidateRender() {
		if (this.queuedRender) return;
		this.queuedRender = requestAnimationFrame(() => this.render_());
	}

	private async renderLoadingScreen(): Promise<void> {
		const completed = await this.renderer.render(async rc => {
			rc.drawText({
				text: 'Starting...',
				x: this.renderer.width / 2,
				y: this.renderer.height / 2,
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
		}, true);
		if (completed) this.display();
	}

	private async render_(): Promise<void> {
		if (this.queuedRender) {
			cancelAnimationFrame(this.queuedRender);
			this.queuedRender = null;
		}

		if (this.$store.state.unsafe) return;

		const completed = await this.renderer.render(
			this.renderCallback,
			!this.lqRendering
		);
		if (completed) {
			this.display();
		}
	}

	private async renderCallback(rx: RenderContext): Promise<void> {
		this.currentlyRendering = true;
		try {
			if (rx.preview) {
				rx.drawImage({
					x: 0,
					y: 0,
					image: await getAsset('backgrounds/transparent'),
				});
			}

			if (this.currentBackground) {
				await this.currentBackground.render(rx);
			}

			for (const object of this.renderObjects) {
				await object.render(this.selection === object.id, rx);
			}
		} finally {
			this.currentlyRendering = false;
		}
	}

	private async created(): Promise<void> {
		eventBus.subscribe(InvalidateRenderEvent, command => this.invalidateRender);
		this.$store.subscribe(this.invalidateRender);
	}

	private mounted(): void {
		const sd = this.$refs.sd as HTMLCanvasElement;
		this.sdCtx = sd.getContext('2d') || undefined;

		this.renderLoadingScreen();
		this.invalidateRender();
	}

	@Watch('canvasWidth')
	@Watch('canvasHeight')
	private display(): void {
		if (!this.sdCtx) return;
		this.showingLast = false;
		this.renderer.paintOnto(this.sdCtx, 0, 0, 1280, 720);
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

		const objects = this.objectsAt(sx, sy);

		const currentObjectIdx = objects.findIndex(
			obj => obj.id === this.selection
		);
		let selectedObject: IRenderable | null;

		if (currentObjectIdx === 0) {
			selectedObject = null;
		} else if (currentObjectIdx !== -1) {
			// Select the next lower character
			selectedObject = objects[currentObjectIdx - 1];
		} else {
			selectedObject = objects[objects.length - 1] || null;
		}

		this.$store.commit(
			'ui/setSelection',
			selectedObject ? selectedObject.id : null
		);
	}

	private objectsAt(x: number, y: number): IRenderable[] {
		return this.renderObjects.filter(renderObject =>
			renderObject.hitTest(x, y)
		);
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

			this.history.transaction(() => {
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

				this.history.transaction(async () => {
					await this.$store.dispatch('objects/createSprite', {
						asset: {
							hq: url,
							lq: url,
							sourcePack: 'dddg.generated.uploaded-sprites',
						},
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

	private renderObjectCache: { [id: string]: IRenderable } = {};
	private get renderObjects() {
		const objectsState = this.$store.state.objects;
		const order = [...objectsState.order, ...objectsState.onTopOrder];
		const objects = this.$store.state.objects.objects;
		const toUncache = Object.keys(this.renderObjectCache).filter(
			id => !order.includes(id)
		);

		for (const id of toUncache) {
			if (this.selection === id) {
				this.history.transaction(() => {
					this.$store.commit('ui/setSelection', id);
				});
			}
			this.$delete(this.renderObjectCache, id);
		}

		return order.map(id => {
			if (!this.renderObjectCache[id]) {
				const obj = objects[id];
				switch (obj.type) {
					case 'sprite':
						this.renderObjectCache[id] = new Sprite((obj as any) as ISprite);
						break;
					case 'character':
						this.renderObjectCache[id] = new Character(
							(obj as any) as ICharacter,
							this.$store
						);
						break;
					case 'textBox':
						this.renderObjectCache[id] = new TextBox((obj as any) as ITextBox);
						break;
				}
			}
			this.renderObjectCache[id].obj = objects[id];
			return this.renderObjectCache[id];
		});
	}
}
</script>

<style lang="scss"></style>
