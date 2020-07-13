import { RenderContext } from '@/renderer/rendererContext';
import { getAAsset } from '@/asset-manager';
import { screenWidth, screenHeight } from '@/constants/base';
import { IAsset } from '@/store/content';
import { ScalingModes } from '@/store/panels';
import { DeepReadonly } from '@/util/readonly';
import { IRenderable, IHitbox } from './renderable';

export class Background implements IRenderable {
	public constructor(
		public readonly id: string,
		public readonly assets: DeepReadonly<IAsset[]>,
		public readonly flip: boolean,
		public readonly scale: ScalingModes
	) {}

	public updatedContent(): void {}

	public async render(selected: boolean, rx: RenderContext): Promise<void> {
		const images = await Promise.all(
			this.assets.map(asset => getAAsset(asset, rx.hq))
		);
		for (const image of images) {
			if (!(image instanceof HTMLImageElement)) return;
			let x = 0;
			let y = 0;
			let w = image.width;
			let h = image.height;

			switch (this.scale) {
				case ScalingModes.None:
					x = screenWidth / 2 - w / 2;
					y = screenHeight / 2 - h / 2;
					break;
				case ScalingModes.Stretch:
					w = screenWidth;
					h = screenHeight;
					break;
				case ScalingModes.Cover:
					const ratio = w / h;
					const screenRatio = screenWidth / screenHeight;

					if (ratio > screenRatio) {
						h = screenHeight;
						w = h * ratio;
					} else {
						w = screenWidth;
						h = w / ratio;
					}

					x = screenWidth / 2 - w / 2;
					y = screenHeight / 2 - h / 2;
			}

			rx.drawImage({
				image,
				x,
				y,
				w,
				h,
				flip: this.flip,
			});
		}
	}
	public hitTest(hx: number, hy: number): boolean {
		return true;
	}
	public getHitbox(): IHitbox {
		return {
			x0: 0,
			y0: 0,
			x1: screenWidth,
			y1: screenHeight,
		};
	}
}

export const color = {
	id: 'buildin.static-color',
	name: 'Static color',
	color: '#000000',

	updatedContent(): void {},

	async render(selected: boolean, rx: RenderContext): Promise<void> {
		rx.drawRect({
			x: 0,
			y: 0,
			w: screenWidth,
			h: screenHeight,
			fill: { style: this.color },
		});
	},

	hitTest() {
		return true;
	},

	getHitbox() {
		return {
			x0: 0,
			y0: 0,
			x1: screenWidth,
			y1: screenHeight,
		};
	},
};

export const transparent = {
	id: 'buildin.transparent',
	name: 'Transparent',
	// tslint:disable-next-line: no-empty
	async render(selected: boolean, rx: RenderContext) {},

	hitTest() {
		return true;
	},

	getHitbox() {
		return {
			x0: 0,
			y0: 0,
			x1: screenWidth,
			y1: screenHeight,
		};
	},
};
