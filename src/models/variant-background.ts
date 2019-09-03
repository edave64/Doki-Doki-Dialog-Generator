import { IBackground } from './background';
import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';

export class VariantBackground implements IBackground {
	public readonly path: string;
	private variantI: number = 0;

	public constructor(
		public readonly name: string,
		readonly basefolder: string,
		public readonly variants: string[][]
	) {
		this.variants = variants.map(variant =>
			variant.map(img => (basefolder + img).replace(/\/+/g, '/'))
		);
		this.path = this.variants[0][0];
	}

	public get variant(): number {
		return this.variantI;
	}

	public set variant(val: number) {
		if (val < 0) {
			val = this.variants.length + val;
		}
		if (val >= this.variants.length) {
			val = this.variants.length - val;
		}
		this.variantI = val;
	}

	public async render(rx: RenderContext): Promise<void> {
		const assets = await Promise.all(
			this.variants[this.variantI].map(img => getAsset(img, rx.hq))
		);
		for (const asset of assets) {
			rx.drawImage({ image: asset, x: 0, y: 0 });
		}
	}
}
