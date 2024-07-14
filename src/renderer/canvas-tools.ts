import type { SpriteFilter } from '@/store/sprite-options';
import type { DeepReadonly } from 'ts-essentials';

export function roundedRectangle(
	ctx: CanvasPath,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	if (w < 0) w = 0;
	if (h < 0) h = 0;
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

export function roundedTopRectangle(
	ctx: CanvasPath,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
	if (w < 0) w = 0;
	if (h < 0) h = 0;
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.lineTo(x + w, y + h);
	ctx.lineTo(x, y + h);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}

export function ctxScope(ctx: CanvasRenderingContext2D, callback: () => void) {
	ctx.save();
	try {
		callback();
	} finally {
		ctx.restore();
	}
}

export function ctxTranformScope(
	ctx: CanvasRenderingContext2D,
	callback: () => void
) {
	const transform = ctx.getTransform();
	try {
		callback();
	} finally {
		ctx.setTransform(transform);
	}
}

export function applyStyle(
	ctx: CanvasRenderingContext2D,
	params: { align?: CanvasTextAlign; font?: string } & IOOutline & IOFill
) {
	if (params.align) {
		ctx.textAlign = params.align;
	}
	if (params.font != null) {
		ctx.font = params.font;
	}
	if (params.fill) {
		ctx.fillStyle = params.fill.style;
	}
	if (params.outline) {
		ctx.strokeStyle = params.outline.style;
		ctx.lineWidth = params.outline.width;
	}
}

export function applyFilter(
	ctx: CanvasRenderingContext2D,
	filters: DeepReadonly<SpriteFilter[]>
) {
	// Safari fallback - unknown is needed to avoid TS error
	if (!(('filter' in ctx) as unknown)) {
		let opacityCombined = 1;
		for (const filter of filters) {
			if (filter.type === 'opacity') {
				opacityCombined *= filter.value;
			}
		}
		ctx.globalAlpha *= opacityCombined;
	} else {
		let filterStr = '';
		for (const filter of filters) {
			if (filter.type === 'drop-shadow') {
				filterStr += ` drop-shadow(${filter.offsetX}px ${filter.offsetY}px ${filter.blurRadius}px ${filter.color})`;
			} else if (filter.type === 'hue-rotate') {
				filterStr += ` hue-rotate(${filter.value}deg)`;
			} else if (filter.type === 'blur') {
				filterStr += ` blur(${filter.value}px)`;
			} else {
				filterStr += ` ${filter.type}(${filter.value * 100}%)`;
			}
		}
		ctx.filter =
			(ctx.filter === 'none' ? '' : ctx.filter) + filterStr.trimStart();
	}
}

interface IFill {
	readonly style: string | CanvasGradient | CanvasPattern;
}

interface IOOutline {
	readonly outline?: IOutline;
}

interface IOutline {
	readonly style: string;
	readonly width: number;
}

interface IOFill {
	readonly fill?: IFill;
}
