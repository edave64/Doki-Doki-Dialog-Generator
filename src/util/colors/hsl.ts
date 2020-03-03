import { IColor } from './color';
import { RGBAColor } from './rgb';

// tslint:disable: no-magic-numbers
export class HSLAColor implements IColor {
	public constructor(
		public readonly h: number,
		public readonly s: number,
		public readonly l: number,
		public readonly a: number
	) {}

	public toCss(): string {
		if (this.a >= 1) {
			return `hsl(${this.h}, ${this.s}, ${this.l})`;
		}
		return `hsla(${this.h}, ${this.s}, ${this.l}, ${this.a})`;
	}

	public shift(deltas: HSLAColor): HSLAColor {
		let { h, s, l, a } = this;
		h += deltas.h;
		if (h >= 1) {
			h -= 1;
		} else if (h < 0) {
			h += 1;
		}
		if (s + deltas.s > 1) {
			s -= deltas.s;
		} else {
			s += deltas.s;
			if (s < 0) {
				s = 0;
			}
		}
		if (l + deltas.l > 1 || l + deltas.l < 0) {
			l -= deltas.l;
		} else {
			l += deltas.l;
		}
		if (a + deltas.a > 1 || a + deltas.a < 0) {
			a -= deltas.a;
		} else {
			a += deltas.a;
		}
		return new HSLAColor(h, s, l, a);
	}

	public toRgb(): RGBAColor {
		const { h, s, l, a } = this;
		let r: number;
		let g: number;
		let b: number;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = this.hue2rgb(p, q, h + 1 / 3);
			g = this.hue2rgb(p, q, h);
			b = this.hue2rgb(p, q, h - 1 / 3);
		}

		return new RGBAColor(
			Math.round(r * 255),
			Math.round(g * 255),
			Math.round(b * 255),
			a
		);
	}

	public toHSL(): HSLAColor {
		return this;
	}

	private hue2rgb(p: number, q: number, t: number) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
}
