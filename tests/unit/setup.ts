// jsdom doesn't implement canvas contexts by default in Vitest; stub the minimum API used by the
// renderer stack so store tests can load modules without crashing on canvas initialization.
const stubContext = {
	save() {},
	restore() {},
	clearRect() {},
	fillRect() {},
	strokeRect() {},
	measureText() {
		return { width: 0 } as TextMetrics;
	},
	beginPath() {},
	closePath() {},
	moveTo() {},
	lineTo() {},
	stroke() {},
	fill() {},
	arc() {},
	translate() {},
	scale() {},
	rotate() {},
	skewX() {},
	skewY() {},
	setTransform() {},
	drawImage() {},
	clip() {},
	createLinearGradient() {
		return { addColorStop() {} } as CanvasGradient;
	},
	createRadialGradient() {
		return { addColorStop() {} } as CanvasGradient;
	},
	fillStyle: '',
	strokeStyle: '',
	font: '',
	textAlign: 'left' as CanvasTextAlign,
	lineJoin: 'miter' as CanvasLineJoin,
	lineWidth: 1,
	globalAlpha: 1,
	globalCompositeOperation: 'source-over',
	shadowBlur: 0,
	shadowColor: '',
	shadowOffsetX: 0,
	shadowOffsetY: 0,
} as unknown as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = function () {
	return stubContext;
} as typeof HTMLCanvasElement.prototype.getContext;
