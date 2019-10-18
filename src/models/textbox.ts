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
import { roundedRectangle, roundedTopRectangle } from '@/renderer/pathTools';
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

	public get width(): number {
		return this.obj.style === 'custom' ? this.obj.width : TextBoxWidth;
	}

	public get height(): number {
		return (
			(this.obj.style === 'custom' ? this.obj.height : TextBoxHeight) +
			NameboxHeight
		);
	}

	public hitTest(hx: number, hy: number): boolean {
		const w = this.width;
		const h = this.height;

		const w2 = w / 2;
		const x1 = this.obj.x - w2;
		const x2 = x1 + w;
		const y1 = this.obj.y;
		const y2 = y1 + h;
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

	public get controlColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.obj.customColor).toHSL();
			const delta = new HSLAColor(
				0.08045977011494243,
				-0.5714285714285714,
				-0.5960784313725489,
				0
			);
			return base
				.shift(delta)
				.toRgb()
				.toCss();
		}
		return this.obj.customControlsColor;
	}

	public get controlsStyle() {
		if (this.obj.style !== 'custom') return ControlsTextStyle;
		return {
			...ControlsTextStyle,
			fill: {
				style: this.controlColor,
			},
		};
	}

	public get controlsDisableStyle() {
		if (this.obj.style !== 'custom') return ControlsTextDisabledStyle;

		const col = RGBAColor.fromCss(this.controlColor).toHSL();
		const delta = new HSLAColor(0, -0.14285714285714296, 0.3, 0);
		const disColor = col
			.shift(delta)
			.toRgb()
			.toCss();

		return {
			...ControlsTextStyle,

			fill: {
				style: disColor,
			},
		};
	}

	public async updateLocalCanvas() {
		const base = RGBAColor.fromCss(this.obj.customColor).toHSL();
		const target = RGBAColor.fromCss('#552222').toHSL();

		await this.localRenderer.render(async rx => {
			const w = this.width;
			const h = this.height;
			const w2 = w / 2;
			const x = this.obj.x - w2;
			const y = this.obj.y;

			await this.renderBackdrop(rx, x, y + NameboxHeight);

			if (this.obj.talkingDefault !== 'No-one') {
				const name =
					this.obj.talkingDefault === 'Other'
						? this.obj.talkingOther
						: this.obj.talkingDefault;
				await this.renderNamebox(rx, x + NameboxXOffset, y, name);
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
					...this.controlsStyle,
				});
				rx.drawText({
					text: 'Skip',
					x: controlsCenter + ControlsXSkipOffset,
					y: controlsY,
					...(this.obj.skip ? this.controlsStyle : this.controlsDisableStyle),
				});
				rx.drawText({
					text: 'Auto   Save   Load   Settings',
					x: controlsCenter + ControlsXStuffOffset,
					y: controlsY,
					...this.controlsStyle,
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

	private get nameboxOutlineColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.obj.customColor).toHSL();
			const delta = new HSLAColor(
				-0.03065134099616873,
				-0.5714285714285714,
				-0.29607843137254896,
				0
			);
			return base
				.shift(delta)
				.toRgb()
				.toCss();
		}
		return this.obj.customNameboxStroke;
	}

	private get nameboxBackgroundColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.obj.customColor).toHSL();
			const delta = new HSLAColor(
				0.002028397565922768,
				0,
				0.13725490196078438,
				0
			);
			return base
				.shift(delta)
				.toRgb()
				.toCss();
		}
		return this.obj.customNameboxColor;
	}

	private async renderNamebox(
		rx: RenderContext,
		x: number,
		y: number,
		name: string
	): Promise<void> {
		let w: number;
		const h = NameboxHeight;
		let style: typeof NameboxTextStyle = NameboxTextStyle;
		if (this.obj.style === 'custom') {
			const hslOutline = RGBAColor.fromCss(this.nameboxOutlineColor).toHSL();
			style = {
				...style,

				outline: {
					style: this.nameboxOutlineColor,
					width: 6,
				},
				fill: {
					style: hslOutline.l > 0.6 ? '#000000' : '#FFFFFF',
				},
			};
			w = this.obj.customNameboxWidth;
			rx.customTransform(
				ctx => {
					ctx.beginPath();
					roundedTopRectangle(ctx, x, y, w, h, 12);
					ctx.clip();
				},
				subRx => {
					const h = this.obj.height;
					const w = this.obj.width;
					const gradient = subRx.linearGradient(x, y, x, y + NameboxHeight);
					const baseBG = RGBAColor.fromCss(this.nameboxBackgroundColor);
					const color = new RGBAColor(baseBG.r, baseBG.g, baseBG.b, 244);
					const delta = new HSLAColor(
						-0.004901960784313708,
						-0.8599999999999999,
						-0.16274509803921566,
						0
					);
					const targetColor = color
						.toHSL()
						.shift(delta)
						.toRgb();
					gradient.addColorStop(0, color.toCss());
					gradient.addColorStop(0.82, color.toCss());
					gradient.addColorStop(1, targetColor.toCss());
					subRx.drawRect({
						x,
						y,
						w,
						h,
						fill: {
							style: gradient,
						},
					});
				}
			);
		} else {
			w = NameboxWidth;
			rx.drawImage({
				image: await getAsset('namebox'),
				x,
				y,
			});
		}
		rx.drawText({
			x: x + w / 2,
			y: y + NameboxTextYOffset,
			text: name,
			...style,
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
