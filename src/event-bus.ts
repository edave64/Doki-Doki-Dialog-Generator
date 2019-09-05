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
