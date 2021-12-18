import { ITextboxRenderer } from '../textbox';
import * as TBConstants from '@/constants/game_modes/ddlc/textBox';
import { DdlcBase } from './ddlc_base';
import { RenderContext } from '@/renderer/rendererContext';
import environment from '@/environments/environment';

export class None extends DdlcBase implements ITextboxRenderer {
	static readonly id = 'none';
	static readonly label: string = 'None';
	static readonly priority: number = 0;
	static readonly gameMode: string = 'ddlc';

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

	public async render(rx: RenderContext): Promise<void> {}
	public appliesTo(type: string): boolean {
		return type === None.id;
	}
}
