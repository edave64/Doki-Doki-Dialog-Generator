import { DeepReadonly } from 'ts-essentials';
import mitt from 'mitt';

const eventBus = mitt();

export default {
	fire(event: IEvent) {
		eventBus.emit(event.kind, event);
	},

	subscribe<T extends IEvent>(
		eventType: IEventClass<T>,
		handler: (ev: T) => void
	) {
		eventBus.on(eventType.kind, handler as any);
	},

	unsubscribe<T extends IEvent>(
		eventType: IEventClass<T>,
		handler: (ev: T) => void
	) {
		eventBus.off(eventType.kind, handler as any);
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
export class FailureEvent implements IEvent {
	public static readonly kind = 'FailureEvent';
	public readonly kind = 'FailureEvent';
	public constructor(public message: string) {}
}
export class CustomAssetFailureEvent implements IEvent {
	public static readonly kind = 'CustomAssetFailureEvent';
	public readonly kind = 'CustomAssetFailureEvent';
	public constructor(public error: ErrorEvent) {}
}

export class InvalidateRenderEvent implements IEvent {
	public static readonly kind = 'InvalidateRenderEvent';
	public readonly kind = 'InvalidateRenderEvent';
}

export class ShowMessageEvent implements IEvent {
	public static readonly kind = 'ShowMessageEvent';
	public readonly kind = 'ShowMessageEvent';
	public constructor(public message: string) {}
}

export class ResolvableErrorEvent implements IEvent {
	public static readonly kind = 'ResolvableErrorEvent';
	public readonly kind = 'ResolvableErrorEvent';
	public constructor(
		public message: string,
		public actions: { name: string; exec: () => void }[]
	) {}
}

export class ColorPickedEvent implements IEvent {
	public static readonly kind = 'ColorPickedEvent';
	public readonly kind = 'ColorPickedEvent';
	public constructor(public color: string) {}
}
export class VueErrorEvent implements IEvent {
	public static readonly kind = 'VueErrorEvent';
	public readonly kind = 'VueErrorEvent';
	public constructor(
		public readonly error: DeepReadonly<Error>,
		public readonly info: string
	) {}
}
