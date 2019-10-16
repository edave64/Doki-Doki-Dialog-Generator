import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { ITextBox } from '@/store/objectTypes/textbox';
import { IRenderable } from './renderable';
import {
	NameboxTextStyle,
	ControlsTextStyle,
	ControlsTextDisabledStyle,
	TextBoxTextCorruptedYOffset,
	TextBoxTextCorruptedXOffset,
	TextBoxCorruptedStyle,
	TextBoxStyle,
	TextBoxCorruptedKerning,
	TextBoxKerning,
	TextBoxLineHeight,
	TextBoxWidth,
	NameboxHeight,
	TextBoxHeight,
	TextBoxCorruptedWidth,
	NameboxXOffset,
	NameboxWidth,
	NameboxTextYOffset,
	ControlsXHistoryOffset,
	ControlsXSkipOffset,
	ControlsXStuffOffset,
	ArrowXRightOffset,
	ArrowYBottomOffset,
	TextBoxTextYOffset,
	TextBoxTextXOffset,
	ControlsYBottomOffset,
	GlowRY,
	GlowRX,
} from './textBoxConstants';
import { Renderer } from '@/renderer/renderer';
import { roundedRectangle } from '@/renderer/pathTools';
import { RGBAColor } from '@/util/colors/rgb';
import { HSLAColor } from '@/util/colors/hsl';

export class TextBox implements IRenderable {
	public display: boolean = true;
	private lastVersion = -1;
	private lastX = 0;
	private lastY = 0;
	private lastH = 0;
	private lastW = 0;
	private localRenderer = new Renderer(1280, 720);

	public constructor(public obj: ITextBox) {}

	public get id() {
		return this.obj.id;
	}

	public hitTest(hx: number, hy: number): boolean {
		const w2 = TextBoxWidth / 2;
		const x1 = this.obj.x - w2;
		const x2 = x1 + TextBoxWidth;
		const y1 = this.obj.y;
		const y2 = y1 + NameboxHeight + TextBoxHeight;
		return x1 <= hx && x2 >= hx && y1 <= hy && y2 >= hy;
	}

	public async render(selected: boolean, rx: RenderContext) {
		if (
			this.lastVersion !== this.obj.version ||
			this.lastX !== this.obj.x ||
			this.lastY !== this.obj.y ||
			this.lastH !== this.obj.height ||
			this.lastW !== this.obj.width
		) {
			await this.updateLocalCanvas();
			this.lastVersion = this.obj.version;
			this.lastX = this.obj.x;
			this.lastY = this.obj.y;
		}

		rx.drawImage({
			image: this.localRenderer,
			x: 0,
			y: 0,
			flip: this.obj.flip,
			shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			opacity: this.obj.opacity,
		});
	}

	public async updateLocalCanvas() {
		await this.localRenderer.render(async rx => {
			const w = this.obj.style === 'custom' ? this.obj.width : TextBoxWidth;
			const h =
				this.obj.style === 'custom'
					? this.obj.height + NameboxHeight
					: TextBoxHeight + NameboxHeight;
			const w2 = w / 2;
			const x = this.obj.x - w2;
			const y = this.obj.y;

			await this.renderBackdrop(rx, x, y + NameboxHeight);

			const name = this.obj.talking;
			if (name) {
				rx.drawImage({
					image: await getAsset('namebox'),
					x: x + NameboxXOffset,
					y,
				});
				rx.drawText({
					x: x + NameboxXOffset + NameboxWidth / 2,
					y: y + NameboxTextYOffset,
					text: name,
					...NameboxTextStyle,
				});
			}

			this.renderText(rx, x, y);

			const bottom = y + h;
			const controlsY = bottom - ControlsYBottomOffset;
			const controlsCenter = x + w / 2;

			if (this.obj.controls) {
				rx.drawText({
					text: 'History',
					x: controlsCenter + ControlsXHistoryOffset,
					y: controlsY,
					...ControlsTextStyle,
				});
				rx.drawText({
					text: 'Skip',
					x: controlsCenter + ControlsXSkipOffset,
					y: controlsY,
					...(this.obj.skip ? ControlsTextStyle : ControlsTextDisabledStyle),
				});
				rx.drawText({
					text: 'Auto   Save   Load   Settings',
					x: controlsCenter + ControlsXStuffOffset,
					y: controlsY,
					...ControlsTextStyle,
				});
			}

			if (this.obj.continue) {
				rx.drawImage({
					image: await getAsset('next'),
					x: x + w - ArrowXRightOffset,
					y: bottom - ArrowYBottomOffset,
				});
			}
		});
	}

	private async renderBackdrop(
		rx: RenderContext,
		x: number,
		y: number
	): Promise<void> {
		if (this.obj.style === 'custom') {
			const hslColor = RGBAColor.fromCss(this.obj.customColor).toHSL();
			const dotPattern = new Renderer(47, 47);
			dotPattern.render(async (rx: RenderContext) => {
				const delta = new HSLAColor(
					0.004269293924466178,
					-0.01869158878504662,
					-0.039215686274509665,
					0
				);
				const fill = {
					style: hslColor
						.shift(delta)
						.toRgb()
						.toCss(),
				};

				rx.drawPath({
					path: ctx => {
						ctx.ellipse(0, 0, 9.5, 9.5, 0, 0, 2 * Math.PI);
					},
					fill,
				});
				rx.drawPath({
					path: ctx => {
						ctx.ellipse(47, 0, 9.5, 9.5, 0, 0, 2 * Math.PI);
					},
					fill,
				});
				rx.drawPath({
					path: ctx => {
						ctx.ellipse(0, 47, 9.5, 9.5, 0, 0, 2 * Math.PI);
					},
					fill,
				});
				rx.drawPath({
					path: ctx => {
						ctx.ellipse(47, 47, 9.5, 9.5, 0, 0, 2 * Math.PI);
					},
					fill,
				});
				rx.drawPath({
					path: ctx => {
						ctx.ellipse(23.5, 24.5, 9.5, 9.5, 0, 0, 2 * Math.PI);
					},
					fill,
				});
			}, true);
			rx.customTransform(
				ctx => {
					ctx.beginPath();
					roundedRectangle(
						ctx,
						x + 1.5,
						y + 1.5,
						this.obj.width - 3,
						this.obj.height - 3,
						12
					);
					ctx.clip();
				},
				subRx => {
					const h = this.obj.height;
					const w = this.obj.width;
					const gradient = subRx.linearGradient(x, y, x, y + h);
					const color = RGBAColor.fromHex(this.obj.customColor);
					gradient.addColorStop(0, color.toCss());
					gradient.addColorStop(
						1,
						`rgba(${color.r},${color.g},${color.b},0.6667)`
					);
					subRx.drawRect({
						x,
						y,
						w,
						h,
						fill: {
							style: gradient,
						},
						outline: {
							style: '#ffdfee',
							width: 6,
						},
					});
					subRx.customTransform(
						ctx => {
							ctx.translate(x, y);
						},
						subSubRx => {
							const pattern = subRx.patternFrom(dotPattern);
							subRx.drawRect({
								x: 0,
								y: 0,
								w,
								h,
								fill: {
									style: pattern,
								},
								composition: 'source-atop',
							});
						}
					);
					console.log('Glow:', y + h - GlowRY, y + h);
					const glowGradient = subRx.linearGradient(
						x,
						y + h - GlowRY,
						x,
						y + h
					);
					glowGradient.addColorStop(0, 'rgba(255,255,255,0.3137)');
					glowGradient.addColorStop(0.5, 'rgba(255,255,255,0.0627)');
					glowGradient.addColorStop(1, 'rgba(255,255,255,0)');
					subRx.drawPath({
						path: ctx => {
							ctx.ellipse(x + w / 2, y + h, GlowRX, GlowRY, 0, 0, 2 * Math.PI);
						},
						fill: {
							style: glowGradient,
						},
					});
				}
			);
			const delta = new HSLAColor(
				0.0023347701149424305,
				0,
				0.10784313725490202,
				0
			);
			const outlineColor = hslColor
				.shift(delta)
				.toRgb()
				.toCss();
			rx.drawPath({
				path: path => {
					roundedRectangle(
						path,
						x + 1.5,
						y + 1.5,
						this.obj.width - 3,
						this.obj.height - 3,
						12
					);
				},
				outline: {
					style: outlineColor,
					width: 3,
				},
			});
		} else {
			if (this.obj.style === 'corrupt') {
				x += (TextBoxWidth - TextBoxCorruptedWidth) / 2;
			}
			const image = await getAsset(
				this.obj.style === 'corrupt' ? 'textbox_monika' : 'textbox'
			);
			rx.drawImage({ image, x, y });
		}
	}

	private renderText(rx: RenderContext, baseX: number, baseY: number): void {
		const text: DialogLetter[][] = [];

		let b = false;

		for (const line of this.obj.text.split('\n')) {
			let cl;
			text.push((cl = []));
			for (const l of line) {
				if (l === '[') {
					b = true;
				} else if (l === ']') {
					b = false;
				} else {
					cl.push({ l, b });
				}
			}
		}

		const startX = baseX + TextBoxTextXOffset;
		let y = baseY + NameboxHeight + TextBoxTextYOffset;

		if (text[0] && text[0][0] && text[0][0].b) {
			y += TextBoxTextCorruptedYOffset;
		}

		for (const line of text) {
			let x = startX;

			if (line[0] && line[0].b) {
				x += TextBoxTextCorruptedXOffset;
			}
			for (const letter of line) {
				const ct = letter.l;
				const cb = letter.b;

				rx.drawText({
					text: ct,
					x,
					y,
					...(cb ? TextBoxCorruptedStyle : TextBoxStyle),
				});
				x += rx.measureText({
					text: ct,
					...(cb ? TextBoxCorruptedStyle : TextBoxStyle),
				}).width;
				x += cb ? TextBoxCorruptedKerning : TextBoxKerning;
			}
			y += TextBoxLineHeight;
		}
	}
}

interface DialogLetter {
	l: string;
	b: boolean;
}
