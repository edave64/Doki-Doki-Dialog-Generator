import type { HSLAColor } from './hsl';
import type { RGBAColor } from './rgb';

export interface IColor {
	toCss(): string;
	toRgb(): RGBAColor;
	toHSL(): HSLAColor;
}
