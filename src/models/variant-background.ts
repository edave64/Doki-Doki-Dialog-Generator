import { IBackground } from './background';
import { RenderContext } from '@/renderer/rendererContext';
import { getAAsset } from '@/asset-manager';
import { IAsset } from '@/store/content';

export class VariantBackground implements IBackground {
	public constructor(
		public readonly name: string,
		public readonly variant: IAsset[],
		public readonly flip: boolean = false
	) {}

	public async render(rx: RenderContext): Promise<void> {
		const assets = await Promise.all(
			this.variant.map(img => getAAsset(img, rx.hq))
		);
		for (const asset of assets) {
			rx.drawImage({ image: asset, x: 0, y: 0, flip: this.flip });
		}
	}
}
