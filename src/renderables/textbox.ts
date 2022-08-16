import { RenderContext } from '@/renderer/rendererContext';
import { ITextBox } from '@/store/objectTypes/textbox';
import { ITextStyle, TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { ScalingRenderable } from './scalingRenderable';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { IObject } from '@/store/objects';
import getConstants from '@/constants';
import environment from '@/environments/environment';
import { Default } from './textboxRenderers/default';
import { Corrupted } from './textboxRenderers/corrupt';
import { Custom } from './textboxRenderers/custom';
import { None } from './textboxRenderers/none';
import { CustomPlus } from './textboxRenderers/custom_plus';
import { DeepReadonly } from 'ts-essentials';
import { IPanel } from '@/store/panels';

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
		if (this._lastRenderer && this._lastRenderer.appliesTo(this.obj.style)) {
			return this._lastRenderer;
		}
		const forcedStyle = this.forcedStyle;
		if (!rendererLookup[forcedStyle])
			throw new Error('Unknown textbox style renderer');
		const newRenderer = new rendererLookup[forcedStyle](this);

		this._lastRenderer = newRenderer;
		return newRenderer!;
	}

	public get forcedStyle(): ITextBox['style'] {
		if (
			(this.obj.style === 'normal' || this.obj.style === 'normal_plus') &&
			this.refObject &&
			(this.refObject.textboxColor || this.refObject.nameboxWidth !== null)
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
			const obj = _current.state.panels.panels[panelId].objects[
				talkingObj
			] as IObject;
			if (obj) {
				this.refObject = obj;
				return;
			}
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

		await styleRenderer.render(rx);

		if (this.obj.talkingObjId !== null) {
			const name =
				this.obj.talkingObjId === '$other$'
					? this.obj.talkingOther
					: this.refObject?.label || 'Missing name';
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
		const render = new TextRenderer(
			this.obj.text,
			this.textboxRenderer.textboxStyle
		);
		if (this.obj.autoQuoting && this.obj.talkingObjId !== null) {
			render.quote();
		}
		await render.loadFonts();

		render.fixAlignment(
			'left',
			baseX + this.textboxRenderer.textOffsetX,
			0,
			baseY +
				this.textboxRenderer.nameboxHeight +
				this.textboxRenderer.textOffsetY,
			maxLineWidth - this.textboxRenderer.textOffsetX * 2
		);

		render.render(rx.fsCtx);
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

	render(rx: RenderContext): Promise<void>;
	appliesTo(type: string): boolean;
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
