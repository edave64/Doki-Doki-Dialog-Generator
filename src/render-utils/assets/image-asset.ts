import { DeepReadonly } from 'vue';
import { IAsset } from './asset';

export class ImageAsset implements IAsset {
	public readonly width: number;
	public readonly height: number;

	constructor(public readonly html: HTMLImageElement) {
		this.width = html.width;
		this.height = html.height;
	}

	paintOnto(
		fsCtx: CanvasRenderingContext2D,
		opts: { x?: number; y?: number; w?: number; h?: number } = {}
	): void {
		const { w, h } = {
			w: this.width,
			h: this.height,
			...opts,
		};
		const { x, y } = {
			x: -w / 2,
			y: -h / 2,
			...opts,
		};
		fsCtx.drawImage(this.html as HTMLImageElement, x, y, w, h);
	}
}
