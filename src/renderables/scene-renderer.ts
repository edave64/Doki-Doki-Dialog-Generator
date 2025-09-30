import { getBuildInAsset } from '@/asset-manager';
import { SelectedState } from '@/constants/shared';
import { Renderer } from '@/renderer/renderer';
import { RenderContext } from '@/renderer/renderer-context';
import type { GenObject } from '@/store/object-types/object';
import type { Panel } from '@/store/panels';
import { state } from '@/store/root';
import type { Viewport } from '@/store/viewports';
import { UnreachableCaseError, type DeepReadonly } from 'ts-essentials';
import { Background, color, type IBackgroundRenderer } from './background';
import { Character } from './character';
import { Choice } from './choices';
import { Notification } from './notification';
import { Poem } from './poem';
import { Renderable } from './renderable';
import { Sprite } from './sprite';
import { TextBox } from './textbox';

/**
 * Renders a full panel, including the background and all objects
 */
export class SceneRenderer {
	// Support for browsers without :focus-visible
	public static FocusProp: string =
		typeof CSS !== 'undefined' && CSS.supports('selector(:focus-visible)')
			? ':focus-visible'
			: ':focus';

	private renderObjectCache = new Map<
		GenObject['id'],
		Renderable<GenObject>
	>();
	private renderer: Renderer;
	private _disposed: boolean = false;

	public constructor(
		private _panelId: Panel['id'],
		readonly canvasWidth: number,
		readonly canvasHeight: number,
		readonly viewport?: Viewport
	) {
		this.renderer = new Renderer(canvasWidth, canvasHeight);
	}

	public get panelId(): Panel['id'] {
		return this._panelId;
	}

	public setPanelId(panelId: Panel['id']): void {
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

	public objectsAt(x: number, y: number): GenObject['id'][] {
		const point = new DOMPointReadOnly(x, y);
		return this.getRenderObjects()
			.filter((renderObject) => renderObject.hitTest(point))
			.map((renderObject) => renderObject.id);
	}

	public getLastRenderObject(
		id: GenObject['id']
	): Renderable<GenObject> | null {
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

		const promises = renderables
			.map((x) => x.prepareRender(!rx.hq))
			.filter((x) => x !== undefined);
		if (promises.length > 0) {
			await Promise.all(promises);
		}

		const selection = this.viewport?.selection ?? null;
		const links = new Set<GenObject['id']>();
		if (selection !== null) fetchLinks(selection, links);
		const focusedObjId = document
			.querySelector(SceneRenderer.FocusProp)
			?.getAttribute('data-obj-id');
		for (const object of renderables) {
			const selected = selection === object.id;
			const focused = focusedObjId === '' + object.id;
			object.render(
				rx.fsCtx,
				(selected
					? SelectedState.Selected
					: links.has(object.id)
						? SelectedState.Indirectly
						: SelectedState.None) +
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

		function fetchLinks(
			objId: GenObject['id'],
			links: Set<GenObject['id']>
		): void {
			links.add(objId);

			for (const obj of renderables.filter((x) => x.linkedTo === objId)) {
				fetchLinks(obj.id, links);
			}
		}
	}

	private getRenderObjects(): Renderable<GenObject>[] {
		const objectsState = state.panels.panels[this.panelId];
		const order = [...objectsState.lowerOrder, ...objectsState.topOrder];
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
						renderObject = new Sprite(obj);
						break;
					case 'character': {
						renderObject = new Character(obj);
						break;
					}
					case 'textBox':
						renderObject = new TextBox(obj);
						break;
					case 'choice':
						renderObject = new Choice(obj);
						break;
					case 'notification':
						renderObject = new Notification(obj);
						break;
					case 'poem':
						renderObject = new Poem(obj);
						break;
					default:
						throw new UnreachableCaseError(type);
				}
				this.renderObjectCache.set(id, renderObject);
			}
			return renderObject!;
		});
	}

	private get panel(): DeepReadonly<Panel> | undefined {
		return state.panels.panels[this.panelId];
	}

	private getBackgroundRenderer(): IBackgroundRenderer | null {
		const panel = this.panel!;
		switch (panel.background.current) {
			case 'buildin.static-color':
				color.color = panel.background.color;
				return color;
			default: {
				const lookup = state.content.backgrounds;
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

	private drawDebugZoom(
		rx: RenderContext,
		x: number,
		y: number,
		w: number,
		h: number,
		zoom = 7
	) {
		const section = rx.fsCtx.getImageData(x, y, w, h);
		const img = document.createElement('canvas');
		img.width = w;
		img.height = h;
		const subCtx = img.getContext('2d')!;
		subCtx.putImageData(section, 0, 0);
		rx.fsCtx.imageSmoothingEnabled = false;
		rx.fsCtx.drawImage(img, 0, 0, w * zoom, h * zoom);
	}
}
