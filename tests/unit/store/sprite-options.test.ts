import {
	DropShadowSpriteFilter,
	HasSpriteFilters,
	loadFilters,
	NumericSpriteFilter,
} from '@/store/sprite-options';
import { describe, expect, it } from 'vitest';

describe('sprite options', () => {
	it('builds numeric and shadow filters with independent clone state', () => {
		class TestFilters extends HasSpriteFilters {}
		const filters = new TestFilters();
		filters.addFilter('brightness', 0);
		filters.addFilter('drop-shadow', 1);
		filters.composite = 'multiply';

		const filterBrightness = filters
			.filters[0] as NumericSpriteFilter<'brightness'>;
		const filterShadow = filters.filters[1] as DropShadowSpriteFilter;

		expect(filters.filters).toHaveLength(2);
		expect(filterBrightness).toBeInstanceOf(NumericSpriteFilter);
		expect(filterBrightness.value).toBe(1);
		expect(filterShadow).toBeInstanceOf(DropShadowSpriteFilter);
		expect(filters.composite).toBe('multiply');

		const shadowClone = (
			filters.filters[1] as DropShadowSpriteFilter
		).clone();
		shadowClone.offsetX = 99;
		expect((filters.filters[1] as DropShadowSpriteFilter).offsetX).toBe(10);
		expect(shadowClone.offsetX).toBe(99);

		const payload = filters.filters.map((filter) => filter.getSave());
		const reloaded = loadFilters(payload);
		const reloadedBrightness =
			reloaded[0] as NumericSpriteFilter<'brightness'>;
		const reloadedShadow = reloaded[1] as DropShadowSpriteFilter;
		expect(reloadedBrightness.type).toBe(filterBrightness.type);
		expect(reloadedBrightness.value).toBe(filterBrightness.value);
		expect(reloadedShadow.type).toBe(filterShadow.type);
		expect(reloadedShadow.offsetX).toBe(filterShadow.offsetX);
		expect(reloadedShadow.offsetY).toBe(filterShadow.offsetY);
		expect(reloadedShadow.blurRadius).toBe(filterShadow.blurRadius);
		expect(reloadedShadow.color).toBe(filterShadow.color);

		filters.removeFilter(0);
		expect(filters.filters).toHaveLength(1);
		filters.moveFilter(0, 1);
		expect(filters.filters[0].type).toBe('drop-shadow');
	});
});
