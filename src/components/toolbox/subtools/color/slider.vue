<!--
	A slider that allows to pick a value along a colored gradient. Used as part of the color picker.
-->
<template>
	<div :class="{ slider: true, vertical }" @keydown.stop>
		<label :for="_.uid" v-if="!noInput">{{ label }}</label>
		<div>
			<svg
				ref="svg"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 271 24"
				@mousedown="enterSlide"
				@touchstart="enterSlide"
				@mousemove="moveSlide"
				@touchmove="moveSlide"
				@mouseup="exitSlide"
				@touchend="exitSlide"
			>
				<defs>
					<linearGradient
						:id="`gradient${_.uid}`"
						:x1="gradientOffset * 100 + '%'"
						y1="0%"
						:x2="(gradientOffset + 1) * 100 + '%'"
						y2="0%"
						spreadMethod="repeat"
					>
						<stop
							v-for="(color, idx) in gradientStops"
							:key="idx"
							:offset="(idx / (gradientStops.length - 1)) * 100 + '%'"
							:style="'stop-color:' + color"
						/>
					</linearGradient>
				</defs>
				<g>
					<path
						d="M7 0H262V24H7z"
						stroke-width="2"
						paint-order="fill stroke markers"
						:fill="`url(#gradient${_.uid})`"
					/>
					<path :d="pointerPath" stroke-width="2" class="slider-pointer" />
				</g>
			</svg>
		</div>
		<input
			:id="_.uid"
			class="sliderInput"
			min="0"
			:max="maxValue"
			:value="modelValue"
			type="number"
			v-if="!noInput"
			@input="$emit('update:modelValue', parseFloat($event.target.value))"
			@keydown.stop
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, Prop } from 'vue';

const sliderLength = 255;
const sliderOffset = 8;

export default defineComponent({
	props: {
		label: {
			type: String,
			required: true,
		},
		gradientStops: {
			required: true,
		} as Prop<string[]>,
		modelValue: {
			type: Number,
			required: true,
		},
		maxValue: {
			type: Number,
			required: true,
		},
		shiftGradient: {
			type: Boolean,
			default: false,
		},
		noInput: {
			type: Boolean,
			default: false,
		},
	},
	data: () => ({
		slideActive: false,
	}),
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
		pointerPath(): string {
			const val = (this.modelValue / this.maxValue) * sliderLength;
			return `M${val} 0L${val + 14} 0L${val + 7} 12Z`;
		},
		gradientOffset(): number {
			if (!this.shiftGradient) return 0;
			if (this.modelValue === 0) return 0;
			return this.modelValue / this.maxValue;
		},
	},
	methods: {
		enterSlide(event: MouseEvent | TouchEvent): void {
			this.slideActive = true;
			this.moveSlide(event);
		},
		moveSlide(event: MouseEvent | TouchEvent) {
			if (!this.slideActive) return;
			const svg = this.$refs.svg as HTMLElement;
			if (!svg.contains(event.target as Node) && event.target !== svg) return;
			if (event instanceof MouseEvent && event.which !== 1) {
				this.slideActive = false;
				return;
			}
			const bounding = svg.getBoundingClientRect();
			const scale =
				bounding.width / (sliderOffset + sliderLength + sliderOffset);
			const x =
				(event instanceof MouseEvent
					? event.clientX
					: event.touches[0].clientX) - bounding.x;
			const scaledX = x / scale;
			event.preventDefault();
			const value =
				(Math.max(Math.min(scaledX - sliderOffset, sliderLength), 0) /
					sliderLength) *
				this.maxValue;
			this.$emit('update:modelValue', value);
		},
		exitSlide() {
			this.slideActive = false;
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
		svg {
			width: 100%;
			height: 24px;
		}

		> * {
			display: table-row;
		}
	}

	&:not(.vertical) {
		svg {
			width: 271px;
			height: 24px;
		}

		> * {
			display: table-cell;
			vertical-align: middle;
		}
	}
}

svg g {
	//noinspection CssOverwrittenProperties
	stroke: $default-border;
	//noinspection CssOverwrittenProperties
	stroke: var(--border);

	.slider-pointer {
		//noinspection CssOverwrittenProperties
		fill: $default-text;
		//noinspection CssOverwrittenProperties
		fill: var(--text);
	}
}
</style>
