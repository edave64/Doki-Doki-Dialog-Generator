import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { VariantBackground } from './variant-background';

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
		public installed: boolean = false
	) {
		this.path = (custom ? '' : '/backgrounds/') + path;
	}

	public async render(rx: RenderContext): Promise<void> {
		rx.drawImage({
			image: await getAsset(this.path, rx.hq),
			x: 0,
			y: 0,
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
