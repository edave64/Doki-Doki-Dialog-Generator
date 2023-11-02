import getConstants from '@/constants';
import environment from '@/environments/environment';
import { RenderContext } from '@/renderer/renderer-context';
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

export class TextBox extends ScalingRenderable<ITextBox> {
	public refObject: IObject | null = null;
	public get refVars(): string {
		const refObj = this.refObject;
		if (!refObj) return '';
		return JSON.stringify([
			refObj.label,
			refObj.textboxColor,
			refObj.nameboxWidth,
		]);
	}

	public get y(): number {
		return this.obj.y;
	}

	public get width(): number {
		return this.textboxRenderer.width;
	}

	public get height(): number {
		return this.textboxRenderer.height;
	}

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

	private lastForcedStyle: ITextBox['style'] | undefined;
	private lastRefVars: string | undefined;
	private lastRefVersion: IObject['version'] | undefined;
	public needsRedraw(): boolean {
		if (super.needsRedraw()) return true;
		if (this.lastForcedStyle !== this.forcedStyle) return true;
		const refObj = this.refObject;
		if (refObj?.version !== this.lastRefVersion) {
			const needsRedraw = this.lastRefVars !== this.refVars;
			if (!needsRedraw) {
				// An updated version doesn't mean that the textbox must redraw. If it's not the case, update the version
				// so we don't need to recompute refVars every time.
				this.lastRefVersion = refObj?.version;
			}
			return needsRedraw;
		}
		return false;
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

	public updatedContent(
		_current: Store<DeepReadonly<IRootState>>,
		panelId: IPanel['id']
	): void {
		super.updatedContent(_current, panelId);

		const talkingObj = this.obj.talkingObjId;
		if (talkingObj !== null && talkingObj !== '$other$') {
			const obj = _current.state.panels.panels[panelId].objects[talkingObj] as
				| IObject
				| undefined;
			this.refObject = obj ?? null;
			return;
		}
		this.refObject = null;
	}

	protected async draw(rx: RenderContext): Promise<void> {
		const constants = getConstants();
		const styleRenderer = this.textboxRenderer;
		const w = styleRenderer.width;
		const w2 = w / 2;
		const baseX = this.flip
			? constants.Base.screenWidth - this.obj.x
			: this.obj.x;
		const x = baseX - w2;
		const y = this.obj.y;
		this.lastRefVars = this.refVars;
		this.lastRefVersion = this.refObject?.version;
		this.lastForcedStyle = this.forcedStyle;

		await styleRenderer.prepare();
		styleRenderer.render(rx.fsCtx);

		if (this.obj.talkingObjId !== null) {
			const name =
				this.obj.talkingObjId === '$other$'
					? this.obj.talkingOther
					: this.refObject?.label ?? 'Missing name';
			await this.renderName(rx, x + styleRenderer.nameboxOffsetX, y, name);
		}

		await this.renderText(rx, x, y, this.obj.autoWrap ? w : 0);
	}

	private async renderName(
		rx: RenderContext,
		x: number,
		y: number,
		name: string
	): Promise<void> {
		const styleRenderer = this.textboxRenderer;
		const w = styleRenderer.nameboxWidth;
		const style: ITextStyle = styleRenderer.nameboxStyle;

		const render = new TextRenderer(name, style);
		await render.loadFonts();

		render.fixAlignment(
			'center',
			x,
			x + w,
			y + styleRenderer.nameboxOffsetY,
			0
		);

		render.render(rx.fsCtx);
	}

	private async renderText(
		rx: RenderContext,
		baseX: number,
		baseY: number,
		maxLineWidth: number
	): Promise<void> {
		const textboxRenderer = this.textboxRenderer;
		const render = new TextRenderer(
			this.obj.text,
			textboxRenderer.textboxStyle
		);
		if (this.obj.autoQuoting && this.obj.talkingObjId !== null) {
			render.quote();
		}
		await render.loadFonts();

		render.fixAlignment(
			'left',
			baseX + textboxRenderer.textOffsetX,
			0,
			baseY + textboxRenderer.nameboxHeight + textboxRenderer.textOffsetY,
			maxLineWidth - textboxRenderer.textOffsetX * 2
		);

		render.render(rx.fsCtx);
	}
}
