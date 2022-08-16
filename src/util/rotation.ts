export function rotateAround(
	x: number,
	y: number,
	relX: number,
	relY: number,
	angle: number
): [number, number] {
	const angleCos = Math.cos(angle);
	const angleSin = Math.sin(angle);
	const translatedX = x - relX;
	const translatedY = y - relY;
	const rotatedX = angleCos * translatedX - angleSin * translatedY + relX;
	const rotatedY = angleSin * translatedX + angleCos * translatedY + relY;
	return [rotatedX, rotatedY];
}
