import { Store } from 'vuex';
import { IRootState } from '@/store';
import { IRenderable } from './renderable';
import { IBackground, color, Background } from './background';
import { IPanel } from '@/store/panels';
import { DeepReadonly } from '@/util/readonly';
import { ISprite } from '@/store/objectTypes/sprite';
import { Sprite } from './sprite';
import { Character } from './character';
import { ICharacter, getData } from '@/store/objectTypes/characters';
import { ITextBox } from '@/store/objectTypes/textbox';
import { TextBox } from './textbox';
import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { Renderer } from '@/renderer/renderer';
import leftPad from 'left-pad';

export class SceneRenderer {
	private renderObjectCache = new Map<string, IRenderable>();
	private state: DeepReadonly<IRootState>;
	private _currentlyRendering = false;
	private renderer: Renderer;

	public constructor(
		private store: Store<DeepReadonly<IRootState>>,
		private panelId: string,
		readonly canvasWidth: number,
		readonly canvasHeight: number
	) {
		this.state = store.state;
		this.renderer = new Renderer(canvasWidth, canvasHeight);
	}

	public render(hq: boolean): Promise<boolean> {
		return this.renderer.render(this.renderCallback.bind(this), hq);
	}

	public download(): Promise<string> {
		const date = new Date();
		const filename = `panel-${date.getFullYear()}-${leftPad(
			date.getMonth() + 1,
			2,
			'0'
		)}-${leftPad(date.getDate(), 2, '0')}-${leftPad(
			date.getHours(),
			2,
			'0'
		)}-${leftPad(date.getMinutes(), 2, '0')}-${leftPad(
			date.getSeconds(),
			2,
			'0'
		)}.png`;
		return this.renderer.download(this.renderCallback.bind(this), filename);
	}

	public get currentlyRendering() {
		return this._currentlyRendering;
	}

	public paintOnto(
		c: CanvasRenderingContext2D,
		x: number,
		y: number,
		w?: number,
		h?: number
	) {
		this.renderer.paintOnto(c, x, y, w, h);
	}

	public objectsAt(x: number, y: number): string[] {
		return this.getRenderObjects()
			.filter(renderObject => renderObject.hitTest(x, y))
			.map(renderObject => renderObject.id);
	}

	private async renderCallback(rx: RenderContext): Promise<void> {
		this._currentlyRendering = true;
		try {
			if (rx.preview) {
				rx.drawImage({
					x: 0,
					y: 0,
					image: await getAsset('backgrounds/transparent'),
				});
			}

			await this.getBackgroundRenderer()?.render(rx);
			/*
				await this.currentBackground.render(rx);
			}*/

			const selection = this.state.ui.selection;
			for (const object of this.getRenderObjects()) {
				await object.render(selection === object.id, rx);
			}
		} finally {
			this._currentlyRendering = false;
		}
	}

	private getRenderObjects() {
		const objectsState = this.state.objects.panels[this.panelId];
		const order = [...objectsState.order, ...objectsState.onTopOrder];
		const objects = this.state.objects.objects;
		const toUncache = Object.keys(this.renderObjectCache).filter(
			id => !order.includes(id)
		);

		for (const id of toUncache) {
			this.renderObjectCache.delete(id);
		}

		return order.map(id => {
			if (!this.renderObjectCache.has(id)) {
				const obj = objects[id];
				switch (obj.type) {
					case 'sprite':
						this.renderObjectCache.set(
							id,
							new Sprite(obj as DeepReadonly<ISprite>)
						);
						break;
					case 'character':
						const char = obj as DeepReadonly<ICharacter>;
						this.renderObjectCache.set(
							id,
							new Character(char, getData(this.store, char))
						);
						break;
					case 'textBox':
						this.renderObjectCache.set(
							id,
							new TextBox(obj as DeepReadonly<ITextBox>)
						);
						break;
				}
			}
			const renderObject = this.renderObjectCache.get(id)!;
			renderObject.obj = objects[id];
			return renderObject;
		});
	}

	private get panel(): DeepReadonly<IPanel> {
		return this.state.panels.panels[this.panelId];
	}

	private getBackgroundRenderer(): IBackground | null {
		const panel = this.panel;
		switch (panel.background.current) {
			case 'buildin.static-color':
				color.color = panel.background.color;
				return color;
			default:
				const current = this.state.content.current.backgrounds.find(
					background => background.id === panel.background.current
				)!;
				if (!current) return null;
				const variant = current.variants[panel.background.variant];
				if (!variant) return null;
				return new Background(
					variant,
					panel.background.flipped,
					panel.background.scaling
				);
		}
	}
}
