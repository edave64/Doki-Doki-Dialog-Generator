export type DeepReadonly<T> = T extends any[]
	? DeepReadonlyArray<T[number]>
	: T extends object
	? DeepReadonlyObject<T>
	: T;

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
	readonly [KEY in keyof T]: DeepReadonly<T[KEY]>;
};
