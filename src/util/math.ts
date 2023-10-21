/**
 * Some helpful math functions
 */

export function between(min: number, val: number, max: number) {
	if (min > val) return min;
	if (val > max) return max;
	return val;
}
