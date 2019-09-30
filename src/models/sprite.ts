import { RenderContext } from '../renderer/rendererContext';
import { getAsset } from '../asset-manager';
import { IRenderable } from './renderable';
import { IDragable } from './dragable';
import { ErrorAsset } from './error-asset';
import { ISprite } from '@/store/objectTypes/sprite';

const BaseXPosition = 640;

export class Sprite implements IRenderable, IDragable {
	public readonly id: string;
	public get infront(): boolean {
		return this.obj.onTop;
	}
	public ratio: number = 0;
	public lockedRatio: boolean = true;
	private asset: HTMLImageElement | null = null;
	private selected: boolean = false;

	public constructor(
		public readonly obj: ISprite,
		private readonly invalidator: Invalidator
	) {
		this.id = obj.id;
		getAsset(obj.assetName)
			.then(asset => {
				if (asset instanceof ErrorAsset) {
					return;
				}
				this.asset = asset;
				this.ratio = this.obj.width / this.obj.height;
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
		const x = this.obj.x - this.obj.width / 2;
		rx.drawImage({
			image: this.asset,
			x,
			y: this.obj.y,
			w: this.obj.width,
			h: this.obj.height,
			shadow:
				this.selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			flip: this.obj.flip,
			opacity: this.obj.opacity,
		});
	}

	public hitTest(hx: number, hy: number): boolean {
		const hitX = hx - this.obj.x + this.obj.width / 2;
		const hitY = hy - this.obj.y;
		return (
			hitX >= 0 &&
			hitX <= this.obj.width &&
			hitY >= 0 &&
			hitY <= this.obj.height
		);
	}
}
