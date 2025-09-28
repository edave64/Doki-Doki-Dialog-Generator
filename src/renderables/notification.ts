import getConstants from '@/constants';
import { SelectedState } from '@/constants/shared';
import { ctxScope } from '@/renderer/canvas-tools';
import { TextRenderer } from '@/renderer/text-renderer/text-renderer';
import type NotificationStore from '@/store/object-types/notification';
import { ScalingRenderable } from './scaling-renderable';

export class Notification extends ScalingRenderable<NotificationStore> {
	private _height: number = 0;
	public get height(): number {
		const constants = getConstants().Choices;
		return this._height + constants.ChoiceOuterPadding * 2;
	}
	private _width: number = 0;
	public get width(): number {
		const constants = getConstants().Choices;
		return this._width + constants.ChoiceOuterPadding * 2;
	}

	private _textRenderer: TextRenderer | null = null;
	private _buttonRenderer: TextRenderer | null = null;
	public prepareRender(lq: boolean): void | Promise<unknown> {
		const superRet: void | Promise<unknown> = super.prepareRender(lq);
		const constants = getConstants().Notification;
		const textRenderer = (this._textRenderer = new TextRenderer(
			this.obj.text,
			constants.NotificationTextStyle
		));
		const buttonRenderer = (this._buttonRenderer = new TextRenderer(
			'OK',
			constants.NotificationOkTextStyle
		));
		const loadTextFonts = textRenderer.loadFonts();
		const loadButtonFonts = buttonRenderer.loadFonts();

		const fixSize = () => {
			const lineWrap = this.obj.autoWrap
				? this.obj.width - constants.NotificationPadding * 2
				: 0;
			const textWidth = this.obj.autoWrap
				? lineWrap
				: textRenderer.getWidth();
			const textHeight = textRenderer.getHeight(lineWrap);
			const buttonWidth = this.obj.autoWrap
				? lineWrap
				: buttonRenderer.getWidth();
			const buttonHeight = buttonRenderer.getHeight(lineWrap);

			this._width =
				Math.max(textWidth, buttonWidth) +
				constants.NotificationPadding * 2;
			this._height =
				textHeight +
				constants.NotificationPadding * 2 +
				constants.NotificationSpacing +
				buttonHeight;
		};

		if (superRet || loadTextFonts || loadButtonFonts)
			return Promise.all([superRet, loadTextFonts, loadButtonFonts]).then(
				fixSize
			);

		fixSize();
		return;
	}

	public render(
		ctx: CanvasRenderingContext2D,
		selection: SelectedState,
		preview: boolean,
		hq: boolean,
		skipLocal: boolean
	) {
		if (this.obj.backdrop) {
			ctxScope(ctx, () => {
				const constants = getConstants();
				ctx.resetTransform();
				ctx.fillStyle =
					constants.Notification.NotificationBackdropColor;
				ctx.fillRect(
					0,
					0,
					constants.Base.screenWidth,
					constants.Base.screenHeight
				);
			});
		}
		return super.render(ctx, selection, preview, hq, skipLocal);
	}

	protected renderLocal(ctx: CanvasRenderingContext2D): void {
		const constants = getConstants();

		const textRenderer = this._textRenderer!;
		const buttonRenderer = this._buttonRenderer!;
		const w = this._width;
		const h = this._height;
		const p = constants.Choices.ChoiceOuterPadding;

		ctx.fillStyle = constants.Choices.ChoiceButtonColor;
		ctx.strokeStyle = constants.Choices.ChoiceButtonBorderColor;
		ctx.lineWidth = constants.Choices.Outline;
		ctx.fillRect(p, p, w, h);
		ctx.strokeRect(p, p, w, h);
		textRenderer.applyLayout(
			'center',
			p + constants.Notification.NotificationPadding,
			p + constants.Notification.NotificationPadding * 1.5,
			w - constants.Notification.NotificationPadding * 2,
			false
		);
		textRenderer.render(ctx);
		buttonRenderer.applyLayout(
			'center',
			p,
			p + h - constants.Notification.NotificationPadding,
			w + p,
			false
		);
		buttonRenderer.render(ctx);
	}
}
