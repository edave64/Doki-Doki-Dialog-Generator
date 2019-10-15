import { RGBAColor } from './rgb';
import { HSLAColor } from './hsl';

export interface IColor {
	toCss(): string;
	toRgb(): RGBAColor;
	toHSL(): HSLAColor;
}
