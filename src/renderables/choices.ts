import getConstants from '@/constants';
import { TextRenderer } from '@/renderer/text-renderer/text-renderer';
import type { IChoices } from '@/store/object-types/choices';
import { ScalingRenderable } from './scaling-renderable';

export class Choice extends ScalingRenderable<IChoices> {
	private _height: number = 0;

	protected get height(): number {
		const constants = getConstants().Choices;
		return this._height + constants.ChoiceOuterPadding * 2;
	}

	protected get width(): number {
		const constants = getConstants().Choices;
		return this.obj.width + constants.ChoiceOuterPadding * 2;
	}

	private choiceRenderers: TextRenderer[] = [];

	protected renderLocal(ctx: CanvasRenderingContext2D, _hq: boolean): void {
		const constants = getConstants().Choices;
		const w = this.obj.width;
		const x = constants.ChoiceOuterPadding;
		let y = constants.ChoiceOuterPadding;

		for (const choiceRenderer of this.choiceRenderers) {
			const height = choiceRenderer.getHeight(this.obj.autoWrap ? w : 0);
			ctx.strokeStyle = constants.ChoiceButtonBorderColor;
			ctx.lineWidth = constants.Outline;
			ctx.fillStyle = constants.ChoiceButtonColor;

			ctx.fillRect(x, y, w, height + constants.ChoicePadding * 2);
			ctx.strokeRect(x, y, w, height + constants.ChoicePadding * 2);
			choiceRenderer.fixAlignment(
				'center',
				x,
				w,
				y + constants.ChoiceSpacing * 1.25,
				this.obj.autoWrap ? w : 0
			);
			choiceRenderer.render(ctx);
			y += height + constants.ChoicePadding * 2 + constants.ChoiceSpacing;
		}
	}

	public prepareRender(lq: boolean): void | Promise<unknown> {
		const constants = getConstants();
		this.choiceRenderers = this.obj.choices.map(
			(choice) =>
				new TextRenderer(choice.text || ' ', constants.Choices.ChoiceTextStyle)
		);

		const computeHeight = () => {
			this._height =
				this.choiceRenderers.reduce(
					(acc, renderer) =>
						acc +
						renderer.getHeight(this.obj.autoWrap ? this.obj.width : 0) +
						constants.Choices.ChoicePadding * 2,
					0
				) +
				this.obj.choiceDistance * (this.obj.choices.length - 1);
			return super.prepareRender(lq);
		};

		const fontLoaders = this.choiceRenderers
			.map((x) => x.loadFonts())
			.filter((x) => x !== undefined);
		if (fontLoaders.length === 0) {
			computeHeight();
		} else {
			return Promise.all(fontLoaders).then(computeHeight);
		}
	}
}
