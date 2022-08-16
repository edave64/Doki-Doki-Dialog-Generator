import { Store } from 'vuex';
import { IRootState } from '@/store';
import { Background, color, IBackgroundRenderer } from './background';
import { IPanel } from '@/store/panels';
import { DeepReadonly, UnreachableCaseError } from 'ts-essentials';
import { ISprite } from '@/store/objectTypes/sprite';
import { Sprite } from './sprite';
import { Character } from './character';
import { getData, ICharacter } from '@/store/objectTypes/characters';
import { ITextBox } from '@/store/objectTypes/textbox';
import { TextBox } from './textbox';
import { Choice } from './choices';
import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { Renderer } from '@/renderer/renderer';
import { BackgroundLookup } from '@/store/content';
import { IChoices } from '@/store/objectTypes/choices';
import { INotification } from '@/store/objectTypes/notification';
import { Notification } from '@/renderables/notification';
import { Poem } from './poem';
import { IPoem } from '@/store/objectTypes/poem';
import { IObject } from '@/store/objects';
import { OffscreenRenderable } from './offscreenRenderable';

export class SceneRenderer {
	private renderObjectCache = new Map<
		IObject['id'],
		OffscreenRenderable<IObject>
	>();
	private lCurrentlyRendering = false;
	private renderer: Renderer;

	public constructor(
		private store: Store<DeepReadonly<IRootState>>,
		private panelId: IPanel['id'],
		readonly canvasWidth: number,
		readonly canvasHeight: number
	) {
		this.renderer = new Renderer(canvasWidth, canvasHeight);
	}

	public render(hq: boolean, preview: boolean): Promise<boolean> {
		if (!this.panel) return Promise.resolve(false);
		return this.renderer.render(this.renderCallback.bind(this), hq, preview);
	}

	public download(): Promise<string> {
		const date = new Date();
		const filename = `panel-${[
			date.getFullYear(),
			`${date.getMonth() + 1}`.padStart(2, '0'),
			`${date.getDate()}`.padStart(2, '0'),
			`${date.getHours()}`.padStart(2, '0'),
			`${date.getMinutes()}`.padStart(2, '0'),
			`${date.getSeconds()}`.padStart(2, '0'),
		].join('-')}.png`;
		return this.renderer.download(this.renderCallback.bind(this), filename);
	}

	public get currentlyRendering() {
		return this.lCurrentlyRendering;
	}

	public paintOnto(
		c: CanvasRenderingContext2D,
		opts: { x: number; y: number; w?: number; h?: number }
	) {
		this.renderer.paintOnto(c, opts);
	}

	public objectsAt(x: number, y: number): IObject['id'][] {
		return this.getRenderObjects()
			.filter((renderObject) => renderObject.hitTest(x, y))
			.map((renderObject) => renderObject.id);
	}

	private async renderCallback(rx: RenderContext): Promise<void> {
		this.lCurrentlyRendering = true;
		try {
			rx.fsCtx.imageSmoothingEnabled = true;
			rx.fsCtx.imageSmoothingQuality = rx.hq ? 'high' : 'low';

			await this.getBackgroundRenderer()?.render(rx);

			const selection = this.store.state.ui.selection;
			for (const object of this.getRenderObjects()) {
				let selected = false;
				object.updatedContent(this.store, this.panelId);
				selected = selection === object.id;
				await object.render(selected, rx);
			}
			rx.applyFilters([...this.panel.filters]);
			if (rx.preview) {
				rx.drawImage({
					x: 0,
					y: 0,
					h: this.canvasHeight,
					w: this.canvasWidth,
					composite: 'destination-over',
					image: await getAsset('backgrounds/transparent'),
				});
			}
		} finally {
			this.lCurrentlyRendering = false;
		}
	}

	private getRenderObjects(): OffscreenRenderable<IObject>[] {
		const objectsState = this.store.state.panels.panels[this.panelId];
		const order = objectsState
			? [...objectsState.order, ...objectsState.onTopOrder]
			: [];
		const objects = objectsState.objects;
		const toUncache = Array.from(this.renderObjectCache.keys()).filter(
			(id) => !order.includes(id)
		);

		for (const id of toUncache) {
			this.renderObjectCache.delete(id);
		}

		return order.map((id) => {
			let renderObject = this.renderObjectCache.get(id);
			if (!renderObject) {
				const obj = objects[id];
				const type = obj.type;
				switch (type) {
					case 'sprite':
						renderObject = new Sprite(obj as DeepReadonly<ISprite>);
						break;
					case 'character':
						const char = obj as DeepReadonly<ICharacter>;
						renderObject = new Character(char, getData(this.store, char));
						break;
					case 'textBox':
						renderObject = new TextBox(obj as DeepReadonly<ITextBox>);
						break;
					case 'choice':
						renderObject = new Choice(obj as DeepReadonly<IChoices>);
						break;
					case 'notification':
						renderObject = new Notification(obj as DeepReadonly<INotification>);
						break;
					case 'poem':
						renderObject = new Poem(obj as DeepReadonly<IPoem>);
						break;
					default:
						throw new UnreachableCaseError(type);
				}
				this.renderObjectCache.set(id, renderObject);
			}
			return renderObject!;
		});
	}

	private get panel(): DeepReadonly<IPanel> {
		return this.store.state.panels.panels[this.panelId];
	}

	private getBackgroundRenderer(): IBackgroundRenderer | null {
		const panel = this.panel;
		switch (panel.background.current) {
			case 'buildin.static-color':
				color.color = panel.background.color;
				return color;
			default:
				const lookup = this.store.getters[
					'content/getBackgrounds'
				] as BackgroundLookup;
				const current = lookup.get(panel.background.current);
				if (!current) return null;
				const variant = current.variants[panel.background.variant];
				if (!variant) return null;
				return new Background(
					panel.background.current,
					variant,
					panel.background.flipped,
					panel.background.scaling,
					panel.background.composite,
					panel.background.filters
				);
		}
	}
}
