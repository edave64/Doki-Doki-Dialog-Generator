import { ITextboxRenderer } from '../textbox';
import * as TBConstants from '@/constants/game_modes/ddlc/textBox';
import { DdlcBase } from './ddlc_base';
import { RenderContext } from '@/renderer/rendererContext';
import getConstants from '@/constants';
import { getAsset } from '@/asset-manager';
import environment from '@/environments/environment';
import { ITextBox } from '@/store/objectTypes/textbox';

export class Default extends DdlcBase implements ITextboxRenderer {
	static readonly id: ITextBox['style'] = 'normal';
	static readonly label: string = 'Normal';
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

	protected backgroundImage = 'textbox';
	protected xOffset = 0;

	protected async renderNamebox(
		rx: RenderContext,
		x: number,
		y: number
	): Promise<void> {
		rx.drawImage({
			image: await getAsset('namebox'),
			x,
			y,
		});
	}
	protected async renderBackdrop(
		rx: RenderContext,
		x: number,
		y: number
	): Promise<void> {
		x += this.xOffset;
		const image = await getAsset(this.backgroundImage);
		rx.drawImage({ image, x, y });
	}

	public async render(rx: RenderContext): Promise<void> {
		const constants = getConstants();
		const w = this.width;
		const h = this.height;
		const w2 = w / 2;
		const baseX = this.obj.flip
			? constants.Base.screenWidth - this.obj.x
			: this.obj.x;
		const x = baseX - w2;
		const y = this.obj.y;

		await this.renderBackdrop(rx, x, y + this.nameboxHeight);

		if (this.obj.talkingObjId !== null) {
			await this.renderNamebox(rx, x + this.nameboxOffsetX, y);
		}

		const bottom = y + h;
		const controlsY = bottom - TBConstants.ControlsYBottomOffset;

		if (this.obj.controls) this.renderControls(rx, controlsY);

		if (this.obj.continue) {
			rx.drawImage({
				image: await getAsset('next'),
				x: x + w - TBConstants.ArrowXRightOffset,
				y: bottom - TBConstants.ArrowYBottomOffset,
			});
		}
	}
	public appliesTo(type: string): boolean {
		return type === Default.id;
	}
}
