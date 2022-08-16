export interface IAsset {
	paintOnto(
		fsCtx: CanvasRenderingContext2D,
		opts?: { x?: number; y?: number; w?: number; h?: number }
	): void;
	width: number;
	height: number;
}
