import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { ITextBox } from '@/store/objectTypes/textbox';
import { IRenderable } from './renderable';
import {
	NameboxTextStyle,
	ControlsTextStyle,
	ControlsTextDisabledStyle,
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
import { TextRenderer, ITextStyle } from '@/renderer/textRenderer/textRenderer';

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
		let style: ITextStyle = NameboxTextStyle;
		if (this.obj.style === 'custom') {
			const hslOutline = RGBAColor.fromCss(this.nameboxOutlineColor).toHSL();
			style = {
				...style,
				strokeColor: this.nameboxOutlineColor,
				strokeWidth: 6,
				color: hslOutline.l > 0.6 ? '#000000' : '#FFFFFF',
			};
			w = this.obj.customNameboxWidth;
			rx.customTransform(
				ctx => {
					ctx.beginPath();
					roundedTopRectangle(ctx, x, y, w, h, 12);
					ctx.clip();
				},
				subRx => {
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
						w: this.obj.width,
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

		const render = new TextRenderer(name, style);

		render.fixAlignment('center', x, x + w, y + NameboxTextYOffset);

		render.render(rx.fsCtx);
	}

	private async renderBackdrop(
		rx: RenderContext,
		x: number,
		y: number
	): Promise<void> {
		if (this.obj.style === 'custom') {
			const hslColor = RGBAColor.fromCss(this.obj.customColor).toHSL();
			const dotPattern = new Renderer(47, 47);
			dotPattern.render(async (dotRx: RenderContext) => {
				const fillDelta = new HSLAColor(
					0.004269293924466178,
					-0.01869158878504662,
					-0.039215686274509665,
					0
				);
				const fill = {
					style: hslColor
						.shift(fillDelta)
						.toRgb()
						.toCss(),
				};

				function drawDot(dotX: number, dotY: number) {
					dotRx.drawPath({
						path: ctx => {
							ctx.ellipse(dotX, dotY, 9.5, 9.5, 0, 0, 2 * Math.PI);
						},
						fill,
					});
				}

				drawDot(0, 0);
				drawDot(47, 0);
				drawDot(0, 47);
				drawDot(47, 47);
				drawDot(23.5, 24.5);
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
			const outlineDelta = new HSLAColor(
				0.0023347701149424305,
				0,
				0.10784313725490202,
				0
			);
			const outlineColor = hslColor
				.shift(outlineDelta)
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
		const render = new TextRenderer(this.obj.text, {
			alpha: 1,
			color: '#ffffff',
			fontName: 'aller',
			fontSize: 24,
			isBold: false,
			isItalic: false,
			isStrikethrough: false,
			isUnderlined: false,
			letterSpacing: 0,
			strokeColor: '#523140',
			strokeWidth: 4,
			lineSpacing: 1.2,
		});
		if (this.obj.autoQuoting) {
			render.quote();
		}

		render.fixAlignment(
			'left',
			baseX + TextBoxTextXOffset,
			0,
			baseY + NameboxHeight + TextBoxTextYOffset
		);

		render.render(rx.fsCtx);
	}
}

interface DialogLetter {
	l: string;
	b: boolean;
}
