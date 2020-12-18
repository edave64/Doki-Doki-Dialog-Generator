import { RenderContext } from '@/renderer/rendererContext';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { screenWidth, screenHeight } from '@/constants/base';
import { IPoem } from '@/store/objectTypes/poem';
import {
	poemBackgrounds,
	poemTextStyles,
	poemTopPadding,
	poemPadding,
	consoleBackgroundColor,
} from '@/constants/poem';
import { getAssetByUrl } from '@/asset-manager';
import { ScalingRenderable } from './scalingRenderable';

const consolePadding = -2;
const consoleTopPadding = 26;
const consoleLineWrapPadding = 10;
const poemTopMargin = 10;

export class Poem extends ScalingRenderable<IPoem> {
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

	protected async draw(rx: RenderContext): Promise<void> {
		const paper = poemBackgrounds[this.obj.background];
		const flippedX = this.flip ? screenWidth - this.obj.x : this.obj.x;
		let y = this.obj.y;
		let x = flippedX + poemTopMargin;
		let padding = poemPadding;
		let topPadding = poemTopPadding;
		let lineWrapPadding = padding * 2;

		if (paper.file === 'internal:console') {
			const h = (this._height = this.obj.height);
			const w = (this._width = this.obj.width);

			rx.drawRect({
				x: flippedX - w / 2,
				y: this.obj.y - h / 2,
				h,
				w,
				fill: { style: consoleBackgroundColor },
			});
			padding = consolePadding;
			topPadding = consoleTopPadding;
			lineWrapPadding = consoleLineWrapPadding;
		} else if (paper.file === 'internal:transparent') {
			this._height = this.obj.height;
			this._width = this.obj.width;
		} else {
			const asset = await getAssetByUrl(`assets/poemBackgrounds/${paper.file}`);
			if (asset instanceof HTMLImageElement) {
				rx.drawImage({
					image: asset,
					x: flippedX - asset.width / 2,
					y: this.obj.y - asset.height / 2,
				});
				this._height = asset.height;
				this._width = asset.width;
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
			y + topPadding + padding,
			this.obj.autoWrap ? this.width - lineWrapPadding : 0
		);

		render.render(rx.fsCtx);
	}
}
