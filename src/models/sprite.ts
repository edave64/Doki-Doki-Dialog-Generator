import { RenderContext } from '../renderer/rendererContext';
import { getAsset } from '../asset-manager';
import { IRenderable } from './renderable';

export class Sprite implements IRenderable {
	public infront: boolean = false;
	public x: number = 0;
	public y: number = 0;
	public width: number = 0;
	public height: number = 0;
	public flip: boolean = false;
	private asset: HTMLImageElement | null = null;
	private selected: boolean = false;

	public constructor(
		public readonly assetName: string,
		private readonly invalidator: Invalidator
	) {
		getAsset(assetName)
			.then(asset => {
				this.asset = asset;
				this.width = asset.width;
				this.height = asset.height;
				this.invalidator();
			})
			.catch(err => {
				console.error(`Failed to load asset: ${err}`);
			});
	}

	public select() {
		this.selected = true;
	}

	public unselect() {
		this.selected = false;
	}

	public async render(rx: RenderContext) {
		if (!this.asset) return;
		rx.drawImage({
			image: this.asset,
			x: this.x,
			y: this.y,
			w: this.width,
			h: this.height,
			shadow: this.selected ? { blur: 20, color: 'red' } : undefined,
			flip: this.flip,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		return hx - this.x <= this.width && hy - this.y <= this.height;
	}
}
