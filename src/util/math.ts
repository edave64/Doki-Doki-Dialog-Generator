/*
 * Some helpful math functions
 */

/**
 * Limits a value to be between a minimum and maximum value.
 */
export function between(min: number, val: number, max: number) {
	if (min > val) return min;
	if (val > max) return max;
	return val;
}

/**
 * True modulo operation that works properly with negative numbers.
 */
export function mod(a: number, b: number) {
	return ((a % b) + b) % b;
}

/**
 * Checks if two matrices are equal in value.
 */
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

/**
 * Splits a transformation matrix into its individual offset, scale, rotation, and skew components.
 */
export function decomposeMatrix(mat: DOMMatrixReadOnly) {
	const { a, b, c, d, e, f } = mat;
	const delta = a * d - b * c;
	const result = {
		x: e,
		y: f,
		rotation: 0,
		scaleX: 0,
		scaleY: 0,
		skewX: 0,
		skewY: 0,
	};

	if (a != 0 || b != 0) {
		const r = Math.sqrt(a * a + b * b);
		result.rotation =
			((b > 0 ? Math.acos(a / r) : -Math.acos(a / r)) / Math.PI) * 180;
		result.scaleX = r;
		result.scaleY = delta / r;
		result.skewX = (Math.atan((a * c + b * d) / (r * r)) / Math.PI) * 180;
		result.skewY = 0;
	} else if (c != 0 || d != 0) {
		const s = Math.sqrt(c * c + d * d);
		result.rotation =
			((Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s))) /
				Math.PI) *
			180;
		result.scaleX = delta / s;
		result.scaleY = s;
		result.skewX = 0;
		result.skewY = (Math.atan((a * c + b * d) / (s * s)) / Math.PI) * 180;
	} else {
		// Matrix is translation only
	}

	return result;
}
