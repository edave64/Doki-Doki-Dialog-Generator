import { RenderAbortedException } from './renderAbortedException';
import { Renderer } from './renderer';
import { ErrorAsset } from '@/render-utils/assets/error-asset';
import { SpriteFilter } from '@/store/sprite_options';
import { IAsset } from '@/render-utils/assets/asset';
import { DeepReadonly } from 'ts-essentials';

export type CompositeModes =
	| 'source-over'
	| 'source-in'
	| 'source-out'
	| 'source-atop'
	| 'destination-over'
	| 'destination-in'
	| 'destination-out'
	| 'destination-atop'
	| 'lighter'
	| 'copy'
	| 'xor'
	| 'multiply'
	| 'screen'
	| 'overlay'
	| 'darken'
	| 'lighten'
	| 'color-dodge'
	| 'color-burn'
	| 'hard-light'
	| 'soft-light'
	| 'difference'
	| 'exclusion'
	| 'hue'
	| 'saturation'
	| 'color'
	| 'luminosity';

export class RenderContext {
	private aborted: boolean = false;

	private constructor(
		private canvas: HTMLCanvasElement,
		public readonly fsCtx: CanvasRenderingContext2D,
		public readonly hq: boolean,
		public readonly preview: boolean
	) {}

	public static make(
		canvas: HTMLCanvasElement,
		hq: boolean,
		preview: boolean
	): RenderContext {
		return new RenderContext(canvas, canvas.getContext('2d')!, hq, preview);
	}

	public static makeWithContext(
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D,
		hq: boolean,
		preview: boolean
	): RenderContext {
		return new RenderContext(canvas, context, hq, preview);
	}

	public drawText(
		params: { text: string; align?: CanvasTextAlign; font?: string } & IRPos &
			IOOutline &
			IOFill
	) {
		if (this.aborted) throw new RenderAbortedException();
		this.fsCtx.save();

		const {
			font,
			align,
			x = 0,
			y = 0,
			text = '',
		} = {
			...{
				font: '20px aller',
				align: 'left' as CanvasTextAlign,
			},
			...params,
		};

		this.fsCtx.lineJoin = 'round';
		this.fsCtx.textAlign = align;
		this.fsCtx.font = font;

		if (params.outline) {
			this.fsCtx.strokeStyle = params.outline.style;
			this.fsCtx.lineWidth = params.outline.width;
			this.fsCtx.strokeText(text, x, y);
		}

		if (params.fill) {
			this.fsCtx.fillStyle = params.fill.style;
			this.fsCtx.fillText(text, x, y);
		}

		this.fsCtx.restore();
	}

	public measureText(
		params: {
			text: string;
			align?: CanvasTextAlign;
			font?: string;
		} & IOOutline &
			IOFill
	): TextMetrics {
		if (this.aborted) throw new RenderAbortedException();
		this.fsCtx.save();

		const {
			font,
			align,
			text = '',
		} = {
			...{
				font: '20px aller',
				align: 'left' as CanvasTextAlign,
			},
			...params,
		};

		this.fsCtx.lineJoin = 'round';
		this.fsCtx.textAlign = align;
		this.fsCtx.font = font;

		if (params.outline) {
			this.fsCtx.strokeStyle = params.outline.style;
			this.fsCtx.lineWidth = params.outline.width;
		}

		if (params.fill) {
			this.fsCtx.fillStyle = params.fill.style;
		}
		const ret = this.fsCtx.measureText(text);
		this.fsCtx.restore();
		return ret;
	}

	public drawImage(
		params: {
			image: IAsset | Renderer;
			flip?: boolean;
			composite?: CompositeModes;
		} & IRPos &
			IOSize &
			IOShadow &
			IOFilters &
			IORotation
	): void {
		if (this.aborted) throw new RenderAbortedException();
		if (params.image instanceof ErrorAsset) return;
		const { image, flip, x, y, w, h, filters, composite } = {
			flip: false,
			w: params.image.width,
			h: params.image.height,
			composite: 'source-over' as 'source-over',
			...params,
		};

		this.fsCtx.save();
		this.fsCtx.globalCompositeOperation = composite;

		if (filters) {
			// Safari fallback
			if (!(('filter' in this.fsCtx) as any)) {
				let opacityCombined = 1;
				for (const filter of filters) {
					if (filter.type === 'opacity') {
						opacityCombined *= filter.value;
					}
				}
				this.fsCtx.globalAlpha = opacityCombined;
			} else {
				const filterList: string[] = [];
				for (const filter of filters) {
					if (filter.type === 'drop-shadow') {
						filterList.push(
							`drop-shadow(${filter.offsetX}px ${filter.offsetY}px ${filter.blurRadius}px ${filter.color})`
						);
					} else if (filter.type === 'hue-rotate') {
						filterList.push(`hue-rotate(${filter.value}deg)`);
					} else if (filter.type === 'blur') {
						filterList.push(`blur(${filter.value}px)`);
					} else {
						filterList.push(`${filter.type}(${filter.value * 100}%)`);
					}
				}
				this.fsCtx.filter = filterList.join(' ');
			}
		}

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

		if (params.rotation) {
			const rotX = params.rotationAnchor ? params.rotationAnchor.x : 0;
			const rotY = params.rotationAnchor ? params.rotationAnchor.y : 0;
			if (params.rotationAnchor) {
				this.fsCtx.translate(rotX, rotY);
			}
			//this.fsCtx.fillRect(-10, -1, 21, 3);
			this.fsCtx.rotate(params.rotation);
			if (params.rotationAnchor) {
				this.fsCtx.translate(-rotX, -rotY);
			}
		}

		this.fsCtx.translate(x + w / 2, y + h / 2);
		this.fsCtx.scale(flip ? -1 : 1, 1);
		image.paintOnto(this.fsCtx, { x: -w / 2, y: -h / 2, w, h });
		this.fsCtx.restore();
		this.fsCtx.globalCompositeOperation = 'source-over';
	}

	public drawRect({
		x,
		y,
		w,
		h,
		outline,
		fill,
		composition,
	}: IRPos & IRSize & IOOutline & IOFill & IOComposition) {
		if (this.aborted) throw new RenderAbortedException();
		this.fsCtx.save();
		this.fsCtx.beginPath();
		this.fsCtx.rect(x, y, w, h);

		if (composition) {
			this.fsCtx.globalCompositeOperation = composition;
		}

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

	public drawPath({
		outline,
		fill,
		path,
	}: { path: (ctx: CanvasPath) => void } & IOOutline & IOFill) {
		if (this.aborted) throw new RenderAbortedException();
		this.fsCtx.save();
		this.fsCtx.beginPath();
		path(this.fsCtx);

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

	public patternFrom(
		image: HTMLImageElement | Renderer,
		repetition: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat' = 'repeat'
	): CanvasPattern {
		if (image instanceof Renderer) {
			image = (image as any).previewCanvas;
		}
		return this.fsCtx.createPattern(
			image as any as CanvasImageSource,
			repetition
		)!;
	}

	public async customTransform(
		transform: (transformContext: CanvasRenderingContext2D) => Promise<void>,
		render: (rx: RenderContext) => Promise<void>
	) {
		this.fsCtx.save();
		await transform(this.fsCtx);
		await render(this);
		this.fsCtx.restore();
	}

	public linearGradient(
		x0: number,
		y0: number,
		x1: number,
		y1: number
	): CanvasGradient {
		return this.fsCtx.createLinearGradient(x0, y0, x1, y1);
	}

	public applyFilters(filters: DeepReadonly<SpriteFilter[]>) {
		if (filters.length === 0) return;
		// Safari fallback
		this.fsCtx.save();
		let opacityCombined = 1;
		for (const filter of filters) {
			if (filter.type === 'opacity') {
				opacityCombined *= filter.value;
			}
		}
		if ('filter' in this.fsCtx) {
			const filterList: string[] = [];
			for (const filter of filters) {
				if (filter.type === 'opacity') continue;
				if (filter.type === 'drop-shadow') {
					filterList.push(
						`drop-shadow(${filter.offsetX}px ${filter.offsetY}px ${filter.blurRadius}px ${filter.color})`
					);
				} else if (filter.type === 'hue-rotate') {
					filterList.push(`hue-rotate(${filter.value}deg)`);
				} else if (filter.type === 'blur') {
					filterList.push(`blur(${filter.value}px)`);
				} else {
					filterList.push(`${filter.type}(${filter.value * 100}%)`);
				}
			}
			this.fsCtx.filter = filterList.join(' ');
		}

		this.fsCtx.drawImage(this.canvas, 0, 0);

		if (opacityCombined !== 1) {
			this.fsCtx.globalCompositeOperation = 'destination-atop';
			this.fsCtx.fillStyle = `rgba(0,0,0,${opacityCombined})`;
			this.fsCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.fsCtx.globalCompositeOperation = 'source-over';
		}

		if ('filter' in this.fsCtx) {
			this.fsCtx.filter = 'none';
		}
		this.fsCtx.restore();
	}

	public abort(): void {
		this.aborted = true;
	}
}

export interface IShadow {
	readonly blur?: number;
	readonly color?: string;
	readonly offsetX?: number;
	readonly offsetY?: number;
}

export interface IOutline {
	readonly style: string;
	readonly width: number;
}

export interface IFill {
	readonly style: string | CanvasGradient | CanvasPattern;
}

interface IOShadow {
	readonly shadow?: IShadow;
}

interface IOComposition {
	readonly composition?: CompositeModes;
}

interface IRPos {
	readonly x: number;
	readonly y: number;
}

interface IRSize {
	readonly w: number;
	readonly h: number;
}

interface IOSize {
	readonly w?: number;
	readonly h?: number;
}

interface IOOutline {
	readonly outline?: IOutline;
}
interface IOFilters {
	readonly filters?: DeepReadonly<SpriteFilter[]>;
}

interface IORotation {
	readonly rotation?: number;
	readonly rotationAnchor?: {
		readonly x: number;
		readonly y: number;
	};
}

interface IOFill {
	readonly fill?: IFill;
}
