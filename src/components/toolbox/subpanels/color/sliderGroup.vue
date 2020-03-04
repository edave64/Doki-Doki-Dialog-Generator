<template>
	<div>
		<slider :label="label1" v-model="v1" :max-value="maxValue1" :gradient-stops="stops1" />
		<slider :label="label2" v-model="v2" :max-value="maxValue2" :gradient-stops="stops2" />
		<slider :label="label3" v-model="v3" :max-value="maxValue3" :gradient-stops="stops3" />
		<slider label="Alpha" v-model="a" :max-value="255" :gradient-stops="stopsAlpha" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';
import { IColor } from '@/util/colors/color';
import { RGBAColor } from '@/util/colors/rgb';
import { HSLAColor } from '@/util/colors/hsl';
import Slider from './slider.vue';

// tslint:disable: no-magic-numbers

@Component({
	components: { Slider },
})
export default class SliderGroup extends Vue {
	@Prop({ type: String, validator: val => val.match(/^#[0-9a-f]{6,8}$/i) })
	private value!: string;
	@Prop({}) private mode!: 'hsla' | 'rgba';
	@Prop({ type: Boolean }) private relative!: boolean;

	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	private lastRGBEmit: string | null = null;
	private v1: number = 0;
	private v2: number = 0;
	private v3: number = 0;
	private a: number = 0;

	private created() {
		this.initValues();
	}

	@Watch('value')
	private valueChanged() {
		if (this.value === this.lastRGBEmit) return;
		this.initValues();
	}

	@Watch('v1')
	@Watch('v2')
	@Watch('v3')
	@Watch('a')
	private updateValue() {
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
		console.log('setting rgb', rgbColor);
		this.$emit('input', rgbColor);
	}

	@Watch('mode')
	private initValues() {
		const color = RGBAColor.fromHex(this.value);
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
	}

	private get maxValue1(): number {
		if (this.mode === 'rgba') return 255;
		return 360;
	}

	private get label1(): string {
		if (this.mode === 'rgba') return 'Red';
		return 'Hue';
	}

	private get stops1(): string[] {
		const color = RGBAColor.fromHex(this.value);
		let stops: IColor[] = [];
		if (this.mode === 'rgba') {
			const g = this.relative ? this.v2 : 0;
			const b = this.relative ? this.v3 : 0;
			stops = [new RGBAColor(0, g, b, 1), new RGBAColor(255, g, b, 1)];
		} else {
			const s = this.relative ? this.v2 / 100 : 1;
			const l = this.relative ? this.v3 / 100 : 0.5;
			stops = this.eightsStops(i => new HSLAColor(i, s, l, 1));
		}
		return stops.map(stop => stop.toRgb().toCss());
	}

	private get maxValue2(): number {
		if (this.mode === 'rgba') return 255;
		return 100;
	}

	private get label2(): string {
		if (this.mode === 'rgba') return 'Green';
		return 'Saturation';
	}

	private get stops2(): string[] {
		const color = RGBAColor.fromHex(this.value);
		let stops: IColor[] = [];
		if (this.mode === 'rgba') {
			const r = this.relative ? this.v1 : 0;
			const b = this.relative ? this.v3 : 0;
			stops = [new RGBAColor(r, 0, b, 1), new RGBAColor(r, 255, b, 1)];
		} else {
			const h = this.relative ? this.v1 / 360 : 0;
			const l = this.relative ? this.v3 / 100 : 0.5;
			stops = this.eightsStops(i => new HSLAColor(h, i, l, 1));
		}
		return stops.map(stop => stop.toRgb().toCss());
	}

	private get maxValue3(): number {
		if (this.mode === 'rgba') return 255;
		return 100;
	}

	private get label3(): string {
		if (this.mode === 'rgba') return 'Blue';
		return 'Luminosity';
	}

	private get stops3(): string[] {
		const color = RGBAColor.fromHex(this.value);
		let stops: IColor[] = [];
		if (this.mode === 'rgba') {
			const r = this.relative ? this.v1 : 0;
			const g = this.relative ? this.v2 : 0;
			stops = [new RGBAColor(r, g, 0, 1), new RGBAColor(r, g, 255, 1)];
		} else {
			const h = this.relative ? this.v1 / 360 : 0;
			const s = this.relative ? this.v2 / 100 : 0.5;
			stops = this.eightsStops(i => new HSLAColor(h, s, i, 1));
		}
		return stops.map(stop => stop.toRgb().toCss());
	}

	private get stopsAlpha(): string[] {
		const color = RGBAColor.fromHex(this.value);
		return [
			new RGBAColor(color.r, color.g, color.b, 0).toCss(),
			new RGBAColor(color.r, color.g, color.b, 1).toCss(),
		];
	}

	private eightsStops(gen: (i: number) => IColor): IColor[] {
		const stops: IColor[] = [];
		for (let i = 0; i <= 8; ++i) {
			stops.push(gen(i / 8));
		}
		return stops;
	}
}
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
