import { IObject } from '@/store/objects';
import { ComponentCustomProperties } from 'vue';

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
				this.vuexHistory.transaction(() => {
					this.$store[action ? 'dispatch' : 'commit'](message, {
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
				this.vuexHistory.transaction(() => {
					this.$store['commit'](message, {
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

interface IThis<T extends IObject> extends ComponentCustomProperties {
	object: T;
}
