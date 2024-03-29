/** Helper methods that allow you to create simple vue getters/setters of vuex properties */

import { transaction } from '@/plugins/vuex-history';
import { IRootState } from '@/store';
import { IObject } from '@/store/objects';
import { ComponentCustomProperties, computed, Ref } from 'vue';
import { Store } from 'vuex';

export function genericSetterSplit<T extends IObject, K extends keyof T>(
	store: Store<IRootState>,
	object: Ref<T>,
	message: string,
	action: boolean,
	key: K
) {
	return computed({
		get(): T[K] {
			return object.value[key];
		},
		set(value: T[K]): void {
			transaction(() => {
				store[action ? 'dispatch' : 'commit'](message, {
					panelId: object.value.panelId,
					id: object.value.id,
					key,
					value,
				});
			});
		},
	});
}
export function genericSetterMerged<T extends IObject, K extends keyof T>(
	store: Store<IRootState>,
	object: Ref<T>,
	message: string,
	action: boolean,
	key: K
) {
	return computed({
		get(): T[K] {
			return object.value[key];
		},
		set(value: T[K]): void {
			transaction(() => {
				store[action ? 'dispatch' : 'commit'](message, {
					panelId: object.value.panelId,
					id: object.value.id,
					[key]: value,
				});
			});
		},
	});
}

interface IThis<T extends IObject> extends ComponentCustomProperties {
	object: T;
}
