import { IAsset } from './asset';

export class MissingAsset implements IAsset {
	paintOnto(fsCtx: CanvasRenderingContext2D): void {
		fsCtx.fillRect(-15, -15, 15, 15);
		fsCtx.fillText('Missing asset!', 0, 0);
	}
	width: number = 30;
	height: number = 30;
}
