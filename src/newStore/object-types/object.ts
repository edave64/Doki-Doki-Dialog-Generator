import getConstants from '@/constants';
import { undoAble } from '@/history-engine/history';
import type { IAssetSwitch } from '@/store/content';
import { decomposeMatrix, mod } from '@/util/math';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { computed, ref, type Ref } from 'vue';
import type { Panel } from '../panels';
import { HasSpriteFilters } from '../sprite-options';
import type Textbox from './textbox';

export default abstract class BaseObject<
	T extends string = string,
> extends HasSpriteFilters {
	public abstract readonly type: T;
	public readonly panelId: Panel['id'] | null = null;
	public readonly id: number;
	// Using a computed property here, to avoid having to repeat the array lookup unless the panel order changes
	protected _onTop = computed({
		get: () => {
			return this.panel.topOrder.includes(this.id);
		},
		set: (onTop: boolean) => {
			this.panel.setOnTop(this, onTop);
		},
	});

	public get initialOnTop(): boolean {
		// Most object types are UI elements, which default to being on top.
		return true;
	}

	protected constructor(
		private panel: Panel,
		id?: BaseObject['id']
	) {
		super();
		this.panelId = panel.id;
		if (id == null) id = panel.lastObjId + 1;
		this.id = id;
		panel.insertObject(this as unknown as GenObject);
	}

	protected mutate<T>(ref: Ref<T>, value: T): void {
		const oldVersion = this._version.value;
		const newVersion = this._version.value + 1;
		const oldValue = ref.value;
		if (oldValue === value) return;
		undoAble(
			() => {
				ref.value = value;
				this._version.value = newVersion;
			},
			() => {
				ref.value = oldValue;
				this._version.value = oldVersion;
			}
		);
	}

	protected mutateX<T extends unknown[]>(
		refs: Ref<unknown>[] & { [K in keyof T]: Ref<T[K]> },
		values: T
	): void {
		const oldVersion = this._version.value;
		const newVersion = this._version.value + 1;
		const oldValues = refs.map((ref) => ref.value);

		for (let i = 0; i < refs.length; i++) {
			if (refs[i].value === values[i]) {
				refs.splice(i, 1);
				values.splice(i, 1);
				oldValues.splice(i, 1);
			}
		}

		if (refs.length === 0) return;

		undoAble(
			() => {
				for (let i = 0; i < refs.length; i++) {
					refs[i].value = values[i];
				}
				this._version.value = newVersion;
			},
			() => {
				for (let i = 0; i < refs.length; i++) {
					refs[i].value = oldValues[i];
				}
				this._version.value = oldVersion;
			}
		);
	}

	/**
	 * Incremented every time the object is modified. This is used to optimize the render cache.
	 */
	protected _version = ref(0);

	//#region Positioning and layering
	protected _x = ref(0);
	protected _y = ref(0);
	protected _width = ref(0);
	protected _height = ref(0);
	protected _preserveRatio = ref(true);
	protected _ratio = ref(1);
	protected _flip = ref(false);

	get x(): number {
		return this._x.value;
	}
	set x(value: number) {
		this.mutate(this._x, value);
	}

	get y(): number {
		return this._y.value;
	}
	set y(value: number) {
		this.mutate(this._y, value);
	}

	get width(): number {
		return this._width.value;
	}
	set width(value: number) {
		this.mutate(this._width, value);
	}

	get height(): number {
		return this._height.value;
	}
	set height(value: number) {
		this.mutate(this._height, value);
	}

	get preserveRatio(): boolean {
		return this._preserveRatio.value;
	}
	set preserveRatio(value: boolean) {
		this.mutateX(
			[this._preserveRatio, this._ratio],
			[value, value ? this.width / this.height : 0]
		);
	}

	get ratio(): number {
		return this._ratio.value;
	}

	get flip(): boolean {
		return this._flip.value;
	}
	set flip(value: boolean) {
		this.mutate(this._flip, value);
	}

	get onTop(): boolean {
		return this._onTop.value;
	}
	set onTop(value: boolean) {
		this._onTop.value = value;
	}
	//#endregion Positioning and layering

	//#region Transformation
	protected _linkedTo = ref<number | null>(null);
	protected _scaleX = ref(1);
	protected _scaleY = ref(1);
	protected _skewX = ref(0);
	protected _skewY = ref(0);
	protected _rotation = ref(0);

	get linkedTo(): number | null {
		return this._linkedTo.value;
	}

	set linkedTo(val: number | null) {
		if (this.linkedTo === val) return;

		if (val !== null) {
			// Detect loops
			if (val === this.id) {
				throw new Error('Object cannot link to itself.');
			}
			const linkedObj = this.panel.objects[val];
			let obj = linkedObj;
			while (obj.linkedTo !== null) {
				if (obj.linkedTo === this.id) {
					throw new Error('Objects cannot be linked recursively.');
				}
				obj = this.panel.objects[obj.linkedTo];
			}

			// Set all transforms on this object so it doesn't change positioning relative to the new
			// linked object
			const inverse = linkedObj.globalTransform.inverse();
			const newTransform = inverse.multiply(this.globalTransform);
			this.mutateByMatrix(newTransform);
		} else {
			// Take all linked transforms and move them into the local object
			this.mutateByMatrix(this.globalTransform);
		}
	}

	protected mutateByMatrix(mrx: DOMMatrixReadOnly) {
		const newVals = decomposeMatrix(mrx);

		this.mutateX(
			[
				this._scaleX,
				this._scaleY,
				this._skewX,
				this._skewY,
				this._rotation,
				this._x,
				this._y,
			],
			[
				newVals.scaleX,
				newVals.scaleY,
				newVals.skewX,
				newVals.skewY,
				newVals.rotation,
				newVals.x,
				newVals.y,
			]
		);
	}

	get scaleX(): number {
		return this._scaleX.value;
	}

	set scaleX(value: number) {
		this.mutate(this._scaleX, roundTo2Dec(value));
	}

	get scaleY(): number {
		return this._scaleY.value;
	}

	set scaleY(value: number) {
		this.mutate(this._scaleY, roundTo2Dec(value));
	}

	get skewX(): number {
		return this._skewX.value;
	}

	set skewX(value: number) {
		this.mutate(this._skewX, roundTo2Dec(mod(value, 180)));
	}

	get skewY(): number {
		return this._skewY.value;
	}

	set skewY(value: number) {
		this.mutate(this._skewY, roundTo2Dec(mod(value, 180)));
	}

	get rotation(): number {
		return this._rotation.value;
	}

	set rotation(value: number) {
		this.mutate(this._rotation, roundTo2Dec(mod(value, 360)));
	}
	//#endregion Transformation

	//#region Talking properties
	protected _label = ref<string | null>(null);
	protected _textboxColor = ref<string | null>(null);
	protected _enlargeWhenTalking = ref(false);
	protected _nameboxWidth = ref<number | null>(null);

	get label(): string | null {
		return this._label.value;
	}

	set label(value: string | null) {
		this.mutate(this._label, value);
	}

	get textboxColor(): string | null {
		return this._textboxColor.value;
	}

	set textboxColor(value: string | null) {
		this.mutate(this._textboxColor, value);
	}

	get enlargeWhenTalking(): boolean {
		return this._enlargeWhenTalking.value;
	}

	set enlargeWhenTalking(value: boolean) {
		this.mutate(this._enlargeWhenTalking, value);
	}

	get nameboxWidth(): number | null {
		return this._nameboxWidth.value;
	}

	set nameboxWidth(value: number | null) {
		this.mutate(this._nameboxWidth, value);
	}
	//#endregion Talking properties

	fixContentPackRemoval(oldContent: ContentPack<IAssetSwitch>) {}
	abstract makeClone(
		panel: Panel,
		idTranslationTable: Map<BaseObject['id'], BaseObject['id']>
	): BaseObject<T>;

	protected _isTalking = computed(() => {
		// TODO: Improve lookup of this property.
		return !!Object.values(this.panel.objects).find(
			(obj) => obj.type === 'textbox' && obj.talkingObjId === this.id
		);
	});

	public get isTalking(): boolean {
		return this._isTalking.value;
	}

	protected _localTransform = computed((): DOMMatrixReadOnly => {
		let transform = new DOMMatrix();
		transform = transform.translate(this.x, this.y);
		const h2 = (this.height / 2) * this.scaleX;
		if ('close' in this && this.close) {
			transform = transform.translate(
				0,
				getConstants().Base.CloseUpYOffset
			);
			// const scaleOffset = 1.03 * this.height;
			transform = transform.translate(0, -h2);
			transform = transform.scale(2, 2);
			transform = transform.translate(0, h2);
		}
		if (this.isTalking && this.enlargeWhenTalking) {
			transform = transform.translate(0, +h2);
			transform = transform.scale(1.05, 1.05);
			transform = transform.translate(0, -h2);
		}
		if (this.rotation !== 0) {
			transform = transform.rotate(0, 0, this.rotation);
		}
		if (this.skewX !== 0) {
			transform = transform.skewX(this.skewX);
		}
		if (this.skewY !== 0) {
			transform = transform.skewY(this.skewY);
		}
		if (this.flip) {
			transform = transform.flipX();
		}
		if (this.scaleX !== 1 || this.scaleY !== 1) {
			transform = transform.scale(this.scaleX, this.scaleY);
		}
		return transform;
	});

	public get localTransform(): DOMMatrixReadOnly {
		return this._localTransform.value;
	}

	protected _globalTransform = computed((): DOMMatrixReadOnly => {
		if (this._linkedTo.value) {
			const linkedObj = this.panel.objects[this._linkedTo.value];
			// During cloning, this might temporarily be set to a non-existing id.
			// TODO: Verify if that's actually needed
			if (!linkedObj) return this.localTransform;
			return linkedObj.globalTransform.multiply(this.localTransform);
		} else {
			return this.localTransform;
		}
	});

	public get globalTransform(): DOMMatrixReadOnly {
		return this._globalTransform.value;
	}
}

function roundTo2Dec(val: number): number {
	return Math.round(val * 100) / 100;
}

export type GenObject = Textbox;

type Pair<K> = [Ref<K>, K];
