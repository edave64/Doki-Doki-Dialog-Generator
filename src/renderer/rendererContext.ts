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
		params: { image: HTMLImageElement | Renderer; flip?: boolean } & IRPos &
			IOSize &
			IOShadow
	): void {
		const { image, flip, x, y, w, h } = {
			flip: false,
			w: params.image.width,
			h: params.image.height,
			...params,
		};

		this.fsCtx.save();

		if (params.shadow) {
			const shadow = params.shadow;
			if (shadow.color) {
				this.fsCtx.shadowColor = shadow.color;
			}
			if (shadow.blur) {
				this.fsCtx.shadowBlur = shadow.blur;
			}
			if (shadow.offsetX) {
				this.fsCtx.shadowOffsetX = shadow.offsetX;
			}
			if (shadow.offsetY) {
				this.fsCtx.shadowOffsetY = shadow.offsetY;
			}
		}

		this.fsCtx.translate(x + w / 2, y + h / 2);
		this.fsCtx.scale(flip ? -1 : 1, 1);

		if (image instanceof Renderer) {
			image.paintOnto(this.fsCtx, -w / 2, -h / 2, w, h);
		} else {
			this.fsCtx.drawImage(image, -w / 2, -h / 2, w, h);
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

const optSize = { w: 0, h: 0 };
const optShadow = {
	blur: 0,
	color: 'none',
	offsetX: 0,
	offsetY: 0,
};

export interface IShadow {
	blur?: number;
	color?: string;
	offsetX?: number;
	offsetY?: number;
}

interface IOShadow {
	shadow?: IShadow;
}

interface IRPos {
	x: number;
	y: number;
}

interface IRSize {
	w: number;
	h: number;
}

interface IOSize {
	w?: number;
	h?: number;
}
