import getConstants from '@/constants';
import {
	ControlsTextDisabledStyle,
	ControlsTextStyle,
	ControlsXHistoryOffset,
	ControlsXSkipOffset,
	ControlsXStuffOffset,
	NameboxHeight,
	TextBoxHeight,
	TextBoxStyle,
	TextBoxWidth,
} from '@/constants/game_modes/ddlc/textBox';
import { RenderContext } from '@/renderer/rendererContext';
import { DeepReadonly } from 'vue';
import { TextBox } from '../textbox';

export abstract class DdlcBase {
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
	public get textboxStyle() {
		return TextBoxStyle;
	}

	public renderControls(rx: RenderContext, y: number) {
		const constants = getConstants();
		const w = this.width;
		const w2 = w / 2;
		const baseX = this.base.obj.flip
			? constants.Base.screenWidth - this.base.obj.x
			: this.base.obj.x;
		const x = baseX - w2;

		const controlsCenter = x + w / 2;

		const controlsStyle = this.getControlsStyle();

		rx.drawText({
			text: 'History',
			x: controlsCenter + ControlsXHistoryOffset,
			y,
			...controlsStyle,
		});
		rx.drawText({
			text: 'Skip',
			x: controlsCenter + ControlsXSkipOffset,
			y,
			...(this.base.obj.skip ? controlsStyle : this.getControlsDisabledStyle()),
		});
		rx.drawText({
			text: 'Auto   Save   Load   Settings',
			x: controlsCenter + ControlsXStuffOffset,
			y,
			...controlsStyle,
		});
	}
}
