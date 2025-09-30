import { undoAble } from '@/history-engine/history';
import type { CompositeModes } from '@/renderer/renderer-context';
import { UnreachableCaseError } from 'ts-essentials';
import { markRaw, ref, type Raw, type Ref } from 'vue';

export type SpriteFilter =
	| NumericSpriteFilter<'blur'>
	| NumericSpriteFilter<'brightness'>
	| NumericSpriteFilter<'contrast'>
	| DropShadowSpriteFilter
	| NumericSpriteFilter<'grayscale'>
	| NumericSpriteFilter<'hue-rotate'>
	| NumericSpriteFilter<'invert'>
	| NumericSpriteFilter<'opacity'>
	| NumericSpriteFilter<'saturate'>
	| NumericSpriteFilter<'sepia'>;

export const percentageValue = new Set([
	'brightness',
	'contrast',
	'grayscale',
	'invert',
	'opacity',
	'saturate',
	'sepia',
]);

export abstract class HasSpriteFilters {
	protected _filters = ref<Raw<SpriteFilter>[]>([]);
	protected _composite = ref<CompositeModes>('source-over');

	get filters(): readonly SpriteFilter[] {
		return this._filters.value;
	}

	get composite(): CompositeModes {
		return this._composite.value;
	}

	set composite(composite: CompositeModes) {
		const old = this._composite.value;
		undoAble(
			() => void (this._composite.value = composite),
			() => void (this._composite.value = old)
		);
	}

	addFilter(type: SpriteFilter['type'], idx: number) {
		let newFilter: SpriteFilter;
		switch (type) {
			case 'hue-rotate':
				newFilter = new NumericSpriteFilter(type, 0);
				break;
			case 'sepia':
			case 'invert':
			case 'blur':
			case 'grayscale':
			case 'brightness':
			case 'contrast':
			case 'opacity':
			case 'saturate':
				// TODO: Typescript shits the bed with the as. Investigate. It's related to the clone method.
				newFilter = new NumericSpriteFilter(type, 1) as SpriteFilter;
				break;
			case 'drop-shadow':
				newFilter = new DropShadowSpriteFilter();
				break;
			default:
				throw new UnreachableCaseError(type);
		}
		const filters = this._filters.value;
		undoAble(
			() => void filters.splice(idx, 0, markRaw(newFilter)),
			() => void filters.splice(idx, 1)
		);
	}

	removeFilter(idx: number) {
		const filters = this._filters.value;
		const filter = filters[idx];
		undoAble(
			() => void filters.splice(idx, 1),
			() => void filters.splice(idx, 0, markRaw(filter))
		);
	}

	moveFilter(idx: number, moveBy: -1 | 1) {
		const filters = this._filters.value;
		const filter = filters[idx];
		undoAble(
			() => {
				filters.splice(idx, 1);
				filters.splice(idx + moveBy, 0, filter);
			},
			() => {
				filters.splice(idx + moveBy, 1);
				filters.splice(idx, 0, filter);
			}
		);
	}
}

export class NumericSpriteFilter<K extends string> {
	private readonly _value: Ref<number>;

	constructor(
		public readonly type: K,
		value: number = 0
	) {
		this._value = ref(value);
	}

	get value() {
		return this._value.value;
	}

	set value(value: number) {
		const old = this.value;
		undoAble(
			() => void (this._value.value = value),
			() => void (this._value.value = old)
		);
	}

	public clone(): NumericSpriteFilter<K> {
		return new NumericSpriteFilter(this.type, this.value);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getSave(): any {
		return {
			type: this.type,
			value: this.value,
		};
	}
}

export class DropShadowSpriteFilter {
	public readonly type = 'drop-shadow';

	private readonly _offsetX = ref(10);
	private readonly _offsetY = ref(10);
	private readonly _blurRadius = ref(0);
	private readonly _color = ref('#555555');

	get offsetX() {
		return this._offsetX.value;
	}

	set offsetX(value: number) {
		const old = this._offsetX.value;
		undoAble(
			() => void (this._offsetX.value = value),
			() => void (this._offsetX.value = old)
		);
	}

	get offsetY() {
		return this._offsetY.value;
	}

	set offsetY(value: number) {
		const old = this._offsetY.value;
		undoAble(
			() => void (this._offsetY.value = value),
			() => void (this._offsetY.value = old)
		);
	}

	get blurRadius() {
		return this._blurRadius.value;
	}

	set blurRadius(value: number) {
		const old = this._blurRadius.value;
		undoAble(
			() => void (this._blurRadius.value = value),
			() => void (this._blurRadius.value = old)
		);
	}

	get color() {
		return this._color.value;
	}

	set color(value: string) {
		const old = this._color.value;
		undoAble(
			() => void (this._color.value = value),
			() => void (this._color.value = old)
		);
	}

	public clone(): DropShadowSpriteFilter {
		const ret = new DropShadowSpriteFilter();
		ret._offsetX.value = this._offsetX.value;
		ret._offsetY.value = this._offsetY.value;
		ret._blurRadius.value = this._blurRadius.value;
		ret._color.value = this._color.value;
		return ret;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public getSave(): any {
		return {
			type: 'drop-shadow',
			offsetX: this._offsetX.value,
			offsetY: this._offsetY.value,
			blurRadius: this._blurRadius.value,
			color: this._color.value,
		};
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loadFilters(data: any[]): SpriteFilter[] {
	const ret: SpriteFilter[] = [];
	for (const filterData of data) {
		if (filterData.type === 'drop-shadow') {
			const filter = new DropShadowSpriteFilter();
			filter.offsetX = filterData.offsetX;
			filter.offsetY = filterData.offsetY;
			filter.blurRadius = filterData.blurRadius;
			filter.color = filterData.color;
			ret.push(filter);
		} else {
			const filter = new NumericSpriteFilter(
				filterData.type,
				filterData.value
			);
			ret.push(filter);
		}
	}
	return ret;
}
