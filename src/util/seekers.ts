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

export function nsfwArraySeeker(
	array: Array<{ nsfw?: boolean }>,
	pos: number,
	delta: number,
	nsfw: boolean
) {
	let val = pos;
	const length = array.length;
	do {
		val += delta;
		if (val < 0) {
			val += length;
		}
		if (val >= length) {
			val -= length;
		}
	} while (array[val].nsfw && !nsfw);
	return val;
}
