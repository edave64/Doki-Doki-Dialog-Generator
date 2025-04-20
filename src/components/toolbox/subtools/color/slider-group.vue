<!--
	The four sliders in the color picker.
-->
<template>
	<div>
		<color-slider
			:label="slider1.label.value"
			v-model="v1"
			:max-value="slider1.maxValue.value"
			:gradient-stops="slider1.stops.value"
		/>
		<color-slider
			:label="slider2.label.value"
			v-model="v2"
			:max-value="slider2.maxValue.value"
			:gradient-stops="slider2.stops.value"
		/>
		<color-slider
			:label="slider3.label.value"
			v-model="v3"
			:max-value="slider3.maxValue.value"
			:gradient-stops="slider3.stops.value"
		/>
		<color-slider
			label="Alpha"
			v-model="a"
			:max-value="255"
			:gradient-stops="stopsAlpha"
		/>
	</div>
</template>

<script lang="ts" setup>
import type { IColor } from '@/util/colors/color';
import { HSLAColor } from '@/util/colors/hsl';
import { RGBAColor } from '@/util/colors/rgb';
import { computed, type ComputedRef, type PropType, ref, watch } from 'vue';
import ColorSlider from './color-slider.vue';

const props = defineProps({
	modelValue: {
		type: String,
		validator: (val: string): boolean => !!val.match(/^#[0-9a-f]{6,8}$/i),
	},
	mode: {
		type: String as PropType<'hsla' | 'rgba'>,
	},
	relative: Boolean,
});
const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const lastRGBEmit = ref(null as string | null);
const v1 = ref(0);
const v2 = ref(0);
const v3 = ref(0);
const a = ref(0);

const slider1 = stop({
	rgba: {
		label: 'Red',
		stops() {
			const g = props.relative ? v2.value : 0;
			const b = props.relative ? v3.value : 0;
			return [new RGBAColor(0, g, b, 1), new RGBAColor(255, g, b, 1)];
		},
	},
	hsla: {
		label: 'Hue',
		max: 360,
		stops() {
			const s = props.relative ? v2.value / 100 : 1;
			const l = props.relative ? v3.value / 100 : 0.5;
			return eightsStops((i) => new HSLAColor(i, s, l, 1));
		},
	},
});

const slider2 = stop({
	rgba: {
		label: 'Green',
		stops() {
			const r = props.relative ? v1.value : 0;
			const b = props.relative ? v3.value : 0;
			return [new RGBAColor(r, 0, b, 1), new RGBAColor(r, 255, b, 1)];
		},
	},
	hsla: {
		label: 'Saturation',
		stops() {
			const h = props.relative ? v1.value / 360 : 0;
			const l = props.relative ? v3.value / 100 : 0.5;
			return eightsStops((i) => new HSLAColor(h, i, l, 1));
		},
	},
});

const slider3 = stop({
	rgba: {
		label: 'Blue',
		stops() {
			const r = props.relative ? v1.value : 0;
			const g = props.relative ? v2.value : 0;
			return [new RGBAColor(r, g, 0, 1), new RGBAColor(r, g, 255, 1)];
		},
	},
	hsla: {
		label: 'Luminosity',
		stops() {
			const h = props.relative ? v1.value / 360 : 0;
			const s = props.relative ? v2.value / 100 : 0.5;
			return eightsStops((i) => new HSLAColor(h, s, i, 1));
		},
	},
});

const stopsAlpha = computed((): string[] => {
	const color = RGBAColor.fromHex(props.modelValue!);
	return [
		new RGBAColor(color.r, color.g, color.b, 0).toCss(),
		new RGBAColor(color.r, color.g, color.b, 1).toCss(),
	];
});

function valueChanged() {
	if (props.modelValue === lastRGBEmit.value) return;
	initValues();
}

function updateValue() {
	let newColor: IColor;
	if (props.mode === 'rgba') {
		newColor = new RGBAColor(v1.value, v2.value, v3.value, a.value / 255);
	} else {
		newColor = new HSLAColor(
			v1.value / 360,
			v2.value / 100,
			v3.value / 100,
			a.value / 255
		);
	}
	const rgbColor = newColor.toRgb().toHex();
	if (lastRGBEmit.value === rgbColor) return;
	if (rgbColor.length !== 9) {
		throw new Error(`Invalid color code: ${rgbColor}`);
	}
	lastRGBEmit.value = rgbColor;
	emit('update:modelValue', rgbColor);
}

function initValues() {
	const color = RGBAColor.fromHex(props.modelValue!);
	lastRGBEmit.value = color.toHex();
	a.value = color.a * 255;
	if (props.mode === 'hsla') {
		const hslColor = color.toHSL();
		v1.value = hslColor.h * 360;
		v2.value = hslColor.s * 100;
		v3.value = hslColor.l * 100;
	} else {
		v1.value = color.r;
		v2.value = color.g;
		v3.value = color.b;
	}
}

function eightsStops(gen: (i: number) => IColor): IColor[] {
	const stops: IColor[] = [];
	for (let i = 0; i <= 8; ++i) {
		stops.push(gen(i / 8));
	}
	return stops;
}

watch(() => props.modelValue, valueChanged);
watch(() => props.mode, initValues, { immediate: true });
watch(() => [v1.value, v2.value, v3.value, a.value], updateValue);

interface IConfig {
	label: string;
	max?: number;
	stops: () => IColor[];
}

function stop({ rgba, hsla }: { rgba: IConfig; hsla: IConfig }): {
	maxValue: ComputedRef<number>;
	label: ComputedRef<string>;
	stops: ComputedRef<string[]>;
} {
	const maxValue = computed(() =>
		props.mode === 'rgba' ? 255 : (hsla.max ?? 100)
	);
	const label = computed(() =>
		props.mode === 'rgba' ? rgba.label : hsla.label
	);
	const stops = computed(() => {
		const stops = props.mode === 'rgba' ? rgba.stops() : hsla.stops();
		return stops.map((stop) => stop.toRgb().toCss());
	});

	return { maxValue, label, stops };
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
