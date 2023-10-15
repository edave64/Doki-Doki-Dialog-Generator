import { HSLAColor } from './hsl';
import { RGBAColor } from './rgb';

export interface IColor {
	toCss(): string;
	toRgb(): RGBAColor;
	toHSL(): HSLAColor;
}
