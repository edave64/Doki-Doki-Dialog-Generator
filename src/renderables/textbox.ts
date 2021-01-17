import { RenderContext } from '@/renderer/rendererContext';
import { getAsset } from '@/asset-manager';
import { ITextBox } from '@/store/objectTypes/textbox';
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
} from '@/constants/textBox';
import { Renderer } from '@/renderer/renderer';
import { roundedRectangle, roundedTopRectangle } from '@/renderer/pathTools';
import { RGBAColor } from '@/util/colors/rgb';
import { TextRenderer, ITextStyle } from '@/renderer/textRenderer/textRenderer';
import { screenWidth, screenHeight } from '@/constants/base';
import {
	nameboxTextOutlineDelta,
	nameboxBackgroundDelta,
	nameboxGradientEndDelta,
	nameboxGradientMiddleStopPosition,
	controlColorDelta,
	controlDisableColorDelta,
	nameboxRounding,
	dotColorDelta,
	dotRadius,
	dotPatternSize,
	textboxRoundingBuffer,
	textboxRounding,
	textboxOutlineColorDelta,
	textboxDefaultColor,
} from '@/constants/textBoxCustom';
import { ScalingRenderable } from './scalingRenderable';
import { Store } from 'vuex';
import { DeepReadonly } from 'vue';
import { IRootState } from '@/store';
import { IObject } from '@/store/objects';

export class TextBox extends ScalingRenderable<ITextBox> {
	protected refObject: IObject | null = null;

	public get width(): number {
		return this.obj.style === 'custom' ? this.obj.width : TextBoxWidth;
	}

	public get height(): number {
		return (
			(this.obj.style === 'custom' ? this.obj.height : TextBoxHeight) +
			NameboxHeight
		);
	}

	public get forcedStyle(): ITextBox['style'] {
		if (
			this.obj.style === 'normal' &&
			this.refObject &&
			(this.refObject.textboxColor || this.refObject.nameboxWidth !== null)
		)
			return 'custom';
		return this.obj.style;
	}

	public get customColor(): string {
		if (this.obj.overrideColor) return this.obj.customColor;
		if (this.refObject && this.refObject.textboxColor)
			return this.refObject.textboxColor;
		return textboxDefaultColor;
	}

	public get controlColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.customColor).toHSL();
			return base
				.shift(controlColorDelta)
				.toRgb()
				.toCss();
		}
		return this.obj.customControlsColor;
	}

	public get controlsStyle() {
		if (this.forcedStyle !== 'custom') return ControlsTextStyle;
		return {
			...ControlsTextStyle,
			fill: {
				style: this.controlColor,
			},
		};
	}

	public get controlsDisableStyle() {
		if (this.forcedStyle !== 'custom') return ControlsTextDisabledStyle;

		const col = RGBAColor.fromCss(this.controlColor).toHSL();
		const disColor = col
			.shift(controlDisableColorDelta)
			.toRgb()
			.toCss();

		return {
			...ControlsTextStyle,

			fill: {
				style: disColor,
			},
		};
	}
	public updatedContent(
		_current: Store<DeepReadonly<IRootState>>,
		panelId: string
	): void {
		super.updatedContent(_current, panelId);

		const talkingObj = this.obj.talkingObjId;
		if (talkingObj !== null && talkingObj !== '$other$') {
			const obj = _current.state.objects.objects[talkingObj] as IObject;
			if (obj) {
				this.refObject = obj;
				return;
			}
		}
		this.refObject = null;
	}

	protected async draw(rx: RenderContext): Promise<void> {
		const w = this.width;
		const h = this.height;
		const w2 = w / 2;
		const baseX = this.flip ? screenWidth - this.obj.x : this.obj.x;
		const x = baseX - w2;
		const y = this.obj.y;

		await this.renderBackdrop(rx, x, y + NameboxHeight);

		if (this.obj.talkingObjId !== null) {
			const name =
				this.obj.talkingObjId === '$other$'
					? this.obj.talkingOther
					: this.refObject?.label || 'Missing name';
			await this.renderNamebox(rx, x + NameboxXOffset, y, name);
		}

		await this.renderText(rx, x, y, this.obj.autoWrap ? w : 0);

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
	}

	private get nameboxOutlineColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.customColor).toHSL();
			return base
				.shift(nameboxTextOutlineDelta)
				.toRgb()
				.toCss();
		}
		return this.obj.customNameboxStroke;
	}

	private get nameboxBackgroundColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.customColor).toHSL();
			return base
				.shift(nameboxBackgroundDelta)
				.toRgb()
				.toCss();
		}
		return this.obj.customNameboxColor;
	}

	private get nameboxWidth(): number {
		debugger;
		if (this.forcedStyle !== 'custom') return NameboxWidth;
		if (this.refObject && this.refObject.nameboxWidth !== null) {
			return this.refObject.nameboxWidth;
		}
		if (this.obj.nameboxWidth !== null) return this.obj.nameboxWidth;
		return NameboxWidth;
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
		if (this.forcedStyle === 'custom') {
			style = {
				...style,
				strokeColor: this.nameboxOutlineColor,
				strokeWidth: 6,
				color: '#FFFFFF',
			};
			w = this.nameboxWidth;
			await rx.customTransform(
				async ctx => {
					ctx.beginPath();
					roundedTopRectangle(ctx, x, y, w, h, nameboxRounding);
					ctx.clip();
				},
				async subRx => {
					const gradient = subRx.linearGradient(x, y, x, y + NameboxHeight);
					const baseBG = RGBAColor.fromCss(this.nameboxBackgroundColor);
					// tslint:disable-next-line: no-magic-numbers
					const color = new RGBAColor(baseBG.r, baseBG.g, baseBG.b, 0.95);
					const targetColor = color
						.toHSL()
						.shift(nameboxGradientEndDelta)
						.toRgb();
					gradient.addColorStop(0, color.toCss());
					gradient.addColorStop(
						nameboxGradientMiddleStopPosition,
						color.toCss()
					);
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
		} else if (this.forcedStyle !== 'none') {
			w = this.nameboxWidth;
			rx.drawImage({
				image: await getAsset('namebox'),
				x,
				y,
			});
		} else {
			w = this.nameboxWidth;
		}

		const render = new TextRenderer(name, style);
		await render.loadFonts();

		render.fixAlignment('center', x, x + w, y + NameboxTextYOffset, 0);

		render.render(rx.fsCtx);
	}

	private async renderBackdrop(
		rx: RenderContext,
		x: number,
		y: number
	): Promise<void> {
		if (this.forcedStyle === 'custom') {
			const hslColor = RGBAColor.fromCss(this.customColor).toHSL();
			const dotPattern = new Renderer(dotPatternSize, dotPatternSize);
			dotPattern.render(async (dotRx: RenderContext) => {
				const fill = {
					style: hslColor
						.shift(dotColorDelta)
						.toRgb()
						.toCss(),
				};

				function drawDot(dotX: number, dotY: number) {
					dotRx.drawPath({
						path: ctx => {
							ctx.ellipse(dotX, dotY, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
						},
						fill,
					});
				}

				drawDot(0, 0);
				drawDot(dotPatternSize, 0);
				drawDot(0, dotPatternSize);
				drawDot(dotPatternSize, dotPatternSize);
				drawDot(dotPatternSize / 2, dotPatternSize / 2);
			}, true);
			await rx.customTransform(
				async ctx => {
					ctx.beginPath();
					roundedRectangle(
						ctx,
						x + textboxRoundingBuffer,
						y + textboxRoundingBuffer,
						this.obj.width - textboxRoundingBuffer * 2,
						this.obj.height - textboxRoundingBuffer * 2,
						textboxRounding
					);
					ctx.clip();
				},
				async subRx => {
					const h = this.obj.height;
					const w = this.obj.width;
					const gradient = subRx.linearGradient(x, y, x, y + h);
					const color = RGBAColor.fromHex(this.customColor);
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
					await subRx.customTransform(
						async ctx => {
							ctx.translate(x, y);
						},
						async _subSubRx => {
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
					// tslint:disable-next-line: no-magic-numbers
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
			const outlineColor = hslColor
				.shift(textboxOutlineColorDelta)
				.toRgb()
				.toCss();
			rx.drawPath({
				path: path => {
					roundedRectangle(
						path,
						x + textboxRoundingBuffer,
						y + textboxRoundingBuffer,
						this.obj.width - textboxRoundingBuffer * 2,
						this.obj.height - textboxRoundingBuffer * 2,
						textboxRounding
					);
				},
				outline: {
					style: outlineColor,
					width: 3,
				},
			});
		} else if (this.forcedStyle !== 'none') {
			if (this.forcedStyle === 'corrupt') {
				x += (TextBoxWidth - TextBoxCorruptedWidth) / 2;
			}
			const image = await getAsset(
				this.forcedStyle === 'corrupt' ? 'textbox_monika' : 'textbox'
			);
			rx.drawImage({ image, x, y });
		}
	}

	private async renderText(
		rx: RenderContext,
		baseX: number,
		baseY: number,
		maxLineWidth: number
	): Promise<void> {
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
		if (this.obj.autoQuoting && this.obj.talkingObjId !== null) {
			render.quote();
		}
		await render.loadFonts();

		render.fixAlignment(
			'left',
			baseX + TextBoxTextXOffset,
			0,
			baseY + NameboxHeight + TextBoxTextYOffset,
			maxLineWidth - TextBoxTextXOffset - TextBoxTextXOffset
		);

		render.render(rx.fsCtx);
	}
}
