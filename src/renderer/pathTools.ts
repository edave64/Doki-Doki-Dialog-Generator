export function roundedRectangle(
	ctx: CanvasPath,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number
) {
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
	if (w < 2 * r) r = w / 2;
	if (h < 2 * r) r = h / 2;
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.lineTo(x + w, y + h);
	ctx.lineTo(x, y + h);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}
