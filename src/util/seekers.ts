import { DeepReadonly } from 'ts-essentials';

export function arraySeeker(
	array: DeepReadonly<any[]>,
	pos: number,
	delta: number
) {
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
