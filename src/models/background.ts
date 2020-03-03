import { RenderContext } from '@/renderer/rendererContext';
import { getAAsset } from '@/asset-manager';
import { screenWidth, screenHeight } from '@/constants/base';
import { IAsset } from '@/store/content';
import { ScalingModes } from '@/store/panels';
import { DeepReadonly } from '@/util/readonly';

export interface IBackground {
	render(rx: RenderContext): Promise<void>;
}

export class Background implements IBackground {
	public constructor(
		public readonly assets: DeepReadonly<IAsset[]>,
		public readonly flip: boolean,
		public readonly scale: ScalingModes
	) {}

	public async render(rx: RenderContext): Promise<void> {
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
}

export const color = {
	name: 'Static color',
	color: '#000000',

	async render(rx: RenderContext): Promise<void> {
		rx.drawRect({
			x: 0,
			y: 0,
			w: screenWidth,
			h: screenHeight,
			fill: { style: this.color },
		});
	},
};

export const transparent = {
	name: 'Transparent',
	// tslint:disable-next-line: no-empty
	async render(rx: RenderContext): Promise<void> {},
};
