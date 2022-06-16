import { IAsset } from './asset';

export class ErrorAsset implements IAsset {
	public readonly width = 0;
	public readonly height = 0;

	paintOnto(fsCtx: CanvasRenderingContext2D): void {
		// Maybe paint something?
	}
}
