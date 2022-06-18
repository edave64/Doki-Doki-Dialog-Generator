import { DeepReadonly } from 'vue';
import { IAsset } from './asset';

export class ImageAsset implements IAsset {
	public readonly width: number;
	public readonly height: number;

	constructor(public readonly html: HTMLImageElement) {
		this.width = html.width;
		this.height = html.height;
	}

	paintOnto(fsCtx: CanvasRenderingContext2D): void {
		const w = this.width;
		const h = this.height;
		fsCtx.drawImage(this.html as HTMLImageElement, -w / 2, -h / 2, w, h);
	}
}
