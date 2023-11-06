import getConstants from '@/constants';
import { TextRenderer } from '@/renderer/text-renderer/text-renderer';
import { IRootState } from '@/store';
import { IChoices } from '@/store/object-types/choices';
import { IObject } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { DeepReadonly } from 'vue';
import { Store } from 'vuex';
import { Renderable } from './renderable';
import { ScalingRenderable } from './scaling-renderable';

export class Choice extends ScalingRenderable<IChoices> {
	private _height: number = 0;

	protected get height(): number {
		return this._height;
	}

	private choiceRenderers: TextRenderer[] = [];

	protected renderLocal(ctx: CanvasRenderingContext2D, _hq: boolean): void {
		const constants = getConstants();
		const w = this.obj.width;
		const x = 0;
		let y = 0;

		for (const choiceRenderer of this.choiceRenderers) {
			const height = choiceRenderer.getHeight(
				this.obj.autoWrap ? this.obj.width : 0
			);
			ctx.strokeStyle = constants.Choices.ChoiceButtonBorderColor;
			ctx.lineWidth = constants.Choices.Outline;
			ctx.fillStyle = constants.Choices.ChoiceButtonColor;

			ctx.fillRect(x, y, w, height + constants.Choices.ChoicePadding * 2);
			ctx.strokeRect(x, y, w, height + constants.Choices.ChoicePadding * 2);
			choiceRenderer.fixAlignment(
				'center',
				0,
				w,
				y + constants.Choices.ChoiceSpacing * 1.25,
				this.obj.autoWrap ? w : 0
			);
			choiceRenderer.render(ctx);
			y +=
				height +
				constants.Choices.ChoicePadding * 2 +
				constants.Choices.ChoiceSpacing;
		}
	}

	public prepareRender(
		panel: DeepReadonly<IPanel>,
		store: Store<IRootState>,
		renderables: Map<IObject['id'], DeepReadonly<Renderable<never>>>,
		lq: boolean
	): void | Promise<unknown> {
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
			return super.prepareRender(panel, store, renderables, lq);
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
