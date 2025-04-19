import { getBuildInAsset } from '@/asset-manager';
import getConstants from '@/constants';
import {
	ControlsTextDisabledStyle,
	ControlsTextStyle,
	NameboxHeight,
	TextBoxHeight,
	TextBoxWidth,
} from '@/constants/game_modes/ddlc_plus/text-box';
import type { IAsset } from '@/render-utils/assets/asset';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import { applyStyle } from '@/renderer/canvas-tools';
import type { ITextStyle } from '@/renderer/text-renderer/text-renderer';
import type { DeepReadonly } from 'vue';
import { type ITextboxRenderer, TextBox } from '../textbox';

export abstract class DdlcPlusBase implements ITextboxRenderer {
	public abstract readonly width: number;
	public abstract readonly height: number;

	public static get resizable() {
		return false;
	}
	public static get defaultWidth() {
		return TextBoxWidth;
	}
	public static get defaultHeight() {
		return TextBoxHeight + NameboxHeight;
	}
	public static get defaultX() {
		return getConstants().Base.screenWidth / 2;
	}
	public static get defaultY() {
		return (
			getConstants().Base.screenHeight -
			this.defaultHeight / 2 -
			getConstants().TextBox.TextBoxBottomSpacing
		);
	}

	public get allowSkippingLocal() {
		return true;
	}

	public get obj() {
		return this.base.obj;
	}

	public get refObject() {
		return this.base.refObject;
	}

	public constructor(protected base: DeepReadonly<TextBox>) {}
	abstract render(rx: CanvasRenderingContext2D): void;

	protected getControlsStyle() {
		return ControlsTextStyle;
	}

	protected getControlsDisabledStyle() {
		return ControlsTextDisabledStyle;
	}

	public renderControls(rx: CanvasRenderingContext2D, y: number) {
		const w = this.width;
		const w2 = w / 2;
		const baseX = w2;
		const x = baseX - w2;

		const controlsStyle = this.getControlsStyle();

		const texts = ['History', 'Skip', 'Auto', 'Save', 'Load', 'Settings'];
		const textWidths = [];
		let combinedLength = 0;

		for (const text of texts) {
			const width = DdlcPlusBase.controlWidth(rx, text);
			textWidths.push(width);
			combinedLength += width;
		}

		const spacing = Math.min((w - combinedLength) / (texts.length + 2), 78);

		let controlX =
			x + (w - combinedLength - spacing * (texts.length - 1)) / 2;
		for (let i = 0; i < texts.length; ++i) {
			const text = texts[i];
			const textWidth = textWidths[i];
			const style =
				text === 'Skip' && !this.base.obj.skip
					? this.getControlsDisabledStyle()
					: controlsStyle;
			applyStyle(rx, style);
			rx.fillText(text, controlX, y);
			controlX += textWidth + spacing;
		}
	}

	private static widthCache: { [text: string]: number } = {};
	private static controlWidth(rx: CanvasRenderingContext2D, text: string) {
		if (this.widthCache[text]) return this.widthCache[text];
		applyStyle(rx, ControlsTextStyle);
		const width = rx.measureText(text).width;
		this.widthCache[text] = width;
		return width;
	}

	public abstract nameboxWidth: number;
	public abstract nameboxHeight: number;
	public abstract nameboxOffsetX: number;
	public abstract nameboxOffsetY: number;
	public abstract nameboxStyle: ITextStyle;
	public abstract textOffsetX: number;
	public abstract textOffsetY: number;
	public abstract textboxStyle: ITextStyle;

	public nextArrow: null | IAsset = null;
	public prepare(): Promise<void> | void {
		if (this.nextArrow instanceof ImageAsset) return;
		return (async () => {
			this.nextArrow = await getBuildInAsset('next_plus');
		})();
	}
}
