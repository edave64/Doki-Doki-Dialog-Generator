import { RenderContext } from '@/renderer/rendererContext';
import { IRenderable } from './renderable';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { screenWidth, screenHeight } from '@/constants/base';
import { IChoices } from '@/store/objectTypes/choices';
import {
	ChoiceTextStyle,
	ChoiceButtonBorderColor,
	ChoiceButtonColor,
	ChoicePadding,
	ChoiceSpacing,
} from '@/constants/choices';
import { ObjectRenderable } from './objectRenderable';

export class Choice extends ObjectRenderable<IChoices> implements IRenderable {
	protected readonly scaleable = false;
	protected readonly canvasHeight = screenHeight;
	protected readonly canvasWidth = screenWidth;

	private _height: number = 0;
	public get height(): number {
		return this._height;
	}
	protected get centeredVertically(): boolean {
		return true;
	}

	private choiceRenderers: TextRenderer[] = [];

	protected async renderLocal(rx: RenderContext): Promise<void> {
		await this.updateChoiceBounds();
		console.log('rerender choice');

		const w = this.obj.width;
		const h = this.height;
		const w2 = w / 2;
		const baseX = this.flip ? screenWidth - this.obj.x : this.obj.x;
		const x = baseX - w2;
		let y = this.obj.y - h / 2;

		for (const choiceRenderer of this.choiceRenderers) {
			await choiceRenderer.loadFonts();
			const height = choiceRenderer.getHeight(
				this.obj.autoWrap ? this.obj.width : 0
			);
			rx.drawRect({
				x,
				y,
				w,
				h: height + ChoicePadding * 2,
				outline: {
					style: ChoiceButtonBorderColor,
					width: 3,
				},
				fill: {
					style: ChoiceButtonColor,
				},
			});
			choiceRenderer.fixAlignment(
				'center',
				x,
				x + w,
				// tslint:disable-next-line: no-magic-numbers
				y + ChoiceSpacing * 1.25,
				this.obj.autoWrap ? w : 0
			);
			choiceRenderer.render(rx.fsCtx);
			y += height + ChoicePadding * 2 + ChoiceSpacing;
		}
	}

	private async updateChoiceBounds() {
		this.choiceRenderers = this.obj.choices.map(
			choice => new TextRenderer(choice.text || ' ', ChoiceTextStyle)
		);

		this._height =
			this.choiceRenderers.reduce(
				(acc, renderer) =>
					acc +
					renderer.getHeight(this.obj.autoWrap ? this.obj.width : 0) +
					ChoicePadding * 2,
				0
			) +
			this.obj.choiceDistance * (this.obj.choices.length - 1);
	}
}
