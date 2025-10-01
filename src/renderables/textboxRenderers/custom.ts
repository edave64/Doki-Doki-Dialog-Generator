import * as TBConstants from '@/constants/game_modes/ddlc/text-box';
import * as CustomTBConstants from '@/constants/game_modes/ddlc/text-box-custom';
import {
	nameboxBackgroundDelta,
	nameboxGradientEndDelta,
	nameboxGradientMiddleStopPosition,
	nameboxRounding,
	nameboxTextOutlineDelta,
	textboxDefaultColor,
	textboxOutlineColorDelta,
	textboxOutlineWidth,
	textboxRounding,
} from '@/constants/game_modes/ddlc/text-box-custom';
import {
	ctxScope,
	roundedRectangle,
	roundedTopRectangle,
} from '@/renderer/canvas-tools';
import { makeCanvas } from '@/util/canvas';
import { HSLAColor } from '@/util/colors/hsl';
import { RGBAColor } from '@/util/colors/rgb';
import type { ITextboxRenderer } from '../textbox';
import { DdlcBase } from './ddlc-base';

export class Custom extends DdlcBase implements ITextboxRenderer {
	static readonly id = 'custom';
	static readonly label: string = 'Custom';
	static readonly priority: number = 0;
	static readonly gameMode: string = 'ddlc';

	private _dotPattern: CanvasPattern | null = null;
	private _lastColor: string | null = null;

	public static get resizable() {
		return true;
	}

	public get allowSkippingLocal() {
		// The rendering of the dot pattern needs there to be no background other than the textbox itself,
		// otherwise source-atop compositing doesn't function as intended
		return false;
	}

	public get height() {
		return this.obj.height;
	}

	public get width() {
		return this.obj.width;
	}

	public get nameboxWidth() {
		const refObject = this.refObject.value;
		if (refObject && refObject.nameboxWidth !== null) {
			return refObject.nameboxWidth;
		}
		return this.obj.customNameboxWidth ?? TBConstants.NameboxWidth;
	}

	public get nameboxHeight() {
		return TBConstants.NameboxHeight;
	}

	public get nameboxOffsetX() {
		return TBConstants.NameboxXOffset;
	}

	public get nameboxOffsetY() {
		return TBConstants.NameboxTextYOffset;
	}

	public get nameboxStyle() {
		return {
			...TBConstants.NameboxTextStyle,
			strokeColor: this.nameboxOutlineColor,
			color: '#FFFFFF',
		};
	}

	public get textOffsetX() {
		return TBConstants.TextBoxTextXOffset;
	}

	public get textOffsetY() {
		return TBConstants.TextBoxTextYOffset;
	}

	public get customColor(): string {
		if (this.obj.overrideColor) return this.obj.customColor;
		const refObject = this.refObject.value;
		if (refObject != null && refObject.textboxColor != null)
			return refObject.textboxColor;
		return textboxDefaultColor;
	}

	private get nameboxOutlineColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.customColor).toHSL();
			return base.shift(nameboxTextOutlineDelta).toRgb().toCss();
		}
		return this.obj.customNameboxStroke;
	}

	private get nameboxBackgroundColor(): string {
		if (this.obj.deriveCustomColors) {
			const base = RGBAColor.fromCss(this.customColor).toHSL();
			return base.shift(nameboxBackgroundDelta).toRgb().toCss();
		}
		return this.obj.customNameboxColor;
	}

	protected backgroundImage = 'textbox';
	protected xOffset = 0;

	protected renderNamebox(
		rx: CanvasRenderingContext2D,
		x: number,
		y: number
	) {
		ctxScope(rx, () => {
			const w = this.nameboxWidth;
			const h = this.nameboxHeight;
			rx.beginPath();
			roundedTopRectangle(rx, x, y, w, h, nameboxRounding);
			rx.clip();
			const gradient = rx.createLinearGradient(x, y, x, y + h);
			const baseBG = RGBAColor.fromCss(this.nameboxBackgroundColor);
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
			rx.fillStyle = gradient;
			rx.fillRect(x, y, this.obj.width, h);
		});
	}

	protected renderBackdrop(rx: CanvasRenderingContext2D, y: number) {
		const customColor = RGBAColor.fromCss(this.customColor);
		const hslColor = customColor.toHSL();
		const h = this.obj.height - y;
		const w = this.obj.width;

		const borderRect = () =>
			roundedRectangle(
				rx,
				textboxOutlineWidth / 2,
				y + textboxOutlineWidth / 2,
				w - textboxOutlineWidth,
				h - textboxOutlineWidth,
				textboxRounding
			);

		ctxScope(rx, () => {
			rx.beginPath();
			borderRect();
			rx.clip();
			const gradient = rx.createLinearGradient(0, y, 0, h);
			gradient.addColorStop(0, customColor.toCss());
			gradient.addColorStop(
				1,
				`rgba(${customColor.r},${customColor.g},${customColor.b},0.6667)`
			);
			rx.fillStyle = gradient;
			rx.strokeStyle = '#ffdfee';
			rx.lineWidth = 6;
			rx.fillRect(0, y, w, h);

			ctxScope(rx, () => {
				rx.translate(0, y);
				rx.fillStyle = this.getDotPattern();
				rx.globalCompositeOperation = 'source-atop';
				rx.fillRect(0, 0, w, h);
			});
			const glowGradient = rx.createLinearGradient(
				0,
				y + h - TBConstants.GlowRY,
				0,
				y + h
			);
			glowGradient.addColorStop(0, 'rgba(255,255,255,0.3137)');
			glowGradient.addColorStop(0.5, 'rgba(255,255,255,0.0627)');
			glowGradient.addColorStop(1, 'rgba(255,255,255,0)');
			rx.fillStyle = glowGradient;

			rx.beginPath();
			rx.ellipse(
				w / 2,
				y + h,
				TBConstants.GlowRX,
				TBConstants.GlowRY,
				0,
				0,
				2 * Math.PI
			);
			rx.closePath();
			rx.fill();
		});

		const outlineColor = hslColor
			.shift(textboxOutlineColorDelta)
			.toRgb()
			.toCss();
		rx.strokeStyle = outlineColor;
		rx.lineWidth = textboxOutlineWidth;
		rx.beginPath();
		borderRect();
		rx.stroke();
	}

	public render(rx: CanvasRenderingContext2D) {
		const h = this.obj.height;
		const w = this.obj.width;

		if (this.obj.talkingObjId !== null) {
			this.renderNamebox(rx, this.nameboxOffsetX, 0);
		}

		this.renderBackdrop(rx, this.nameboxHeight);

		const bottom = h;
		const controlsY = bottom - TBConstants.ControlsYBottomOffset;

		if (this.obj.controls) this.renderControls(rx, controlsY);

		if (this.obj.continue && this.nextArrow) {
			this.nextArrow.paintOnto(rx, {
				x: w - TBConstants.ArrowXRightOffset,
				y: bottom - TBConstants.ArrowYBottomOffset,
			});
		}
	}

	public getDotPattern(
		constants: {
			dotPatternSize: number;
			dotRadius: number;
			dotColorDelta: HSLAColor;
		} = CustomTBConstants
	): CanvasPattern {
		if (this._dotPattern && this._lastColor === this.customColor)
			return this._dotPattern;
		this._lastColor = this.customColor;
		const { dotPatternSize, dotColorDelta, dotRadius } = constants;
		const hslColor = RGBAColor.fromCss(this.customColor).toHSL();

		const dotPattern = makeCanvas();
		dotPattern.height = dotPatternSize;
		dotPattern.width = dotPatternSize;
		const dotRx = dotPattern.getContext('2d');
		if (!dotRx)
			throw new Error(
				'Failed to create canvas for textbox dot-pattern. Out of memory?'
			);
		dotRx.fillStyle = hslColor.shift(dotColorDelta).toRgb().toCss();
		function drawDot(dotX: number, dotY: number) {
			dotRx!.beginPath();
			dotRx!.ellipse(dotX, dotY, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
			dotRx!.closePath();
			dotRx!.fill();
		}

		drawDot(0, 0);
		drawDot(dotPatternSize, 0);
		drawDot(0, dotPatternSize);
		drawDot(dotPatternSize, dotPatternSize);
		drawDot(dotPatternSize / 2, dotPatternSize / 2);

		const pattern = dotRx.createPattern(dotPattern, 'repeat');
		if (!pattern)
			throw new Error(
				'Failed to create textbox dot-pattern. Out of memory?'
			);
		this._dotPattern = pattern;
		return pattern;
	}
}
