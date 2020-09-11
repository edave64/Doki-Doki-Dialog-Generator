export type SpriteFilter =
	| INumericSpriteFilter<'blur'>
	| INumericSpriteFilter<'brightness'>
	| INumericSpriteFilter<'contrast'>
	| IDropShadowSpriteFilter
	| INumericSpriteFilter<'grayscale'>
	| INumericSpriteFilter<'hue-rotate'>
	| INumericSpriteFilter<'invert'>
	| INumericSpriteFilter<'opacity'>
	| INumericSpriteFilter<'saturate'>
	| INumericSpriteFilter<'sepia'>;

export const percentageValue = new Set<SpriteFilter['type']>([
	'brightness',
	'contrast',
	'grayscale',
	'invert',
	'opacity',
	'saturate',
	'sepia',
]);

export interface IHasSpriteFilters {
	filters: SpriteFilter[];
	composite:
		| 'source-over'
		| 'source-in'
		| 'source-out'
		| 'source-atop'
		| 'destination-over'
		| 'destination-in'
		| 'destination-out'
		| 'destination-atop'
		| 'lighter'
		| 'copy'
		| 'xor'
		| 'multiply'
		| 'screen'
		| 'overlay'
		| 'darken'
		| 'lighten'
		| 'color-dodge'
		| 'color-burn'
		| 'hard-light'
		| 'soft-light'
		| 'difference'
		| 'exclusion'
		| 'hue'
		| 'saturation'
		| 'color'
		| 'luminosity';
}

export interface INumericSpriteFilter<K extends string> {
	type: K;
	value: number;
}

export interface IDropShadowSpriteFilter {
	type: 'drop-shadow';
	offsetX: number;
	offsetY: number;
	blurRadius: number;
	color: string;
}

export interface ISetFilterValue {
	type: Exclude<SpriteFilter['type'], 'drop-shadow'>;
	value: number;
}

export interface ISetDropShadowFilter {
	type: 'drop-shadow';
	offsetX?: number;
	offsetY?: number;
	blurRadius?: number;
	color?: string;
}

export function addFilter(obj: IHasSpriteFilters, type: SpriteFilter['type']) {
	const filter = obj.filters.find(f => f.type === type);
	if (filter) return;
	switch (type) {
		case 'blur':
		case 'grayscale':
		case 'hue-rotate':
		case 'invert':
		case 'sepia':
			obj.filters.push({
				type,
				value: 0,
			});
			return;
		case 'brightness':
		case 'contrast':
		case 'opacity':
		case 'saturate':
			obj.filters.push({
				type,
				value: 1,
			});
			return;
		case 'drop-shadow':
			obj.filters.push({
				type,
				blurRadius: 0,
				offsetX: 10,
				offsetY: 10,
				color: '#555555',
			});
			return;
		default:
			const a: never = type;
			throw new Error(`Unexpected filter type "${type}"`);
	}
}

export type SetFilterValue = ISetFilterValue | ISetDropShadowFilter;

export function applyFilter(obj: IHasSpriteFilters, command: SetFilterValue) {
	const filter = obj.filters.find(f => f.type === command.type);
	if (!filter) return;
	Object.assign(filter, command);
}

export function removeFilter(
	obj: IHasSpriteFilters,
	type: SpriteFilter['type']
) {
	const filterIdx = obj.filters.findIndex(f => f.type === type);
	if (filterIdx === -1) return;
	obj.filters.splice(filterIdx, 1);
}
