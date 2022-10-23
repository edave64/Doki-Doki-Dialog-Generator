import { SelectedState } from '@/renderables/offscreenRenderable';
import { RenderContext } from '@/renderer/rendererContext';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { INotification } from '@/store/objectTypes/notification';
import { ScalingRenderable } from './scalingRenderable';
import getConstants from '@/constants';

export class Notification extends ScalingRenderable<INotification> {
	private _height: number = 0;
	public get height(): number {
		return this._height;
	}
	private _width: number = 0;
	public get width(): number {
		return this._width;
	}
	protected get centeredVertically(): boolean {
		return true;
	}

	public get id() {
		return this.obj.id;
	}

	public async render(selected: SelectedState, rx: RenderContext) {
		const constants = getConstants();

		if (this.obj.backdrop) {
			rx.drawRect({
				x: 0,
				y: 0,
				w: constants.Base.screenWidth,
				h: constants.Base.screenHeight,
				fill: {
					style: getConstants().Notification.NotificationBackdropColor,
				},
			});
		}
		await super.render(selected, rx);
	}

	protected async draw(rx: RenderContext): Promise<void> {
		const constants = getConstants();
		const textRenderer = new TextRenderer(
			this.obj.text,
			constants.Notification.NotificationTextStyle
		);
		const buttonRenderer = new TextRenderer(
			'OK',
			constants.Notification.NotificationOkTextStyle
		);
		await textRenderer.loadFonts();
		await buttonRenderer.loadFonts();

		const lineWrap = this.obj.autoWrap
			? this.obj.width - constants.Notification.NotificationPadding * 2
			: 0;

		const textWidth = this.obj.autoWrap ? lineWrap : textRenderer.getWidth();
		const textHeight = textRenderer.getHeight(lineWrap);
		const buttonWidth = this.obj.autoWrap
			? lineWrap
			: buttonRenderer.getWidth();
		const buttonHeight = buttonRenderer.getHeight(lineWrap);

		const w = (this._width =
			Math.max(textWidth, buttonWidth) +
			constants.Notification.NotificationPadding * 2);
		const h = (this._height =
			textHeight +
			constants.Notification.NotificationPadding * 2 +
			constants.Notification.NotificationSpacing +
			buttonHeight);

		const w2 = w / 2;
		const baseX = this.flip
			? constants.Base.screenWidth - this.obj.x
			: this.obj.x;
		const x = baseX - w2;
		const y = this.obj.y - h / 2;

		rx.drawRect({
			x,
			y,
			w,
			h,
			outline: {
				style: constants.Choices.ChoiceButtonBorderColor,
				width: 3,
			},
			fill: {
				style: constants.Choices.ChoiceButtonColor,
			},
		});
		textRenderer.fixAlignment(
			'center',
			x,
			x + w,
			// tslint:disable-next-line: no-magic-numbers
			y + constants.Notification.NotificationPadding * 1.5,
			lineWrap
		);
		textRenderer.render(rx.fsCtx);
		buttonRenderer.fixAlignment(
			'center',
			x,
			x + w,
			// tslint:disable-next-line: no-magic-numbers
			y + h - constants.Notification.NotificationPadding,
			lineWrap
		);
		buttonRenderer.render(rx.fsCtx);
	}
}
