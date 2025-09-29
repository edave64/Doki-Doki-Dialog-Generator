import getConstants from '@/constants';
import { rendererLookup } from '@/renderables/textbox';
import { between } from '@/util/math';
import { ref, type Ref } from 'vue';
import type { Panel } from '../panels';
import BaseObject, { type GenObject } from './object';

export type TextboxStyle =
	| 'normal'
	| 'normal_plus'
	| 'corrupt'
	| 'corrupt_plus'
	| 'custom'
	| 'custom_plus'
	| 'none';

const splitTextboxSpacing = 4;

export default class Textbox extends BaseObject<'textBox'> {
	public get type() {
		return 'textBox' as const;
	}

	protected constructor(
		panel: Panel,
		id?: GenObject['id'],
		{
			text,
			resetBounds,
			style,
		}: {
			text?: string;
			resetBounds?: ResetBounds;
			style?: TextboxStyle;
		} = {}
	) {
		super(panel, id);

		const constants = getConstants();
		style ??= constants.TextBox.DefaultTextboxStyle;
		const renderer = rendererLookup[style];
		this._resetBounds = ref(
			resetBounds ?? {
				x: renderer.defaultX,
				y: renderer.defaultY,
				width: renderer.defaultWidth,
				height: renderer.defaultHeight,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				skewX: 0,
				skewY: 0,
			}
		);
		this._customColor = ref(constants.TextBoxCustom.textboxDefaultColor);
		this._customControlsColor = ref(
			constants.TextBoxCustom.controlsDefaultColor
		);
		this._customNameboxColor = ref(
			constants.TextBoxCustom.nameboxDefaultColor
		);
		this._customNameboxStroke = ref(
			constants.TextBoxCustom.nameboxStrokeDefaultColor
		);
		this.applyResetBounds();
		this._style.value = style;
		if (text) {
			this._text.value = text;
		}
	}

	public static create(panel: Panel, text?: string) {
		return new Textbox(panel, undefined, { text });
	}

	override prepareSiblingRemoval(object: BaseObject): void {
		if (object.id === this.talkingObjId) {
			this.talkingObjId = null;
		}
		super.prepareSiblingRemoval(object);
	}

	//#region Talking properties
	protected readonly _text = ref('Click here to edit the textbox');
	protected readonly _talkingObjId = ref<null | '$other$' | GenObject['id']>(
		null
	);
	protected readonly _talkingOther = ref('');
	protected readonly _autoQuoting = ref(true);
	protected readonly _overflow = ref(false);

	public get text(): string {
		return this._text.value;
	}

	public set text(value: string) {
		this.mutate(this._text, value);
	}

	public get talkingObjId(): null | '$other$' | GenObject['id'] {
		return this._talkingObjId.value;
	}

	public set talkingObjId(value: null | '$other$' | GenObject['id']) {
		this.mutate(this._talkingObjId, value);
	}

	public get talkingOther(): string {
		return this._talkingOther.value;
	}

	public set talkingOther(value: string) {
		if (this.talkingObjId === '$other$') {
			this.mutate(this._talkingOther, value);
		} else {
			this.mutateX(
				//@ts-expect-error: mutateX doesn't like union types
				[this._talkingObjId, this._talkingOther],
				['$other$', value]
			);
		}
	}

	public get autoQuoting(): boolean {
		return this._autoQuoting.value;
	}

	public set autoQuoting(value: boolean) {
		this.mutate(this._autoQuoting, value);
	}

	public get overflow(): boolean {
		return this._overflow.value;
	}

	public set overflow(value: boolean) {
		this.mutate(this._overflow, value);
	}
	//#endregion Talking properties

	//#region Style
	protected readonly _style = ref<TextboxStyle>('normal');
	protected readonly _overrideColor = ref(false);
	protected readonly _customColor: Ref<string>;
	protected readonly _deriveCustomColors = ref(true);
	protected readonly _customControlsColor: Ref<string>;
	protected readonly _customNameboxColor: Ref<string>;
	protected readonly _customNameboxStroke: Ref<string>;
	protected readonly _customNameboxWidth = ref<number | null>(null);

	public get style(): TextboxStyle {
		return this._style.value;
	}

	public set style(value: TextboxStyle) {
		const constants = getConstants();

		const oldStyle = this.style;
		const oldX = this.x;
		const oldY = this.y;
		const oldWidth = this.width;
		const oldHeight = this.height;

		const oldRenderer = rendererLookup[oldStyle];
		const newRenderer = rendererLookup[value];

		let newX = oldX;
		let newY = oldY;
		let newWidth = oldWidth;
		let newHeight = oldHeight;

		const safetyMargin = 10;

		if (!newRenderer.resizable) {
			newWidth = newRenderer.defaultWidth;
			newHeight = newRenderer.defaultHeight;
		} else {
			if (oldRenderer.defaultWidth !== newRenderer.defaultWidth) {
				newWidth = Math.max(
					newWidth +
						newRenderer.defaultWidth -
						oldRenderer.defaultWidth,
					safetyMargin
				);
			}
			if (oldRenderer.defaultHeight !== newRenderer.defaultHeight) {
				newHeight = Math.max(
					newHeight +
						newRenderer.defaultHeight -
						oldRenderer.defaultHeight,
					safetyMargin
				);
			}
		}
		if (oldRenderer.defaultX !== newRenderer.defaultX) {
			newX = between(
				-newWidth + safetyMargin,
				newX + newRenderer.defaultX - oldRenderer.defaultX,
				constants.Base.screenWidth - safetyMargin
			);
		}
		if (oldRenderer.defaultY !== newRenderer.defaultY) {
			newY = between(
				-newHeight + safetyMargin,
				newY + newRenderer.defaultY - oldRenderer.defaultY,
				constants.Base.screenHeight - safetyMargin
			);
		}

		this.mutateX(
			[this._x, this._y, this._height, this._width, this._style],
			[newX, newY, newHeight, newWidth, value]
		);
	}

	get overrideColor(): boolean {
		return this._overrideColor.value;
	}

	set overrideColor(value: boolean) {
		this.mutate(this._overrideColor, value);
	}

	get customColor(): string {
		return this._customColor.value;
	}

	set customColor(value: string) {
		this.mutate(this._customColor, value);
	}

	get deriveCustomColors(): boolean {
		return this._deriveCustomColors.value;
	}

	set deriveCustomColors(value: boolean) {
		this.mutate(this._deriveCustomColors, value);
	}

	get customControlsColor(): string {
		return this._customControlsColor.value;
	}

	set customControlsColor(value: string) {
		this.mutate(this._customControlsColor, value);
	}

	get customNameboxColor(): string {
		return this._customNameboxColor.value;
	}

	set customNameboxColor(value: string) {
		this.mutate(this._customNameboxColor, value);
	}

	get customNameboxStroke(): string {
		return this._customNameboxStroke.value;
	}

	set customNameboxStroke(value: string) {
		this.mutate(this._customNameboxStroke, value);
	}

	get customNameboxWidth(): number | null {
		return this._customNameboxWidth.value;
	}

	set customNameboxWidth(value: number | null) {
		this.mutate(this._customNameboxWidth, value);
	}
	//#endregion Style

	//#region Reset bounds
	protected readonly _resetBounds: Ref<{
		x: number;
		y: number;
		width: number;
		height: number;
		rotation: number;
		skewX: number;
		skewY: number;
		scaleX: number;
		scaleY: number;
	}>;

	public applyResetBounds() {
		const resetBounds = this._resetBounds.value;
		this.mutateX(
			[
				this._x,
				this._y,
				this._height,
				this._width,
				this._rotation,
				this._skewX,
				this._skewY,
				this._scaleX,
				this._scaleY,
			],
			[
				resetBounds.x,
				resetBounds.y,
				resetBounds.height,
				resetBounds.width,
				resetBounds.rotation,
				resetBounds.skewX,
				resetBounds.skewY,
				resetBounds.scaleX,
				resetBounds.scaleY,
			]
		);
	}
	//#endregion Reset bounds

	//#region Splitting
	splitTextbox() {
		const newWidth = (this.width - splitTextboxSpacing) / 2;
		const centerDistance = newWidth / 2 + splitTextboxSpacing / 2;

		const transform = this.localTransform;

		const boxOneCoords = transform.transformPoint(
			new DOMPointReadOnly(-centerDistance, 0)
		);

		const boxTwoCoords = transform.transformPoint(
			new DOMPointReadOnly(centerDistance, 0)
		);

		const newBounds = {
			x: boxOneCoords.x,
			y: boxOneCoords.y,
			width: newWidth,
			height: this.height,
			rotation: this.rotation,
			scaleX: this.scaleX,
			scaleY: this.scaleY,
			skewX: this.skewX,
			skewY: this.skewY,
		};
		this.mutate(this._resetBounds, newBounds);
		this.applyResetBounds();

		const newStyle =
			this.style === 'custom_plus' ? 'custom_plus' : 'custom';
		this.mutate(this._style, newStyle);

		const newBox = new Textbox(this.panel, undefined, {
			resetBounds: {
				x: boxTwoCoords.x,
				y: boxTwoCoords.y,
				width: newWidth,
				height: this.height,
				rotation: this.rotation,
				scaleX: this.scaleX,
				scaleY: this.scaleY,
				skewX: this.skewX,
				skewY: this.skewY,
			},
			style: newStyle,
		});

		if (this.flip) {
			newBox.flip = true;
		}

		// Positioning should already be done through the reset bounds, so we don't use the full
		// this.linkedTo setter here
		this.mutate(newBox._linkedTo, this._linkedTo.value);
	}
	//#endregion Splitting

	//#region Controls
	protected readonly _controls = ref(true);
	protected readonly _skip = ref(true);
	protected readonly _autoWrap = ref(true);
	protected readonly _continue = ref(true);

	public get controls(): boolean {
		return this._controls.value;
	}

	public set controls(value: boolean) {
		this.mutate(this._controls, value);
	}

	public get skip(): boolean {
		return this._skip.value;
	}

	public set skip(value: boolean) {
		this.mutate(this._skip, value);
	}

	public get autoWrap(): boolean {
		return this._autoWrap.value;
	}

	public set autoWrap(value: boolean) {
		this.mutate(this._autoWrap, value);
	}

	public get continue(): boolean {
		return this._continue.value;
	}

	public set continue(value: boolean) {
		this.mutate(this._continue, value);
	}
	//#endregion Controls

	public override makeClone(
		panel: Panel,
		idTranslationTable: Map<GenObject['id'], GenObject['id']>
	): Textbox {
		const newObj = new Textbox(panel, idTranslationTable.get(this.id));
		this.moveAllRefs(this, newObj);
		return newObj;
	}
}

interface ResetBounds {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	skewX: number;
	skewY: number;
	scaleX: number;
	scaleY: number;
}
