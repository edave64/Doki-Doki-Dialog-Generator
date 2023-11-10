import { getBuildInAsset } from '@/asset-manager';
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
} from '@/constants/game_modes/ddlc/text-box';
import { IAsset } from '@/render-utils/assets/asset';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import { applyStyle } from '@/renderer/canvas-tools';
import { ITextStyle } from '@/renderer/text-renderer/text-renderer';
import { DeepReadonly } from 'vue';
import { ITextboxRenderer, TextBox } from '../textbox';

export abstract class DdlcBase implements ITextboxRenderer {
	public abstract readonly width: number;
	public abstract readonly height: number;
	public abstract readonly innerWidth: number;
	public abstract readonly innerHeight: number;

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
	public get textboxStyle() {
		return TextBoxStyle;
	}

	public renderControls(rx: CanvasRenderingContext2D, y: number) {
		const w = this.width;

		const controlsCenter = w / 2;

		const controlsStyle = this.getControlsStyle();
		applyStyle(rx, controlsStyle);
		rx.fillText('History', controlsCenter + ControlsXHistoryOffset, y);
		applyStyle(
			rx,
			this.base.obj.skip ? controlsStyle : this.getControlsDisabledStyle()
		);
		rx.fillText('Skip', controlsCenter + ControlsXSkipOffset, y);
		applyStyle(rx, controlsStyle);
		rx.fillText(
			'Auto   Save   Load   Settings',
			controlsCenter + ControlsXStuffOffset,
			y
		);
	}

	public abstract nameboxWidth: number;
	public abstract nameboxHeight: number;
	public abstract nameboxOffsetX: number;
	public abstract nameboxOffsetY: number;
	public abstract nameboxStyle: ITextStyle;
	public abstract textOffsetX: number;
	public abstract textOffsetY: number;

	public nextArrow: IAsset | null = null;
	public prepare(): Promise<void> | void {
		if (this.nextArrow instanceof ImageAsset) return;
		return (async () => {
			this.nextArrow = await getBuildInAsset('next');
		})();
	}
}
