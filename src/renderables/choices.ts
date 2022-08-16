import { RenderContext } from '@/renderer/rendererContext';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { IChoices } from '@/store/objectTypes/choices';
import { ScalingRenderable } from './scalingRenderable';
import getConstants from '@/constants';

export class Choice extends ScalingRenderable<IChoices> {
	private _height: number = 0;
	public get height(): number {
		return this._height;
	}
	protected get centeredVertically(): boolean {
		return true;
	}

	private choiceRenderers: TextRenderer[] = [];

	protected async draw(rx: RenderContext): Promise<void> {
		await this.updateChoiceBounds();

		const constants = getConstants();
		const w = this.obj.width;
		const h = this.height;
		const w2 = w / 2;
		const baseX = this.flip
			? constants.Base.screenWidth - this.obj.x
			: this.obj.x;
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
				h: height + constants.Choices.ChoicePadding * 2,
				outline: {
					style: constants.Choices.ChoiceButtonBorderColor,
					width: constants.Choices.Outline,
				},
				fill: {
					style: constants.Choices.ChoiceButtonColor,
				},
			});
			choiceRenderer.fixAlignment(
				'center',
				x,
				x + w,
				// tslint:disable-next-line: no-magic-numbers
				y + constants.Choices.ChoiceSpacing * 1.25,
				this.obj.autoWrap ? w : 0
			);
			choiceRenderer.render(rx.fsCtx);
			y +=
				height +
				constants.Choices.ChoicePadding * 2 +
				constants.Choices.ChoiceSpacing;
		}
	}

	private async updateChoiceBounds() {
		const constants = getConstants();
		this.choiceRenderers = this.obj.choices.map(
			(choice) =>
				new TextRenderer(choice.text || ' ', constants.Choices.ChoiceTextStyle)
		);

		this._height =
			this.choiceRenderers.reduce(
				(acc, renderer) =>
					acc +
					renderer.getHeight(this.obj.autoWrap ? this.obj.width : 0) +
					constants.Choices.ChoicePadding * 2,
				0
			) +
			this.obj.choiceDistance * (this.obj.choices.length - 1);
	}
}
