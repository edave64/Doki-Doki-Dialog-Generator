import Vue from 'vue';

const eventBus = new Vue();

export default {
	fire(event: IEvent) {
		eventBus.$emit(event.kind, event);
	},

	subscribe<T extends IEvent>(
		eventType: IEventClass<T>,
		handler: (ev: T) => void
	) {
		eventBus.$on(eventType.kind, handler);
	},

	unsubscribe<T extends IEvent>(
		eventType: IEventClass<T>,
		handler: (ev: T) => void
	) {
		eventBus.$off(eventType.kind, handler);
	},
};

interface IEvent {
	kind: string;
}

interface IEventClass<T> {
	kind: string;
	new (...args: any[]): T;
}

// tslint:disable: max-classes-per-file

export class AssetFailureEvent implements IEvent {
	public static readonly kind = 'AssetFailureEvent';
	public readonly kind = 'AssetFailureEvent';
	public constructor(public path: string) {}
}

export class CustomAssetFailureEvent implements IEvent {
	public static readonly kind = 'CustomAssetFailureEvent';
	public readonly kind = 'CustomAssetFailureEvent';
	public constructor(public error: ErrorEvent) {}
}
