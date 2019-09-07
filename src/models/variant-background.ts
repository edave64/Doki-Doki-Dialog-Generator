import { IBackground } from './background';
import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { nsfwArraySeeker } from './seekers';

type VariantParam =
	| string[]
	| {
			nsfw: boolean;
			images: string[];
	  };

interface IVariant {
	nsfw: boolean;
	images: string[];
}

export class VariantBackground implements IBackground {
	public readonly path: string;
	public flip: boolean = false;
	public readonly variants: IVariant[];
	private variantI: number = 0;

	public constructor(
		public readonly name: string,
		readonly basefolder: string,
		variants: VariantParam[],
		public readonly nsfw = false
	) {
		this.variants = variants.map(variant => {
			if (variant instanceof Array) {
				return {
					images: variant.map(img => (basefolder + img).replace(/\/+/g, '/')),
					nsfw: false,
				};
			}
			return {
				images: variant.images.map(img =>
					(basefolder + img).replace(/\/+/g, '/')
				),
				nsfw: variant.nsfw,
			};
		});
		this.path = this.variants[0].images[0];
	}

	public get variant(): number {
		return this.variantI;
	}

	public hasVariants(nsfw: boolean): boolean {
		return (
			this.variants.filter(variant => {
				return !variant.nsfw || nsfw;
			}).length > 1
		);
	}

	public seekVariant(delta: 1 | -1, nsfw: boolean) {
		this.variantI = nsfwArraySeeker(this.variants, this.variantI, delta, nsfw);
	}

	public async render(rx: RenderContext): Promise<void> {
		const assets = await Promise.all(
			this.variants[this.variantI].images.map(img => getAsset(img, rx.hq))
		);
		for (const asset of assets) {
			rx.drawImage({ image: asset, x: 0, y: 0, flip: this.flip });
		}
	}
}
