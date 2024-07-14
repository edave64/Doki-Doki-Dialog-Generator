import type { DeepReadonly } from 'ts-essentials';

export function arraySeeker<T>(
	array: DeepReadonly<T[]>,
	pos: number,
	delta: number
): number {
	let val = pos + delta;
	const length = array.length;

	if (val < 0) {
		val += length;
	}
	if (val >= length) {
		val -= length;
	}
	return val;
}
