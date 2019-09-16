import { RenderContext } from '../renderer/rendererContext';
import { getAsset } from '../asset-manager';
import { IRenderable } from './renderable';
import { IDragable } from './dragable';
import { ErrorAsset } from './error-asset';

const BaseXPosition = 640;

export class Sprite implements IRenderable, IDragable {
	public infront: boolean = false;
	public x: number = BaseXPosition;
	public y: number = 0;
	public width: number = 0;
	public height: number = 0;
	public ratio: number = 0;
	public lockedRatio: boolean = true;
	public flip: boolean = false;
	public opacity: number = 100;
	private asset: HTMLImageElement | null = null;
	private selected: boolean = false;

	public constructor(
		public readonly assetName: string,
		private readonly invalidator: Invalidator
	) {
		getAsset(assetName)
			.then(asset => {
				if (asset instanceof ErrorAsset) {
					return;
				}
				this.asset = asset;
				this.width = asset.width;
				this.height = asset.height;
				this.ratio = this.width / this.height;
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
		const x = this.x - this.width / 2;
		rx.drawImage({
			image: this.asset,
			x,
			y: this.y,
			w: this.width,
			h: this.height,
			shadow:
				this.selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			flip: this.flip,
			opacity: this.opacity,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		const hitX = hx - this.x;
		const hitY = hy - this.y;
		return hitX >= 0 && hitX <= this.width && hitY >= 0 && hitY <= this.height;
	}
}
