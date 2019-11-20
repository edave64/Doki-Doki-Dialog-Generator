import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { VariantBackground } from './variant-background';
import { screenWidth, screenHeight } from './constants';

export interface IBackground {
	name: string;
	nsfw?: boolean;
	render(rx: RenderContext): Promise<void>;
}

export class Background implements IBackground {
	public readonly path: string;
	public flip: boolean = false;
	public constructor(
		path: string,
		public readonly name: string,
		public readonly nsfw: boolean = false,
		public readonly custom: boolean = false,
		public readonly scale: string = '',
		public installed: boolean = false
	) {
		this.path = (custom ? '' : '/backgrounds/') + path;
	}

	public async render(rx: RenderContext): Promise<void> {
		const image = await getAsset(this.path, rx.hq);
		if (!(image instanceof HTMLImageElement)) return;
		let x = 0;
		let y = 0;
		let w = image.width;
		let h = image.height;

		switch (this.scale) {
			case '':
				x = screenWidth / 2 - w / 2;
				y = screenHeight / 2 - h / 2;
				break;
			case 'stretch':
				w = screenWidth;
				h = screenHeight;
				break;
			case 'cover':
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

export const color = {
	name: 'Static color',
	color: '#000000',

	async render(rx: RenderContext): Promise<void> {
		rx.drawRect({ x: 0, y: 0, w: 1280, h: 720, fill: { style: this.color } });
	},
};

export const transparent = {
	name: 'Transparent',
	// tslint:disable-next-line: no-empty
	async render(rx: RenderContext): Promise<void> {},
};

export function nsfwFilter(background: IBackground) {
	if (
		background instanceof VariantBackground &&
		background.variants[background.variant].nsfw
	) {
		background.seekVariant(1, false);
	}
}
