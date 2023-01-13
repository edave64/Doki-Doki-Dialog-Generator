import { IAsset } from './asset';
import MissingImage from '@/assets/missing_image.svg';
import { ImageAsset } from './image-asset';
import { getAssetByUrl } from '@/asset-manager';

let missing_image: ImageAsset | null = null;

setTimeout(
	() =>
		getAssetByUrl(MissingImage).then((x) => {
			if (x instanceof ImageAsset) missing_image = x;
		}),
	0
);

export class ErrorAsset implements IAsset {
	public readonly width = 300;
	public readonly height = 300;

	paintOnto(
		fsCtx: CanvasRenderingContext2D,
		opts: { x?: number; y?: number; w?: number; h?: number } = {}
	): void {
		if (missing_image) {
			missing_image.paintOnto(fsCtx, opts);
		}
	}
}
