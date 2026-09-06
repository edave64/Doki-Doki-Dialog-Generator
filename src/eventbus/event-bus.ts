import mitt from 'mitt';
import type { DeepReadonly } from 'ts-essentials';

const eventBus = mitt();

export default {
	fire(event: IEvent) {
		eventBus.emit(event.kind, event);
	},

	subscribe<T extends IEvent>(
		eventType: IEventClass<T>,
		handler: (ev: T) => void
	) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		eventBus.on(eventType.kind, handler as any);
	},

	unsubscribe<T extends IEvent>(
		eventType: IEventClass<T>,
		handler: (ev: T) => void
	) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		eventBus.off(eventType.kind, handler as any);
	},
};

interface IEvent {
	kind: string;
}

interface IEventClass<T> {
	kind: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	new (...args: any[]): T;
}

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

export class InvalidateAllThumbnails implements IEvent {
	public static readonly kind = 'InvalidateAllThumbnails';
	public readonly kind = 'InvalidateAllThumbnails';
}

export class RenderUpdatedEvent implements IEvent {
	public static readonly kind = 'RenderUpdatedEvent';
	public readonly kind = RenderUpdatedEvent.kind;
}

export class StateLoadingEvent implements IEvent {
	public static readonly kind = 'StateLoadingEvent';
	public readonly kind = StateLoadingEvent.kind;
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

export class ShowDialogEvent implements IEvent {
	public static readonly kind = 'ShowDialogEvent';
	public readonly kind = 'ShowDialogEvent';
	public constructor(
		public id: number,
		public text: string,
		public options: string[],
		public closeOption: string
	) {}
}

export class DialogResponseEvent implements IEvent {
	public static readonly kind = 'DialogResponseEvent';
	public readonly kind = 'DialogResponseEvent';
	public constructor(
		public id: number,
		public result: string
	) {}
}

export class ColorPickedEvent implements IEvent {
	public static readonly kind = 'ColorPickedEvent';
	public readonly kind = 'ColorPickedEvent';
	public constructor(public color: string) {}
}

export class ReloadLocalRepoEvent implements IEvent {
	public static readonly kind = 'ReloadLocalRepoEvent';
	public readonly kind = 'ReloadLocalRepoEvent';
}

export class VueErrorEvent implements IEvent {
	public static readonly kind = 'VueErrorEvent';
	public readonly kind = 'VueErrorEvent';
	public constructor(
		public readonly error: DeepReadonly<Error>,
		public readonly info: string
	) {}
}
