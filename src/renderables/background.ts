import { getAAsset } from '@/asset-manager';
import getConstants from '@/constants';
import { CompositeModes, RenderContext } from '@/renderer/renderer-context';
import { IAssetSwitch } from '@/store/content';
import { ScalingModes } from '@/store/panels';
import { SpriteFilter } from '@/store/sprite-options';
import { DeepReadonly, UnreachableCaseError } from 'ts-essentials';

export interface IBackgroundRenderer {
	render(rx: RenderContext): Promise<void>;
}

export class Background implements IBackgroundRenderer {
	public constructor(
		public readonly id: string,
		public readonly assets: DeepReadonly<IAssetSwitch[]>,
		public readonly flip: boolean,
		public readonly scale: ScalingModes,
		public readonly compositeMode: CompositeModes,
		public readonly filters: DeepReadonly<SpriteFilter[]>
	) {}

	public async render(rx: RenderContext): Promise<void> {
		const { screenWidth, screenHeight } = getConstants().Base;
		const images = await Promise.all(
			this.assets.map((asset) => getAAsset(asset, rx.hq))
		);
		for (const image of images) {
			let x = 0;
			let y = 0;
			let w = image.width;
			let h = image.height;
			const scale = this.scale;

			switch (scale) {
				case ScalingModes.None:
					x = screenWidth / 2 - w / 2;
					y = screenHeight / 2 - h / 2;
					break;
				case ScalingModes.Stretch:
					w = screenWidth;
					h = screenHeight;
					break;
				case ScalingModes.Cover: {
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
					break;
				}
				default:
					throw new UnreachableCaseError(scale);
			}

			rx.drawImage({
				image,
				x,
				y,
				w,
				h,
				flip: this.flip,
				composite: this.compositeMode,
				filters: this.filters,
			});
		}
	}
}

export const color = {
	id: 'buildin.static-color',
	name: 'Static color',
	color: '#000000',

	render(rx: RenderContext): Promise<void> {
		const { screenWidth, screenHeight } = getConstants().Base;
		rx.drawRect({
			x: 0,
			y: 0,
			w: screenWidth,
			h: screenHeight,
			fill: { style: this.color },
		});
		return Promise.resolve();
	},
};

export const transparent = {
	id: 'buildin.transparent',
	name: 'Transparent',
	async render(_rx: RenderContext) {},
};
