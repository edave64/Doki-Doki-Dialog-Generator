import * as TBConstants from '@/constants/game_modes/ddlc/text-box';
import type { ITextboxRenderer } from '../textbox';
import { DdlcBase } from './ddlc-base';

export class None extends DdlcBase implements ITextboxRenderer {
	static readonly id = 'none';
	static readonly label: string = 'None';
	static readonly priority: number = 0;
	static readonly gameMode: string = 'ddlc';

	public static get resizable() {
		return true;
	}

	public get height() {
		return TBConstants.TextBoxHeight + TBConstants.NameboxHeight;
	}
	public get width() {
		return TBConstants.TextBoxWidth;
	}
	public get nameboxWidth() {
		return TBConstants.NameboxWidth;
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
		return TBConstants.NameboxTextStyle;
	}
	public get textOffsetX() {
		return TBConstants.TextBoxTextXOffset;
	}
	public get textOffsetY() {
		return TBConstants.TextBoxTextYOffset;
	}
	public get textboxStyle() {
		return TBConstants.TextBoxStyle;
	}

	public async render(): Promise<void> {}
}
