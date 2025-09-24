import type { Viewport } from '@/newStore/viewport';
import {
	computed,
	inject,
	type ComputedRef,
	type Ref,
	type WritableComputedRef,
} from 'vue';

export function useViewport(): Ref<Viewport> {
	return inject<Ref<Viewport>>('viewport')!;
}

const selectionGetterCache = new WeakMap();
const verticalGetterCache = new WeakMap();

export function useSelection(): WritableComputedRef<Viewport['selection']> {
	const viewport = useViewport();
	const existing = selectionGetterCache.get(viewport);
	if (existing) return existing;
	const comp = computed({
		get() {
			return viewport.value.selection;
		},
		set(newValue: Viewport['selection']) {
			viewport.value.selection = newValue;
		},
	});
	selectionGetterCache.set(viewport, comp);
	return comp;
}

export function useVertical(): ComputedRef<Viewport['isVertical']> {
	const viewport = useViewport();
	const existing = verticalGetterCache.get(viewport);
	if (existing) return existing;
	console.log('make computed');
	const comp = computed(() => viewport.value.isVertical);
	verticalGetterCache.set(viewport, comp);
	return comp;
}
