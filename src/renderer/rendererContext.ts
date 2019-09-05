import { RenderAbortedException } from './renderAbortedException';
import { Renderer } from './renderer';
import { ErrorAsset } from '@/models/error-asset';

export class RenderContext {
	private aborted: boolean = false;

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
		if (this.aborted) throw new RenderAbortedException();
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
		params: {
			image: HTMLImageElement | ErrorAsset | Renderer;
			flip?: boolean;
		} & IRPos &
			IOSize &
			IOShadow
	): void {
		if (this.aborted) throw new RenderAbortedException();
		if (params.image instanceof ErrorAsset) return;
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
			this.fsCtx.drawImage(image as HTMLImageElement, -w / 2, -h / 2, w, h);
		}

		this.fsCtx.restore();
	}

	public drawRect({
		x,
		y,
		w,
		h,
		outline,
		fill,
	}: IRPos & IRSize & IOOutline & IOFill) {
		if (this.aborted) throw new RenderAbortedException();
		this.fsCtx.save();
		this.fsCtx.beginPath();
		this.fsCtx.rect(x, y, w, h);

		if (fill) {
			this.fsCtx.fillStyle = fill.style;
			this.fsCtx.fill();
		}
		if (outline) {
			this.fsCtx.strokeStyle = outline.style;
			this.fsCtx.lineWidth = outline.width;
			this.fsCtx.stroke();
		}
		this.fsCtx.restore();
	}

	public measureText(str: string): TextMetrics {
		if (this.aborted) throw new RenderAbortedException();
		return this.fsCtx.measureText(str);
	}

	public abort(): void {
		this.aborted = true;
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

export interface IOutline {
	style: string;
	width: number;
}

export interface IFill {
	style: string;
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

interface IOOutline {
	outline?: IOutline;
}

interface IOFill {
	fill?: IFill;
}
