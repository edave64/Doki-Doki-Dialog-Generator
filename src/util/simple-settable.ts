/** Helper methods that allow you to create simple vue getters/setters of vuex properties */

import { transaction } from '@/history-engine/transaction';
import type { GenObject } from '@/store/object-types/object';
import {} from 'ts-essentials';
import { computed, type Ref } from 'vue';

export function propWithTransaction<T extends GenObject, K extends keyof T>(
	obj: Ref<T>,
	key: K
): Ref<T[K]> {
	return computed({
		get(): T[K] {
			return obj.value[key];
		},
		set(value: T[K]): void {
			transaction(() => {
				obj.value[key] = value;
			});
		},
	});
}

export function methodWithTransaction<T extends object, K extends keyof T>(
	obj: Ref<T>,
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	key: K & (T[K] extends Function ? K : never)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): T[K] extends (...args: any[]) => any
	? (...args: Parameters<T[K]>) => ReturnType<T[K]>
	: never {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return ((...args: any[]) => {
		transaction(() => {
			//@ts-expect-error As with anything here, I don't know how to type this
			obj.value[key](...args);
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}) as any;
}
