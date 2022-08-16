<template>
	<div>
		<slider
			:label="label1"
			v-model="v1"
			:max-value="maxValue1"
			:gradient-stops="stops1"
		/>
		<slider
			:label="label2"
			v-model="v2"
			:max-value="maxValue2"
			:gradient-stops="stops2"
		/>
		<slider
			:label="label3"
			v-model="v3"
			:max-value="maxValue3"
			:gradient-stops="stops3"
		/>
		<slider
			label="Alpha"
			v-model="a"
			:max-value="255"
			:gradient-stops="stopsAlpha"
		/>
	</div>
</template>

<script lang="ts">
import { IColor } from '@/util/colors/color';
import { RGBAColor } from '@/util/colors/rgb';
import { HSLAColor } from '@/util/colors/hsl';
import Slider from './slider.vue';
import { defineComponent, Prop } from 'vue';

export default defineComponent({
	components: { Slider },
	props: {
		modelValue: {
			type: String,
			validator: (val: string): boolean => !!val.match(/^#[0-9a-f]{6,8}$/i),
		},
		mode: {
			type: String,
		} as Prop<'hsla' | 'rgba'>,
		relative: Boolean,
	},
	data: () => ({
		lastRGBEmit: null as string | null,
		v1: 0,
		v2: 0,
		v3: 0,
		a: 0,
	}),
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
		maxValue1(): number {
			if (this.mode === 'rgba') return 255;
			return 360;
		},
		label1(): string {
			if (this.mode === 'rgba') return 'Red';
			return 'Hue';
		},
		stops1(): string[] {
			let stops: IColor[] = [];
			if (this.mode === 'rgba') {
				const g = this.relative ? this.v2 : 0;
				const b = this.relative ? this.v3 : 0;
				stops = [new RGBAColor(0, g, b, 1), new RGBAColor(255, g, b, 1)];
			} else {
				const s = this.relative ? this.v2 / 100 : 1;
				const l = this.relative ? this.v3 / 100 : 0.5;
				stops = this.eightsStops((i) => new HSLAColor(i, s, l, 1));
			}
			return stops.map((stop) => stop.toRgb().toCss());
		},
		maxValue2(): number {
			if (this.mode === 'rgba') return 255;
			return 100;
		},
		label2(): string {
			if (this.mode === 'rgba') return 'Green';
			return 'Saturation';
		},
		stops2(): string[] {
			let stops: IColor[] = [];
			if (this.mode === 'rgba') {
				const r = this.relative ? this.v1 : 0;
				const b = this.relative ? this.v3 : 0;
				stops = [new RGBAColor(r, 0, b, 1), new RGBAColor(r, 255, b, 1)];
			} else {
				const h = this.relative ? this.v1 / 360 : 0;
				const l = this.relative ? this.v3 / 100 : 0.5;
				stops = this.eightsStops((i) => new HSLAColor(h, i, l, 1));
			}
			return stops.map((stop) => stop.toRgb().toCss());
		},
		maxValue3(): number {
			if (this.mode === 'rgba') return 255;
			return 100;
		},
		label3(): string {
			if (this.mode === 'rgba') return 'Blue';
			return 'Luminosity';
		},
		stops3(): string[] {
			let stops: IColor[] = [];
			if (this.mode === 'rgba') {
				const r = this.relative ? this.v1 : 0;
				const g = this.relative ? this.v2 : 0;
				stops = [new RGBAColor(r, g, 0, 1), new RGBAColor(r, g, 255, 1)];
			} else {
				const h = this.relative ? this.v1 / 360 : 0;
				const s = this.relative ? this.v2 / 100 : 0.5;
				stops = this.eightsStops((i) => new HSLAColor(h, s, i, 1));
			}
			return stops.map((stop) => stop.toRgb().toCss());
		},
		stopsAlpha(): string[] {
			const color = RGBAColor.fromHex(this.modelValue!);
			return [
				new RGBAColor(color.r, color.g, color.b, 0).toCss(),
				new RGBAColor(color.r, color.g, color.b, 1).toCss(),
			];
		},
	},
	created() {
		this.initValues();
	},
	methods: {
		valueChanged() {
			if (this.modelValue === this.lastRGBEmit) return;
			this.initValues();
		},
		updateValue() {
			let newColor: IColor;
			if (this.mode === 'rgba') {
				newColor = new RGBAColor(this.v1, this.v2, this.v3, this.a / 255);
			} else {
				newColor = new HSLAColor(
					this.v1 / 360,
					this.v2 / 100,
					this.v3 / 100,
					this.a / 255
				);
			}
			const rgbColor = newColor.toRgb().toHex();
			if (this.lastRGBEmit === rgbColor) return;
			if (rgbColor.length !== 9) {
				throw new Error(`Invalid color code: ${rgbColor}`);
			}
			this.lastRGBEmit = rgbColor;
			this.$emit('update:modelValue', rgbColor);
		},
		initValues() {
			const color = RGBAColor.fromHex(this.modelValue!);
			this.lastRGBEmit = color.toHex();
			this.a = color.a * 255;
			if (this.mode === 'hsla') {
				const hslColor = color.toHSL();
				this.v1 = hslColor.h * 360;
				this.v2 = hslColor.s * 100;
				this.v3 = hslColor.l * 100;
			} else {
				this.v1 = color.r;
				this.v2 = color.g;
				this.v3 = color.b;
			}
		},
		eightsStops(gen: (i: number) => IColor): IColor[] {
			const stops: IColor[] = [];
			for (let i = 0; i <= 8; ++i) {
				stops.push(gen(i / 8));
			}
			return stops;
		},
	},
	watch: {
		value() {
			this.valueChanged();
		},
		v1() {
			this.updateValue();
		},
		v2() {
			this.updateValue();
		},
		v3() {
			this.updateValue();
		},
		a() {
			this.updateValue();
		},
		mode() {
			this.initValues();
		},
	},
});
</script>

<style lang="scss" scoped>
.slider {
	display: table;
	label {
		text-align: right;
		width: 100px;
	}

	input {
		width: 52px;
	}

	&.vertical {
		> * {
			display: table-row;
		}
	}

	&:not(.vertical) {
		> * {
			display: table-cell;
			vertical-align: middle;
		}
	}
}
</style>
