import { getBuildInAsset } from '@/asset-manager';
import { Renderer } from '@/renderer/renderer';
import { RenderContext } from '@/renderer/renderer-context';
import { IRootState } from '@/store';
import { BackgroundLookup } from '@/store/content';
import { getData, ICharacter } from '@/store/object-types/characters';
import { IChoices } from '@/store/object-types/choices';
import { INotification } from '@/store/object-types/notification';
import { IPoem } from '@/store/object-types/poem';
import { ISprite } from '@/store/object-types/sprite';
import { ITextBox } from '@/store/object-types/textbox';
import { IObject } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { DeepReadonly, UnreachableCaseError } from 'ts-essentials';
import { Store } from 'vuex';
import { Background, color, IBackgroundRenderer } from './background';
import { Character } from './character';
import { Choice } from './choices';
import { Notification } from './notification';
import { SelectedState } from './offscreen-renderable';
import { Poem } from './poem';
import { Renderable } from './renderable';
import { Sprite } from './sprite';
import { TextBox } from './textbox';

export class SceneRenderer {
	// Support for browsers without :focus-visible
	public static FocusProp: string =
		typeof CSS !== 'undefined' && CSS.supports('selector(:focus-visible)')
			? ':focus-visible'
			: ':focus';

	private renderObjectCache = new Map<IObject['id'], Renderable<IObject>>();
	private renderer: Renderer;
	private _disposed: boolean = false;

	public constructor(
		private store: Store<DeepReadonly<IRootState>>,
		private _panelId: IPanel['id'],
		readonly canvasWidth: number,
		readonly canvasHeight: number
	) {
		this.renderer = new Renderer(canvasWidth, canvasHeight);
	}

	public get panelId(): IPanel['id'] {
		return this._panelId;
	}

	public setPanelId(panelId: IPanel['id']): void {
		if (this._disposed) throw new Error('Disposed scene-renderer called');
		if (this._panelId === panelId) return;
		this._panelId = panelId;
		this.renderObjectCache.forEach((a) => {
			a.dispose();
		});
		this.renderObjectCache.clear();
	}

	public render(
		hq: boolean,
		preview: boolean,
		skipLocalCanvases: boolean
	): Promise<boolean> {
		if (this._disposed) throw new Error('Disposed scene-renderer called');
		if (!this.panel) return Promise.resolve(false);
		return this.renderer.render(
			this.renderCallback.bind(this, skipLocalCanvases),
			hq,
			preview
		);
	}

	public download(): Promise<string> {
		if (this._disposed) throw new Error('Disposed scene-renderer called');
		const date = new Date();
		const filename = `panel-${[
			date.getFullYear(),
			`${date.getMonth() + 1}`.padStart(2, '0'),
			`${date.getDate()}`.padStart(2, '0'),
			`${date.getHours()}`.padStart(2, '0'),
			`${date.getMinutes()}`.padStart(2, '0'),
			`${date.getSeconds()}`.padStart(2, '0'),
		].join('-')}.png`;
		return this.renderer.download(
			this.renderCallback.bind(this, true),
			filename
		);
	}

	public paintOnto(
		c: CanvasRenderingContext2D,
		opts: { x: number; y: number; w?: number; h?: number }
	) {
		this.renderer.paintOnto(c, opts);
	}

	public objectsAt(x: number, y: number): IObject['id'][] {
		const point = new DOMPointReadOnly(x, y);
		return this.getRenderObjects()
			.filter((renderObject) => renderObject.hitTest(point))
			.map((renderObject) => renderObject.id);
	}

	public getLastRenderObject(id: IObject['id']): Renderable<IObject> | null {
		return this.renderObjectCache.get(id) ?? null;
	}

	private async renderCallback(
		skipLocalCanvases: boolean,
		rx: RenderContext
	): Promise<void> {
		if (this._disposed) throw new Error('Disposed scene-renderer called');
		rx.fsCtx.imageSmoothingEnabled = true;
		rx.fsCtx.imageSmoothingQuality = rx.hq ? 'high' : 'low';

		await this.getBackgroundRenderer()?.render(rx);

		const renderables = this.getRenderObjects();
		const waiting: Map<IObject['id'], Array<Renderable<IObject>>> = new Map();
		const processed: Map<IObject['id'], DOMMatrixReadOnly> = new Map();

		for (const renderable of renderables) {
			const linked = renderable.linkedTo;
			let linkTransform = new DOMMatrixReadOnly();
			if (linked != null) {
				const lookupTransform = processed.get(linked);
				if (lookupTransform) {
					linkTransform = lookupTransform;
				} else {
					const waitList = waiting.get(linked);
					if (waitList) {
						waitList.push(renderable);
					} else {
						waiting.set(linked, [renderable]);
					}
					continue;
				}
			}
			prepareTransform(renderable, linkTransform);
		}

		if (waiting.size > 0) {
			console.warn('Not all renderables processed. Infinite loop?');
		}

		function prepareTransform(
			renderable: Renderable<IObject>,
			linkTransform: DOMMatrixReadOnly
		) {
			const newTransform = renderable.prepareTransform(linkTransform);
			processed.set(renderable.id, newTransform);
			const waitList = waiting.get(renderable.id);
			if (waitList) {
				for (const sub of waitList) {
					prepareTransform(sub, newTransform);
				}
				waiting.delete(renderable.id);
			}
		}

		const promises = renderables
			.map((x) => x.prepareRender(this.panel!, this.store, !rx.hq))
			.filter((x) => x !== undefined);
		if (promises.length > 0) {
			await Promise.all(promises);
		}

		const selection = this.store.state.ui.selection;
		for (const object of renderables) {
			const selected = selection === object.id;
			const focusedObj = document.querySelector(SceneRenderer.FocusProp);
			const focused =
				focusedObj?.getAttribute('data-obj-id') === '' + object.id;
			object.render(
				rx.fsCtx,
				(selected ? SelectedState.Selected : SelectedState.None) +
					(focused ? SelectedState.Focused : SelectedState.None),
				rx.preview,
				rx.hq,
				skipLocalCanvases
			);
		}
		rx.applyFilters([...this.panel!.filters]);
		if (rx.preview) {
			rx.drawImage({
				x: 0,
				y: 0,
				h: this.canvasHeight,
				w: this.canvasWidth,
				composite: 'destination-over',
				image: await getBuildInAsset('backgrounds/transparent'),
			});
		}
	}

	private getRenderObjects(): Renderable<IObject>[] {
		const objectsState = this.store.state.panels.panels[this.panelId];
		const order = [...objectsState.order, ...objectsState.onTopOrder];
		const objects = objectsState.objects;
		const toUncache = Array.from(this.renderObjectCache.keys()).filter(
			(id) => !order.includes(id)
		);

		for (const id of toUncache) {
			this.renderObjectCache.get(id)!.dispose();
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
					case 'character': {
						const char = obj as DeepReadonly<ICharacter>;
						renderObject = new Character(char, getData(this.store, char));
						break;
					}
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

	private get panel(): DeepReadonly<IPanel> | undefined {
		return this.store.state.panels.panels[this.panelId];
	}

	private getBackgroundRenderer(): IBackgroundRenderer | null {
		const panel = this.panel!;
		switch (panel.background.current) {
			case 'buildin.static-color':
				color.color = panel.background.color;
				return color;
			default: {
				const lookup = this.store.getters[
					'content/getBackgrounds'
				] as BackgroundLookup;
				const current = lookup.get(panel.background.current);
				if (!current) return null;
				const variant = current.variants[panel.background.variant];
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

	public get disposed(): boolean {
		return this._disposed;
	}

	public dispose(): void {
		this._disposed = true;
		this.renderer.dispose();
	}
}
