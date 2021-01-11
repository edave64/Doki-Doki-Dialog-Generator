import { RenderContext } from '@/renderer/rendererContext';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { screenWidth, screenHeight } from '@/constants/base';
import {
	ChoiceButtonBorderColor,
	ChoiceButtonColor,
} from '@/constants/choices';
import { INotification } from '@/store/objectTypes/notification';
import {
	NotificationTextStyle,
	NotificationPadding,
	NotificationSpacing,
	NotificationOkTextStyle,
	NotificationBackdropColor,
} from '@/constants/notification';
import { ScalingRenderable } from './scalingRenderable';

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

	public async render(selected: boolean, rx: RenderContext) {
		if (this.obj.backdrop) {
			rx.drawRect({
				x: 0,
				y: 0,
				w: screenWidth,
				h: screenHeight,
				fill: {
					style: NotificationBackdropColor,
				},
			});
		}
		await super.render(selected, rx);
	}

	protected async draw(rx: RenderContext): Promise<void> {
		const textRenderer = new TextRenderer(this.obj.text, NotificationTextStyle);
		const buttonRenderer = new TextRenderer('OK', NotificationOkTextStyle);
		await textRenderer.loadFonts();
		await buttonRenderer.loadFonts();

		const lineWrap = this.obj.autoWrap
			? this.obj.width - NotificationPadding * 2
			: 0;

		const textWidth = this.obj.autoWrap ? lineWrap : textRenderer.getWidth();
		const textHeight = textRenderer.getHeight(lineWrap);
		const buttonWidth = this.obj.autoWrap
			? lineWrap
			: buttonRenderer.getWidth();
		const buttonHeight = buttonRenderer.getHeight(lineWrap);

		const w = (this._width =
			Math.max(textWidth, buttonWidth) + NotificationPadding * 2);
		const h = (this._height =
			textHeight +
			NotificationPadding * 2 +
			NotificationSpacing +
			buttonHeight);

		const w2 = w / 2;
		const baseX = this.flip ? screenWidth - this.obj.x : this.obj.x;
		const x = baseX - w2;
		const y = this.obj.y - h / 2;

		rx.drawRect({
			x,
			y,
			w,
			h,
			outline: {
				style: ChoiceButtonBorderColor,
				width: 3,
			},
			fill: {
				style: ChoiceButtonColor,
			},
		});
		textRenderer.fixAlignment(
			'center',
			x,
			x + w,
			// tslint:disable-next-line: no-magic-numbers
			y + NotificationPadding * 1.5,
			lineWrap
		);
		textRenderer.render(rx.fsCtx);
		buttonRenderer.fixAlignment(
			'center',
			x,
			x + w,
			// tslint:disable-next-line: no-magic-numbers
			y + h - NotificationPadding,
			lineWrap
		);
		buttonRenderer.render(rx.fsCtx);
	}
}
