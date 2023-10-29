/** Helper methods that allow you to create simple vue getters/setters of vuex properties */

import { transaction } from '@/plugins/vuex-history';
import { IRootState } from '@/store';
import { IObject } from '@/store/objects';
import { ComponentCustomProperties, computed, Ref } from 'vue';
import { Store, useStore } from 'vuex';

const store = useStore() as Store<IRootState>;

export function genericSetable<T extends IObject>() {
	return function setable<K extends keyof T>(
		key: K,
		message: string,
		action = false
	) {
		return {
			get(this: IThis<T>): T[K] {
				return this.object[key];
			},
			set(this: IThis<T>, val: T[K]): void {
				transaction(async () => {
					await this.$store[action ? 'dispatch' : 'commit'](message, {
						panelId: this.object.panelId,
						id: this.object.id,
						[key]: val,
					});
				});
			},
		};
	};
}

export function genericSimpleSetter<T extends IObject, KT extends keyof T>(
	message: string
) {
	return function setable<K extends KT>(key: K) {
		return {
			get(this: IThis<T>): T[K] {
				return this.object[key];
			},
			set(this: IThis<T>, value: T[K]): void {
				transaction(() => {
					store.commit(message, {
						panelId: this.object.panelId,
						id: this.object.id,
						key,
						value,
					});
				});
			},
		};
	};
}

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
