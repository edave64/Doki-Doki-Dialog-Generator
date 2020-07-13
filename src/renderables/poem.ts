import { RenderContext } from '@/renderer/rendererContext';
import { IRenderable, IHitbox } from './renderable';
import { Renderer } from '@/renderer/renderer';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { screenWidth, screenHeight } from '@/constants/base';
import { IPoem } from '@/store/objectTypes/poem';
import { DeepReadonly } from '@/util/readonly';
import {
	poemBackgrounds,
	poemTextStyles,
	poemTopPadding,
	poemPadding,
	consoleBackgroundColor,
} from '@/constants/poem';
import { getAsset, getAssetByUrl } from '@/asset-manager';

const consolePadding = -2;
const consoleTopPadding = 26;
const poemTopMargin = 10;

export class Poem implements IRenderable {
	private lastVersion = -1;
	private lastX = 0;
	private lastY = 0;
	private lastH = 0;
	private lastW = 0;
	private localRenderer = new Renderer(screenWidth, screenHeight);
	private height = 0;
	private width = 0;
	private choiceRenderers: TextRenderer[] = [];

	public constructor(public obj: DeepReadonly<IPoem>) {}

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
			const paper = poemBackgrounds[this.obj.background];
			let y = this.obj.y;
			let x = this.obj.x + poemTopMargin;
			let padding = poemPadding;
			let topPadding = poemTopPadding;

			if (paper.file === 'internal:console') {
				const h = (this.height = this.obj.height);
				const w = (this.width = this.obj.width);

				rx.drawRect({
					x: this.obj.x - w / 2,
					y: this.obj.y - h / 2,
					h,
					w,
					fill: { style: consoleBackgroundColor },
				});
				padding = consolePadding;
				topPadding = consoleTopPadding;
			} else if (paper.file === 'internal:transparent') {
				this.height = this.obj.height;
				this.width = this.obj.width;
			} else {
				const asset = await getAssetByUrl(
					`assets/poemBackgrounds/${paper.file}`
				);
				if (asset instanceof HTMLImageElement) {
					rx.drawImage({
						image: asset,
						x: this.obj.x - asset.width / 2,
						y: this.obj.y - asset.height / 2,
					});
					this.height = asset.height;
					this.width = asset.width;
				}
			}
			y -= this.height / 2;
			x -= this.width / 2;

			const style = poemTextStyles[this.obj.font];
			const render = new TextRenderer(this.obj.text, style);
			await render.loadFonts();

			render.fixAlignment(
				'left',
				x + padding,
				x + padding,
				y + topPadding + padding
			);

			render.render(rx.fsCtx);
		});
	}
}
