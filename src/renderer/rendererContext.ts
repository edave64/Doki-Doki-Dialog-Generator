export class RenderContext {
	public constructor(
		private fsCtx: CanvasRenderingContext2D,
		public readonly hq: boolean,
		public readonly preview: boolean
	) {}

	public drawText(
		text: string,
		x: number,
		y: number,
		align: CanvasTextAlign,
		w: number = 1,
		col: string = 'white',
		ocol: string | null = '#533643',
		font: string = '20px aller'
	) {
		this.fsCtx.fillStyle = col;
		if (ocol) this.fsCtx.strokeStyle = ocol;
		this.fsCtx.lineWidth = 2 * w;
		this.fsCtx.textAlign = align;
		this.fsCtx.font = font;
		this.fsCtx.lineJoin = 'round';

		if (ocol) this.fsCtx.strokeText(text, x, y);
		this.fsCtx.fillText(text, x, y);
	}

	public drawImage(
		image: HTMLImageElement,
		x: number,
		y: number,
		width?: number,
		height?: number,
		flip: boolean = false
	): void {
		this.fsCtx.save();

		if (flip) this.fsCtx.scale(-1, 1);

		if (width && height) {
			this.fsCtx.drawImage(image, x, y, width!, height!);
		} else {
			this.fsCtx.drawImage(image, x, y!);
		}

		this.fsCtx.restore();
	}

	public drawRectOutline(
		x: number,
		y: number,
		w: number,
		h: number,
		style: string,
		strokeWidth: number
	) {
		this.fsCtx.beginPath();
		this.fsCtx.rect(x, y, w, h);
		this.fsCtx.strokeStyle = style;
		this.fsCtx.lineWidth = strokeWidth;
		this.fsCtx.stroke();
	}

	public measureText(str: string): TextMetrics {
		return this.fsCtx.measureText(str);
	}
}
