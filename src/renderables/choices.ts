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
			const w2 = w / 2;
			const x = this.obj.x - w2;
			let y = this.obj.y - h / 2;

			for (const choiceRenderer of this.choiceRenderers) {
				await choiceRenderer.loadFonts();
				const height = choiceRenderer.getHeight();
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
					y + ChoiceSpacing * 1.25
				);
				choiceRenderer.render(rx.fsCtx);
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
				(acc, renderer) => acc + renderer.getHeight() + ChoicePadding * 2,
				0
			) +
			this.obj.choiceDistance * (this.obj.choices.length - 1);
	}
}
