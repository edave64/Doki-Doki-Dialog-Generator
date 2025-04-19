import { getBuildInAsset } from '@/asset-manager';
import * as TBConstants from '@/constants/game_modes/ddlc/text-box';
import type { IAsset } from '@/render-utils/assets/asset';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import type { ITextBox } from '@/store/object-types/textbox';
import type { ITextboxRenderer } from '../textbox';
import { DdlcBase } from './ddlc-base';

export class Default extends DdlcBase implements ITextboxRenderer {
	static readonly id: ITextBox['style'] = 'normal';
	static readonly label: string = 'Normal';
	static readonly priority: number = 0;
	static readonly gameMode: string = 'ddlc';

	public static get resizable() {
		return false;
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

	protected backgroundImage = 'textbox';
	protected xOffset = 0;

	protected renderNamebox(
		rx: CanvasRenderingContext2D,
		x: number,
		y: number
	) {
		this.nameBoxAsset?.paintOnto(rx, { x, y });
	}
	protected renderBackdrop(
		rx: CanvasRenderingContext2D,
		x: number,
		y: number
	) {
		x += this.xOffset;
		this.backdropAsset?.paintOnto(rx, { x, y });
	}

	public render(rx: CanvasRenderingContext2D): void {
		const w = this.width;
		const h = this.height;

		this.renderBackdrop(rx, 0, 0 + this.nameboxHeight);

		if (this.obj.talkingObjId !== null) {
			this.renderNamebox(rx, 0 + this.nameboxOffsetX, 0);
		}

		const bottom = h;
		const controlsY = bottom - TBConstants.ControlsYBottomOffset;

		if (this.obj.controls) this.renderControls(rx, controlsY);

		if (this.obj.continue) {
			this.nextArrow?.paintOnto(rx, {
				x: w - TBConstants.ArrowXRightOffset,
				y: bottom - TBConstants.ArrowYBottomOffset,
			});
		}
	}

	private nameBoxAsset: null | IAsset = null;
	private backdropAsset: null | IAsset = null;
	public prepare(): Promise<unknown> | void {
		const prep = super.prepare();
		if (!prep && this.backdropAsset && this.nameBoxAsset) return;
		return Promise.all([
			prep,
			this.backdropAsset instanceof ImageAsset
				? undefined
				: (async () => {
						this.backdropAsset = await getBuildInAsset(
							this.backgroundImage
						);
					})(),
			this.nameBoxAsset instanceof ImageAsset
				? undefined
				: (async () => {
						this.nameBoxAsset = await getBuildInAsset('namebox');
					})(),
		]);
	}
}
