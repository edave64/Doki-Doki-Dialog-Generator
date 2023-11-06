/**
 * Some helpful math functions
 */

export function between(min: number, val: number, max: number) {
	if (min > val) return min;
	if (val > max) return max;
	return val;
}

export function matrixEquals(
	a: DOMMatrixReadOnly | null,
	b: DOMMatrixReadOnly | null
) {
	if (a === null && b === null) return true;
	if (a === null || b === null) return false;
	return (
		a.a === b.a &&
		a.b === b.b &&
		a.c === b.c &&
		a.d === b.d &&
		a.e === b.e &&
		a.f === b.f
	);
}
