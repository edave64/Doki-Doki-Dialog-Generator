<!--
	A slider that allows to pick a value along a colored gradient. Used as part of the color picker.
-->
<template>
	<div :class="{ slider: true, vertical }" @keydown.stop>
		<label :for="id" v-if="!noInput">{{ label }}</label>
		<div>
			<svg
				ref="svg"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 271 24"
				@mousedown="startDrag"
				@touchstart="startDrag"
				@touchmove="moveDrag"
				@touchend="endDrag"
			>
				<defs>
					<linearGradient
						:id="`gradient${id}`"
						:x1="gradientOffset * 100 + '%'"
						y1="0%"
						:x2="(gradientOffset + 1) * 100 + '%'"
						y2="0%"
						spreadMethod="repeat"
					>
						<stop
							v-for="(color, idx) in gradientStops"
							:key="idx"
							:offset="
								(idx / (gradientStops.length - 1)) * 100 + '%'
							"
							:style="'stop-color:' + color"
						/>
					</linearGradient>
				</defs>
				<g>
					<path
						d="M7 0H262V24H7z"
						stroke-width="2"
						paint-order="fill stroke markers"
						:fill="`url(#gradient${id})`"
					/>
					<path
						:d="pointerPath"
						stroke-width="2"
						class="slider-pointer"
					/>
				</g>
			</svg>
		</div>
		<input
			:id="id"
			class="sliderInput"
			min="0"
			:max="maxValue"
			:value="modelValue"
			type="number"
			v-if="!noInput"
			@input="onInput"
			@keydown.stop
		/>
	</div>
</template>

<script lang="ts" setup>
import { useStore } from '@/store';
import uniqId from '@/util/unique-id';
import { computed, type PropType, ref } from 'vue';

const props = defineProps({
	label: {
		type: String,
		required: true,
	},
	gradientStops: {
		required: true,
		type: Array as PropType<string[]>,
	},
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
});
const emit = defineEmits<{
	'update:modelValue': [value: number];
}>();

const sliderLength = 255;
const sliderOffset = 8;
const id = uniqId();

const store = useStore();
const vertical = computed(() => store.state.ui.vertical);
const svg = ref(null! as SVGElement);

const pointerPath = computed(() => {
	const val = (props.modelValue / props.maxValue) * sliderLength;
	return `M${val} 0L${val + 14} 0L${val + 7} 12Z`;
});
const gradientOffset = computed(() => {
	if (!props.shiftGradient) return 0;
	if (props.modelValue === 0) return 0;
	return props.modelValue / props.maxValue;
});

function onInput(event: Event) {
	emit(
		'update:modelValue',
		parseFloat((event.target as HTMLInputElement).value)
	);
}
//#region Drag and Drop
const dragActive = ref(false);
function startDrag(event: MouseEvent | TouchEvent): void {
	dragActive.value = true;
	moveDrag(event);
	if (event instanceof MouseEvent) {
		window.addEventListener('mousemove', moveDrag);
		window.addEventListener('mouseup', endDrag);
	}
	event.preventDefault();
}
function moveDrag(event: MouseEvent | TouchEvent) {
	if (!dragActive.value) return;
	const svgE = svg.value;
	if (event instanceof MouseEvent && event.buttons === 0) {
		endDrag();
		return;
	}
	event.preventDefault();
	const bounding = svgE.getBoundingClientRect();
	const scale = bounding.width / (sliderOffset + sliderLength + sliderOffset);
	const x =
		(event instanceof MouseEvent
			? event.clientX
			: event.touches[0].clientX) - bounding.x;
	const scaledX = x / scale;
	const value =
		(Math.max(Math.min(scaledX - sliderOffset, sliderLength), 0) /
			sliderLength) *
		props.maxValue;
	emit('update:modelValue', value);
	event.preventDefault();
}
function endDrag() {
	dragActive.value = false;
	window.removeEventListener('mousemove', moveDrag);
	window.removeEventListener('mouseup', endDrag);
}
//#endregion Drag and Drop
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
	stroke: var(--border);

	.slider-pointer {
		fill: var(--text);
	}
}
</style>
