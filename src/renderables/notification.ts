import { RenderContext } from '@/renderer/rendererContext';
import { IRenderable, IHitbox } from './renderable';
import { Renderer } from '@/renderer/renderer';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { screenWidth, screenHeight } from '@/constants/base';
import {
	ChoiceButtonBorderColor,
	ChoiceButtonColor,
	ChoiceSpacing,
} from '@/constants/choices';
import { DeepReadonly } from '@/util/readonly';
import { INotification } from '@/store/objectTypes/notification';
import {
	NotificationTextStyle,
	NotificationPadding,
	NotificationSpacing,
	NotificationOkTextStyle,
	NotificationBackdropColor,
} from '@/constants/notification';

export class Notification implements IRenderable {
	public display: boolean = true;
	private lastVersion = -1;
	private lastX = 0;
	private lastY = 0;
	private lastH = 0;
	private lastW = 0;
	private localRenderer = new Renderer(screenWidth, screenHeight);
	private height = 0;
	private width = 0;

	public constructor(public obj: DeepReadonly<INotification>) {}

	public updatedContent(): void {}

	public get id() {
		return this.obj.id;
	}

	public hitTest(hx: number, hy: number): boolean {
		const scaledX = hx - (this.obj.x - this.width / 2);
		const scaledY = hy - (this.obj.y - this.height / 2);

		if (scaledX < 0 || scaledX > this.width) return false;
		if (scaledY < 0 || scaledY > this.height) return false;

		return true;
	}

	public getHitbox(): IHitbox {
		const w2 = this.width / 2;
		const h2 = this.height / 2;
		return {
			x0: this.obj.x - w2,
			x1: this.obj.x + w2,
			y0: this.obj.y - h2,
			y1: this.obj.y + h2,
		};
	}

	public async render(selected: boolean, rx: RenderContext) {
		if (
			this.lastVersion !== this.obj.version ||
			this.lastX !== this.obj.x ||
			this.lastY !== this.obj.y ||
			this.lastH !== this.obj.height ||
			this.lastW !== this.obj.width
		) {
			await this.updateLocalCanvas();
			this.lastVersion = this.obj.version;
			this.lastX = this.obj.x;
			this.lastY = this.obj.y;
		}

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

		rx.drawImage({
			image: this.localRenderer,
			x: 0,
			y: 0,
			flip: this.obj.flip,
			shadow: selected && rx.preview ? { blur: 20, color: 'red' } : undefined,
			opacity: this.obj.opacity,
		});
	}

	private async updateLocalCanvas() {
		await this.localRenderer.render(async rx => {
			const textRenderer = new TextRenderer(
				this.obj.text,
				NotificationTextStyle
			);
			const buttonRenderer = new TextRenderer('OK', NotificationOkTextStyle);
			await textRenderer.loadFonts();
			await buttonRenderer.loadFonts();

			const textWidth = textRenderer.getWidth();
			const textHeight = textRenderer.getHeight();
			const buttonWidth = buttonRenderer.getWidth();
			const buttonHeight = buttonRenderer.getHeight();

			this.width = Math.max(textWidth, buttonWidth) + NotificationPadding * 2;
			this.height =
				textHeight +
				NotificationPadding * 2 +
				NotificationSpacing +
				buttonHeight;

			const w = this.width;
			const h = this.height;
			const w2 = w / 2;
			const x = this.obj.x - w2;
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
				0
			);
			textRenderer.render(rx.fsCtx);
			buttonRenderer.fixAlignment(
				'center',
				x,
				x + w,
				// tslint:disable-next-line: no-magic-numbers
				y + h - NotificationPadding,
				0
			);
			buttonRenderer.render(rx.fsCtx);
		});
	}
}
