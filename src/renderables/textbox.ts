import environment from '@/environments/environment';
import {
	type ITextStyle,
	TextRenderer,
} from '@/renderer/text-renderer/text-renderer';
import type { GenObject } from '@/store/object-types/object';
import type Textbox from '@/store/object-types/textbox';
import type { Panel } from '@/store/panels';
import type { DeepReadonly } from 'ts-essentials';
import { ScalingRenderable } from './scaling-renderable';
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

export class TextBox extends ScalingRenderable<Textbox> {
	private nbTextRenderer: TextRenderer = null!;
	private textRenderer: TextRenderer = null!;

	/**
	 * RefVars are some of the properties of the object set as "Person talking", that can change the rendering of the
	 * textbox. So the textbox must be re-rendered if they change.
	 */
	public getRefVars(): string | null {
		const refObj = this.refObject;
		if (!refObj) return null;
		return JSON.stringify([
			refObj.label,
			refObj.textboxColor,
			refObj.nameboxWidth,
		]);
	}
	private _lastRefVars: string | null = null;

	public getName(): string {
		return this.obj.talkingObjId === '$other$'
			? this.obj.talkingOther
			: (this.refObject?.label ?? 'Missing name');
	}

	protected get canSkipLocal(): boolean {
		return (
			super.canSkipLocal &&
			(this._lastRenderer?.allowSkippingLocal ?? true)
		);
	}

	public prepareData(panel: DeepReadonly<Panel>) {
		super.prepareData(panel);

		if (typeof this.obj.talkingObjId === 'number') {
			this.refObject = panel.objects[this.obj.talkingObjId] ?? null;
		}
	}

	public override prepareRender(lq: boolean): void | Promise<unknown> {
		const ret = super.prepareRender(lq);
		const prepareRet = this.textboxRenderer.prepare();
		const currentRefVars = this.getRefVars();
		if (currentRefVars !== this._lastRefVars) {
			this.localCanvasInvalid = true;
			this._lastRefVars = currentRefVars;
		}

		this.nbTextRenderer = new TextRenderer(
			this.getName(),
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

	protected renderLocal(ctx: CanvasRenderingContext2D): void {
		const styleRenderer = this.textboxRenderer;
		const w = styleRenderer.width;

		if (!this.obj.overflow) {
			const rect = new Path2D();
			rect.rect(0, 0, styleRenderer.width, this.height);
			ctx.clip(rect);
		}

		styleRenderer.render(ctx);

		if (this.obj.talkingObjId !== null) {
			this.renderName(ctx);
		}

		this.renderText(ctx, 0, 0, w);
	}

	private renderName(rx: CanvasRenderingContext2D) {
		const styleRenderer = this.textboxRenderer;
		const w = styleRenderer.nameboxWidth;
		const x = styleRenderer.nameboxOffsetX;
		// Normally, DDLC nameboxes don't have padding, since they are centered. We cheat one in
		// here to make them look better when not centered.
		const padding = styleRenderer.nameboxOffsetX / 2;

		console.log('rendering name', rx.getTransform());

		this.nbTextRenderer.applyLayout(
			'center',
			x + padding,
			styleRenderer.nameboxOffsetY,
			w - padding * 2,
			false
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

		render.applyLayout(
			'left',
			baseX + textboxRenderer.textOffsetX,
			baseY + textboxRenderer.nameboxHeight + textboxRenderer.textOffsetY,
			maxLineWidth - textboxRenderer.textOffsetX * 2,
			this.obj.autoWrap
		);

		render.render(rx);
	}

	public get forcedStyle(): Textbox['style'] {
		const refObject = this.refObject;
		if (
			(this.obj.style === 'normal' || this.obj.style === 'normal_plus') &&
			refObject &&
			(refObject.textboxColor != null || refObject.nameboxWidth != null)
		)
			return 'custom';
		return this.obj.style;
	}

	public refObject: DeepReadonly<GenObject> | null = null;

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

	readonly allowSkippingLocal: boolean;

	prepare(): void | Promise<unknown>;
	render(rx: CanvasRenderingContext2D): void;
}

export interface ITextboxRendererClass {
	readonly id: Textbox['style'];
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
