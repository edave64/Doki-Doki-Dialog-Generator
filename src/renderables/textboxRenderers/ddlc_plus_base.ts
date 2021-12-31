import getConstants from '@/constants';
import {
	ControlsTextDisabledStyle,
	ControlsTextStyle,
	TextBoxWidth,
	TextBoxHeight,
	NameboxHeight,
} from '@/constants/game_modes/ddlc_plus/textBox';
import { RenderContext } from '@/renderer/rendererContext';
import { DeepReadonly } from 'vue';
import { TextBox } from '../textbox';

export abstract class DdlcPlusBase {
	public abstract readonly width: number;
	public abstract readonly height: number;

	public static get resizable() {
		return false;
	}
	public static get defaultWidth() {
		return TextBoxWidth;
	}
	public static get defaultHeight() {
		return TextBoxHeight;
	}
	public static get defaultX() {
		return getConstants().Base.screenWidth / 2;
	}
	public static get defaultY() {
		return (
			getConstants().Base.screenHeight -
			this.defaultHeight -
			NameboxHeight -
			getConstants().TextBox.TextBoxBottomSpacing
		);
	}

	public get obj() {
		return this.base.obj;
	}

	public get refObject() {
		return this.base.refObject;
	}

	public constructor(protected base: DeepReadonly<TextBox>) {}

	protected getControlsStyle() {
		return ControlsTextStyle;
	}

	protected getControlsDisabledStyle() {
		return ControlsTextDisabledStyle;
	}

	public renderControls(rx: RenderContext, y: number) {
		const constants = getConstants();
		const w = this.width;
		const w2 = w / 2;
		const baseX = this.base.obj.flip
			? constants.Base.screenWidth - this.base.obj.x
			: this.base.obj.x;
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

		let controlX = x + (w - combinedLength - spacing * (texts.length - 1)) / 2;
		for (let i = 0; i < texts.length; ++i) {
			const text = texts[i];
			const textWidth = textWidths[i];
			const style =
				text === 'Skip' && !this.base.obj.skip
					? this.getControlsDisabledStyle()
					: controlsStyle;
			rx.drawText({
				text,
				x: controlX,
				y,
				...style,
			});
			controlX += textWidth + spacing;
		}
	}

	private static widthCache: { [text: string]: number } = {};
	private static controlWidth(rx: RenderContext, text: string) {
		if (this.widthCache[text]) return this.widthCache[text];
		const width = rx.measureText({ text, ...ControlsTextStyle }).width;
		this.widthCache[text] = width;
		return width;
	}
}
