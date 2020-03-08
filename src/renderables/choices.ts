import { RenderContext } from '@/renderer/rendererContext';
import { IRenderable, IHitbox } from './renderable';
import { Renderer } from '@/renderer/renderer';
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
import { DeepReadonly } from '@/util/readonly';

export class Choice implements IRenderable {
	public display: boolean = true;
	private lastVersion = -1;
	private lastX = 0;
	private lastY = 0;
	private lastH = 0;
	private lastW = 0;
	private localRenderer = new Renderer(screenWidth, screenHeight);
	private height = 0;
	private choiceRenderers: TextRenderer[] = [];

	public constructor(public obj: DeepReadonly<IChoices>) {}

	public get id() {
		return this.obj.id;
	}

	public get width(): number {
		return this.obj.width;
	}

	public hitTest(hx: number, hy: number): boolean {
		// tslint:disable-next-line: no-magic-numbers
		const localX = hx - this.obj.x + this.width / 2;
		// tslint:disable-next-line: no-magic-numbers
		const localY = hy - this.obj.y + this.height / 2;
		// tslint:disable-next-line: no-magic-numbers
		const h = this.height;
		return localX >= 0 && localX <= this.width && localY >= 0 && localY <= h;
	}

	public getHitbox(): IHitbox {
		return {
			// tslint:disable-next-line: no-magic-numbers
			x0: this.obj.x - this.obj.width / 2,
			// tslint:disable-next-line: no-magic-numbers
			x1: this.obj.x + this.obj.width / 2,
			y0: this.obj.y,
			y1: this.obj.y + this.obj.height,
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
			await this.updateChoiceBounds();

			const w = this.width;
			const h = this.height;
			// tslint:disable-next-line: no-magic-numbers
			const w2 = w / 2;
			const x = this.obj.x - w2;
			// tslint:disable-next-line: no-magic-numbers
			let y = this.obj.y - h / 2;

			for (const choiceRenderer of this.choiceRenderers) {
				const height = choiceRenderer.getHeight();
				rx.drawRect({
					x,
					// tslint:disable-next-line: no-magic-numbers
					y: y - ChoicePadding * 1.5,
					w,
					// tslint:disable-next-line: no-magic-numbers
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
					y + ChoiceSpacing * 0.75
				);
				choiceRenderer.render(rx.fsCtx);
				// tslint:disable-next-line: no-magic-numbers
				y += height + ChoicePadding * 2 + ChoiceSpacing;
			}
		});
	}

	private async updateChoiceBounds() {
		this.choiceRenderers = this.obj.choices.map(
			choice => new TextRenderer(choice.text || ' ', ChoiceTextStyle)
		);

		this.height =
			this.choiceRenderers.reduce(
				// tslint:disable-next-line: no-magic-numbers
				(acc, renderer) => acc + renderer.getHeight() + ChoicePadding * 2,
				0
			) +
			this.obj.choiceDistance * (this.obj.choices.length - 1);
	}
}
