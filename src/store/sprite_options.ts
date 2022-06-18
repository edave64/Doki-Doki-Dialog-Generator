import { ICommand } from '@/eventbus/command';
import { CompositeModes } from '@/renderer/rendererContext';
import { UnreachableCaseError } from 'ts-essentials';

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
	composite: CompositeModes;
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

export function addFilter(
	action: IAddFilterAction,
	objLookup: (id: string) => IHasSpriteFilters,
	setMutation: (mutation: ISetFiltersMutation) => void
): void {
	const obj = objLookup(action.id);
	const filters = [...obj.filters];
	let newFilter: SpriteFilter;
	switch (action.type) {
		case 'hue-rotate':
			newFilter = {
				type: action.type,
				value: 0,
			};
			break;
		case 'sepia':
		case 'invert':
		case 'blur':
		case 'grayscale':
		case 'brightness':
		case 'contrast':
		case 'opacity':
		case 'saturate':
			newFilter = {
				type: action.type,
				value: 1,
			};
			break;
		case 'drop-shadow':
			newFilter = {
				type: action.type,
				blurRadius: 0,
				offsetX: 10,
				offsetY: 10,
				color: '#555555',
			};
			break;
		default:
			throw new UnreachableCaseError(action.type);
	}
	filters.splice(action.idx, 0, newFilter);

	setMutation({
		id: action.id,
		filters,
	});
}

export function removeFilter(
	action: IRemoveFilterAction,
	objLookup: (id: string) => IHasSpriteFilters,
	setMutation: (mutation: ISetFiltersMutation) => void
) {
	const obj = objLookup(action.id);
	const filters = [...obj.filters];
	filters.splice(action.idx, 1);
	setMutation({
		id: action.id,
		filters,
	} as ISetFiltersMutation);
}

export function moveFilter(
	action: IMoveFilterAction,
	objLookup: (id: string) => IHasSpriteFilters,
	setMutation: (mutation: ISetFiltersMutation) => void
) {
	const obj = objLookup(action.id);
	const filters = [...obj.filters];
	const filter = filters[action.idx];
	filters.splice(action.idx, 1);
	filters.splice(action.idx + action.moveBy, 0, filter);
	setMutation({
		id: action.id,
		filters,
	} as ISetFiltersMutation);
}

export function setFilter(
	action: ISetFilterAction,
	objLookup: (id: string) => IHasSpriteFilters,
	setMutation: (mutation: ISetFiltersMutation) => void
) {
	const obj = objLookup(action.id);
	const filters = [...obj.filters];
	const filter = { ...filters[action.idx] } as SpriteFilter;
	filters[action.idx] = filter;

	if (filter.type === 'drop-shadow') {
		if (action.blurRadius !== undefined) {
			filter.blurRadius = action.blurRadius;
		}
		if (action.color !== undefined) {
			filter.color = action.color;
		}
		if (action.offsetX !== undefined) {
			filter.offsetX = action.offsetX;
		}
		if (action.offsetY !== undefined) {
			filter.offsetY = action.offsetY;
		}
	} else {
		filter.value = action.value!;
	}
	setMutation({
		id: action.id,
		filters,
	} as ISetFiltersMutation);
}

export type SetFilterValue = ISetFilterValue | ISetDropShadowFilter;

export function applyFilter(obj: IHasSpriteFilters, command: SetFilterValue) {
	const filter = obj.filters.find((f) => f.type === command.type);
	if (!filter) return;
	Object.assign(filter, command);
}

export interface ISetCompositionMutation extends ICommand {
	readonly composite: CompositeModes;
}

export interface ISetFiltersMutation extends ICommand {
	readonly filters: SpriteFilter[];
}

export interface IAddFilterAction extends ICommand {
	readonly type: SpriteFilter['type'];
	readonly idx: number;
}

export interface IRemoveFilterAction extends ICommand {
	readonly idx: number;
}

export interface IMoveFilterAction extends ICommand {
	readonly idx: number;
	readonly moveBy: number;
}

export interface ISetFilterAction extends ICommand {
	readonly idx: number;
	readonly value?: number;
	readonly offsetX?: number;
	readonly offsetY?: number;
	readonly blurRadius?: number;
	readonly color?: string;
}
