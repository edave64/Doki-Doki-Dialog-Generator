import { getAssetByUrl } from '@/asset-manager';
import getConstants from '@/constants';
import type { IAsset } from '@/render-utils/assets/asset';
import { TextRenderer } from '@/renderer/text-renderer/text-renderer';
import type IPoem from '@/store/object-types/poem';
import { ScalingRenderable } from './scaling-renderable';

const consolePadding = -2;
const consoleTopPadding = 26;
const consoleLineWrapPadding = 10;
const poemTopMargin = 10;

export class Poem extends ScalingRenderable<IPoem> {
	private _paperHeight: number | null = null;
	public get height(): number {
		return this._paperHeight ?? this.obj.height;
	}

	private _paperWidth: number | null = null;
	public get width(): number {
		return this._paperWidth ?? this.obj.width;
	}

	private _paper: IAsset | null = null;
	private _lastPaperUrl: string | null = null;
	public prepareRender(lq: boolean): void | Promise<unknown> {
		const superRet: void | Promise<unknown> = super.prepareRender(lq);
		const constants = getConstants().Poem;
		const bg = constants.poemBackgrounds[this.obj.background];
		const style = constants.poemTextStyles[this.obj.font];
		const render = new TextRenderer(this.obj.text, style);
		const fontLoading = render.loadFonts();
		let imageLoading: Promise<unknown> | undefined = undefined;
		if (!bg.file.startsWith('internal:')) {
			if (this._lastPaperUrl !== bg.file) {
				imageLoading = (async () => {
					this._paper = await getAssetByUrl(
						`assets/poemBackgrounds/${bg.file}`
					);
					this._lastPaperUrl = bg.file;
					this._paperHeight =
						this._paper.height * constants.backgroundScale;
					this._paperWidth =
						this._paper.width * constants.backgroundScale;
				})();
			}
		} else {
			this._lastPaperUrl = null;
			this._paper = null;
			this._paperHeight = null;
			this._paperWidth = null;
		}
		if (superRet || fontLoading || imageLoading) {
			return Promise.all([superRet, fontLoading, imageLoading]);
		}
		return;
	}

	protected renderLocal(ctx: CanvasRenderingContext2D): void {
		const constants = getConstants().Poem;
		const paper = constants.poemBackgrounds[this.obj.background];
		const w = this.width;
		const h = this.height;
		let padding = constants.poemPadding;
		let topPadding = constants.poemTopPadding;
		let lineWrapPadding = padding * 2;

		if (paper.file === 'internal:console') {
			ctx.fillStyle =
				this.obj.consoleColor || constants.consoleBackgroundColor;
			ctx.fillRect(0, 0, w, h);
			padding = consolePadding;
			topPadding = consoleTopPadding;
			lineWrapPadding = consoleLineWrapPadding;
		} else if (this._paper) {
			this._paper.paintOnto(ctx, {
				x: 0,
				y: 0,
				w,
				h,
			});

			if (!this.obj.overflow) {
				const rect = new Path2D();
				rect.rect(0, 0, w, h);
				ctx.clip(rect);
			}
		}

		const style = constants.poemTextStyles[this.obj.font];
		const render = new TextRenderer(this.obj.text, style);
		render.applyLayout(
			'left',
			poemTopMargin + padding,
			padding + topPadding,
			this.width - lineWrapPadding,
			this.obj.autoWrap
		);
		render.render(ctx);
	}
}
