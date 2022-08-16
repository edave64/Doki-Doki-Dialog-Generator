import { HSLAColor } from './hsl';

// tslint:disable: no-magic-numbers
export class RGBAColor {
	public static validCss(str: string): boolean {
		return this.validCssRgb(str) || this.validHex(str);
	}

	public static fromCss(str: string): RGBAColor {
		if (this.validCssRgb(str)) {
			return this.fromCssRgb(str);
		}
		if (this.validHex(str)) {
			return this.fromHex(str);
		}
		throw new Error('Invalid RGB color format');
	}

	public static validCssRgb(str: string): boolean {
		return this.rgbEx.test(str) || this.rgbaEx.test(str);
	}

	public static fromCssRgb(str: string): RGBAColor {
		if (!this.validCssRgb(str)) throw new Error('Invalid RGB color format');
		const rgbHead = str.slice(0, -1);
		const parentesisPos = rgbHead.indexOf('(');
		const rbgTail = rgbHead.slice(parentesisPos + 1);
		const elements = rbgTail.split(',').map((x) => parseFloat(x.trim()));
		return new RGBAColor(
			elements[0],
			elements[1],
			elements[2],
			elements.length === 4 ? elements[3] : 1
		);
	}

	public static validHex(str: string): boolean {
		return this.hexShortEx.test(str) || this.hexLongEx.test(str);
	}

	public static fromHex(str: string): RGBAColor {
		if (!this.validHex(str)) throw new Error('Invalid Hex color format');
		const hexTail = str.slice(1);
		if (hexTail.length === 3) {
			return new RGBAColor(
				parseInt(hexTail[0] + hexTail[0], 16),
				parseInt(hexTail[1] + hexTail[1], 16),
				parseInt(hexTail[2] + hexTail[2], 16),
				1
			);
		}
		if (hexTail.length === 4) {
			return new RGBAColor(
				parseInt(hexTail[0] + hexTail[0], 16),
				parseInt(hexTail[1] + hexTail[1], 16),
				parseInt(hexTail[2] + hexTail[2], 16),
				parseInt(hexTail[3] + hexTail[3], 16) / 255
			);
		}
		if (hexTail.length === 6) {
			return new RGBAColor(
				parseInt(hexTail[0] + hexTail[1], 16),
				parseInt(hexTail[2] + hexTail[3], 16),
				parseInt(hexTail[4] + hexTail[5], 16),
				1
			);
		}
		if (hexTail.length === 8) {
			return new RGBAColor(
				parseInt(hexTail[0] + hexTail[1], 16),
				parseInt(hexTail[2] + hexTail[3], 16),
				parseInt(hexTail[4] + hexTail[5], 16),
				parseInt(hexTail[6] + hexTail[7], 16) / 255
			);
		}
		throw new Error('Invalid Hex color format length');
	}

	private static rgbEx = /^rgb\((\d*?),(\d*?),(\d*?)\)$/i;
	private static rgbaEx = /^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),([\d.]+)\)$/i;
	private static hexShortEx = /^#[0-9A-Z]{3,4}$/i;
	private static hexLongEx = /^#[0-9A-Z]{6,8}$/i;

	public constructor(
		public readonly r: number,
		public readonly g: number,
		public readonly b: number,
		public readonly a: number
	) {}

	public toCss(): string {
		if (this.a > 1) {
			return `rgb(${this.r},${this.g},${this.b})`;
		}
		return `rgba(${this.r},${this.g},${this.b},${this.a})`;
	}

	public toHex(): string {
		return `#${Math.round(this.r).toString(16).padStart(2, '0')}${Math.round(
			this.g
		)
			.toString(16)
			.padStart(2, '0')}${Math.round(this.b)
			.toString(16)
			.padStart(2, '0')}${Math.round(this.a * 255)
			.toString(16)
			.padStart(2, '0')}`;
	}

	public toRgb(): RGBAColor {
		return this;
	}

	public toHSL(): HSLAColor {
		let { r, g, b } = this;
		const { a } = this;
		r /= 255;
		g /= 255;
		b /= 255;
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h: number;
		let s: number;
		const l: number = (max + min) / 2;

		if (max === min) {
			h = s = 0; // achromatic
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h! /= 6;
		}

		return new HSLAColor(h!, s, l, a);
	}

	public get luminance(): number {
		return Math.sqrt(
			Math.pow(0.299 * (this.r / 255), 2) +
				Math.pow(0.587 * (this.g / 255), 2) +
				Math.pow(0.114 * (this.b / 255), 2)
		);
	}
}
