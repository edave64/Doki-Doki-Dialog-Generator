import getConstants from '@/constants';
import environment from '@/environments/environment';
import {
	ITextStyle,
	TextRenderer,
} from '@/renderer/text-renderer/text-renderer';
import { IRootState } from '@/store';
import { ITextBox } from '@/store/object-types/textbox';
import { IObject } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { DeepReadonly } from 'ts-essentials';
import { Store } from 'vuex';
import { Renderable } from './renderable';
import { Corrupted } from './textboxRenderers/corrupt';
import { Custom } from './textboxRenderers/custom';
import { CustomPlus } from './textboxRenderers/custom-plus';
import { Default } from './textboxRenderers/default';
import { None } from './textboxRenderers/none';

export const styleRenderers: ReadonlyArray<ITextboxRendererClass> = [
	Default,
	Corrupted,
	Custom,
	None,
	CustomPlus,
];
export const rendererLookup: Readonly<{
	[id: string]: ITextboxRendererClass;
}> = (() => {
	const ret: { [id: string]: ITextboxRendererClass } = {};

	for (const renderer of styleRenderers) {
		ret[renderer.id] = renderer;
	}

	return ret;
})();

export function getStyles(): DeepReadonly<ITextboxRendererClass>[] {
	const ret = [...styleRenderers];
	const gameMode = environment.gameMode;
	ret.sort((a, b) => {
		if (a.gameMode !== b.gameMode) {
			if (a.gameMode === gameMode) return -1;
			if (b.gameMode === gameMode) return 1;
			if (a.gameMode < b.gameMode) return -1;
			return 1;
		}
		return a.priority - b.priority;
	});
	return ret;
}

export class TextBox extends Renderable<ITextBox> {
	private nbTextRenderer: TextRenderer = null!;
	private textRenderer: TextRenderer = null!;
	protected transformIsLocal = false;
	public prepareRender(
		panel: DeepReadonly<IPanel>,
		store: Store<IRootState>,
		renderables: Map<IObject['id'], DeepReadonly<Renderable<never>>>,
		lq: boolean
	): void | Promise<unknown> {
		const ret = super.prepareRender(panel, store, renderables, lq);
		const prepareRet = this.textboxRenderer.prepare();

		const name =
			this.obj.talkingObjId === '$other$'
				? this.obj.talkingOther
				: this.refObject?.label ?? 'Missing name';
		this.nbTextRenderer = new TextRenderer(
			name,
			this.textboxRenderer.nameboxStyle
		);
		this.textRenderer = new TextRenderer(
			this.obj.text,
			this.textboxRenderer.textboxStyle
		);
		const nameFontLoad = this.nbTextRenderer.loadFonts();
		const textFontLoad = this.textRenderer.loadFonts();

		if (!ret && !prepareRet && !nameFontLoad && !textFontLoad) return;
		return Promise.all([ret, prepareRet, nameFontLoad, textFontLoad]);
	}

	protected renderLocal(ctx: CanvasRenderingContext2D, hq: boolean): void {
		const constants = getConstants();
		const styleRenderer = this.textboxRenderer;
		const w = styleRenderer.width;
		const w2 = w / 2;
		const baseX = this.obj.flip
			? constants.Base.screenWidth - this.obj.x
			: this.obj.x;
		const x = baseX - w2;
		const y = this.obj.y;
		/*
		ctx.fillStyle = '#0f0';
		ctx.fillRect(0, 0, this.obj.width, this.obj.height);
*/
		styleRenderer.render(ctx);

		if (this.obj.talkingObjId !== null) {
			const name =
				this.obj.talkingObjId === '$other$'
					? this.obj.talkingOther
					: this.refObject?.label ?? 'Missing name';
			this.renderName(ctx, styleRenderer.nameboxOffsetX, 0, name);
		}

		this.renderText(ctx, 0, 0, this.obj.autoWrap ? w : 0);
	}

	private renderName(
		rx: CanvasRenderingContext2D,
		x: number,
		y: number,
		name: string
	) {
		const styleRenderer = this.textboxRenderer;
		const w = styleRenderer.nameboxWidth;

		this.nbTextRenderer.fixAlignment(
			'center',
			x,
			x + w,
			y + styleRenderer.nameboxOffsetY,
			0
		);

		this.nbTextRenderer.render(rx);
	}

	private renderText(
		rx: CanvasRenderingContext2D,
		baseX: number,
		baseY: number,
		maxLineWidth: number
	) {
		const textboxRenderer = this.textboxRenderer;
		const render = this.textRenderer;
		if (this.obj.autoQuoting && this.obj.talkingObjId !== null) {
			render.quote();
		}

		render.fixAlignment(
			'left',
			baseX + textboxRenderer.textOffsetX,
			0,
			baseY + textboxRenderer.nameboxHeight + textboxRenderer.textOffsetY,
			maxLineWidth - textboxRenderer.textOffsetX * 2
		);

		render.render(rx);
	}

	public get forcedStyle(): ITextBox['style'] {
		const refObject = this.refObject;
		if (
			(this.obj.style === 'normal' || this.obj.style === 'normal_plus') &&
			refObject &&
			(refObject.textboxColor != null || refObject.nameboxWidth != null)
		)
			return 'custom';
		return this.obj.style;
	}

	public refObject: IObject | null = null;

	private _lastRenderer: ITextboxRenderer | null = null;
	public get textboxRenderer() {
		const forcedStyle = this.forcedStyle;
		const rendererConstructor = rendererLookup[forcedStyle];
		if (
			this._lastRenderer &&
			this._lastRenderer.constructor === rendererConstructor
		) {
			// We need the same type of renderer we used last. So we just skip
			// initialization and use the old one.
			return this._lastRenderer;
		}
		const newRenderer = new rendererConstructor(this);
		this._lastRenderer = newRenderer;
		return newRenderer!;
	}
}

export interface ITextboxRenderer {
	readonly height: number;
	readonly width: number;
	readonly nameboxWidth: number;
	readonly nameboxHeight: number;

	readonly nameboxOffsetX: number;
	readonly nameboxOffsetY: number;
	readonly nameboxStyle: ITextStyle;

	readonly textOffsetX: number;
	readonly textOffsetY: number;
	readonly textboxStyle: ITextStyle;

	prepare(): void | Promise<any>;
	render(rx: CanvasRenderingContext2D): void;
}

export interface ITextboxRendererClass {
	readonly id: ITextBox['style'];
	readonly label: string;
	readonly priority: number;
	readonly gameMode: string;

	readonly defaultWidth: number;
	readonly defaultHeight: number;
	readonly defaultX: number;
	readonly defaultY: number;
	readonly resizable: boolean;

	prototype: ITextboxRenderer;
	new (obj: TextBox): ITextboxRenderer;
}
