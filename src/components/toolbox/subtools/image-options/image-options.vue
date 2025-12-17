<!--
	Allows picking different effects that can be applied to an object
-->
<template>
	<color-picker
		v-if="showShadowColor"
		v-model="shadowColor"
		format="rgb"
		@leave="showShadowColor = false"
	/>
	<d-flow v-else no-wraping class="image-options-subpanel">
		<h2>Image options</h2>
		<div class="column ok-col">
			<button @click="emit('leave')">Back</button>
		</div>
		<div class="column" v-if="!noComposition">
			<label for="compositionSelect">Compositing Mode:</label>
			<external-link
				to="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation#Types"
				>[?]
			</external-link>
			<select
				id="compositionSelect"
				v-model="compositionMode"
				@keydown.stop
			>
				<option value="source-over">Normal</option>
				<!--
					<option value="source-in">source-in</option>
					<option value="source-out">source-out</option>
				-->
				<option value="source-atop">source-atop</option>
				<option value="destination-over">destination-over</option>
				<option value="destination-in">destination-in</option>
				<option value="destination-in">destination-out</option>
				<option value="destination-in">destination-atop</option>
				<option value="lighter">lighter</option>
				<option value="xor">xor</option>
				<option value="multiply">multiply</option>
				<option value="screen">screen</option>
				<option value="overlay">overlay</option>
				<option value="darken">darken</option>
				<option value="lighten">lighten</option>
				<option value="color-dodge">color-dodge</option>
				<option value="color-burn">color-burn</option>
				<option value="hard-light">hard-light</option>
				<option value="soft-light">soft-light</option>
				<option value="difference">difference</option>
				<option value="exclusion">exclusion</option>
				<option value="hue">hue</option>
				<option value="saturation">saturation</option>
				<option value="color">color</option>
				<option value="luminosity">luminosity</option>
			</select>
		</div>
		<d-fieldset class="column" title="Effects" style="overflow: hidden">
			<d-flow class="filter-flow" no-wraping gap="8px">
				<d-flow direction="vertical" no-wraping>
					<label for="addEffect">Add new effect</label>
					<select
						id="addEffect"
						v-model="addEffectSelection"
						@keydown.stop
					>
						<option
							v-for="filterType of filterTypes"
							:key="filterType"
							:value="filterType"
						>
							{{ getFilterLabel(filterType) }}
						</option>
					</select>
					<button
						:disabled="addEffectSelection === null"
						@click="addFilter"
						@keydown.stop
					>
						Add
					</button>
					<button
						:disabled="!currentFilter"
						@click="removeFilter"
						@keydown.stop
					>
						Remove
					</button>
					<button
						:disabled="currentFilterIdx === 0"
						@click="moveFilter(-1)"
						@keydown.stop
					>
						Move up
					</button>
					<button
						:disabled="
							currentFilterIdx === filters.length - 1 ||
							filters.length === 0
						"
						@click="moveFilter(1)"
						@keydown.stop
					>
						Move down
					</button>
				</d-flow>
				<d-flow maxSize="100%" direction="vertical" no-wraping>
					<div
						v-for="(filter, filterIdx) in filters"
						:key="filterIdx"
						:class="{
							choiceBtn: true,
							active: filterIdx === currentFilterIdx,
						}"
						tabindex="0"
						@click="selectFilter(filterIdx)"
						@keydown.enter="selectFilter(filterIdx)"
						@keydown.space.prevent="selectFilter(filterIdx)"
					>
						{{ getFilterText(filter) }}
					</div>
				</d-flow>
				<table v-if="currentFilter" class="value-input-table">
					<tbody>
						<template v-if="currentFilter.type === 'drop-shadow'">
							<tr>
								<td>
									<label for="shadow_color">Color:</label>
								</td>
								<td>
									<button
										id="shadow_color"
										class="color-button"
										:style="{ background: shadowColor }"
										@click="showShadowColor = true"
									>
										&nbsp;
									</button>
								</td>
							</tr>
							<tr>
								<td>
									<label for="filter_x">X:</label>
								</td>
								<td>
									<input
										id="filter_x"
										type="number"
										v-model.number="shadowX"
										@keydown.stop
									/>
								</td>
							</tr>
							<tr>
								<td>
									<label for="filter_y">Y:</label>
								</td>
								<td>
									<input
										id="filter_y"
										type="number"
										v-model.number="shadowY"
										@keydown.stop
									/>
								</td>
							</tr>
							<tr>
								<td>
									<label for="filter_blur">Blur:</label>
								</td>
								<td>
									<input
										id="filter_blur"
										type="number"
										v-model.number="shadowBlur"
										@keydown.stop
									/>
								</td>
							</tr>
						</template>
						<template v-else-if="isPercentFilter">
							<tr>
								<td>
									<label for="filter_value">Value:</label>
								</td>
								<td>
									<!-- suppress XmlDuplicatedId -->
									<input
										id="filter_value"
										:value="
											(
												currentFilter.value * 100
											).toFixed()
										"
										type="number"
										:max="maxValue"
										:min="minValue"
										@input="updateValue"
										@keydown.stop
									/>%
								</td>
							</tr>
							<tr v-if="minValue === 0 && maxValue !== undefined">
								<td colspan="2">
									<color-slider
										:gradientStops="['#000000', '#ffffff']"
										label=""
										:maxValue="maxValue"
										:modelValue="currentFilter.value * 100"
										no-input
										@update:modelValue="
											setFilterProperty(
												Math.round($event) / 100
											)
										"
									/>
								</td>
							</tr>
						</template>
						<template v-else>
							<tr>
								<td>
									<label for="filter_value">Value:</label>
								</td>
								<td>
									<input
										id="filter_value"
										:value="currentFilter.value"
										type="number"
										:max="maxValue"
										:min="minValue"
										@input="updateValue"
										@keydown.stop
									/>
								</td>
							</tr>
							<tr v-if="minValue === 0 && maxValue !== undefined">
								<td colspan="2">
									<color-slider
										:gradientStops="hueStops"
										label=""
										:maxValue="maxValue"
										:modelValue="currentFilter.value"
										no-input
										@update:modelValue="
											setFilterProperty(
												Math.round($event)
											)
										"
									/>
									<color-slider
										:gradientStops="hueStops"
										label=""
										:maxValue="maxValue"
										:modelValue="currentFilter.value"
										shift-gradient
										no-input
										disabled
									/>
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</d-flow>
		</d-fieldset>
	</d-flow>
</template>

<script lang="ts" setup>
import ColorPicker from '@/components/toolbox/subtools/color/color-picker.vue';
import ColorSlider from '@/components/toolbox/subtools/color/color-slider.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import ExternalLink from '@/components/ui/external-link.vue';
import { transaction } from '@/history-engine/transaction';
import type { CompositeModes } from '@/renderer/renderer-context';
import type { GenObject } from '@/store/object-types/object';
import type { Panel } from '@/store/panels';
import { state } from '@/store/root';
import {
	DropShadowSpriteFilter,
	NumericSpriteFilter,
	percentageValue,
	type SpriteFilter,
} from '@/store/sprite-options';
import { disposeCanvas, makeCanvas } from '@/util/canvas';
import type { IColor } from '@/util/colors/color';
import { HSLAColor } from '@/util/colors/hsl';
import { UnreachableCaseError } from 'ts-essentials';
import { computed, ref, type WritableComputedRef } from 'vue';

const props = defineProps<{
	type: 'object' | 'background' | 'panel';
	id?: GenObject['id'];
	panelId: Panel['id'];
	noComposition?: boolean;
}>();
const emit = defineEmits<{
	leave: [];
}>();

const filterText: ReadonlyMap<SpriteFilter['type'], string> = new Map<
	SpriteFilter['type'],
	string
>([
	['blur', 'Blur'],
	['brightness', 'Brightness'],
	['contrast', 'Contrast'],
	['grayscale', 'Grayscale'],
	['hue-rotate', 'Rotate hue'],
	['invert', 'Invert colors'],
	['opacity', 'Opacity'],
	['saturate', 'Saturate'],
	['sepia', 'Sepia'],
	['drop-shadow', 'Drop shadow'],
]);

const filterTypes: ReadonlyArray<SpriteFilter['type']> = (() => {
	try {
		const canvas = makeCanvas();
		canvas.width = 0;
		canvas.height = 0;
		const context = canvas.getContext('2d')!;
		const hasFilter = 'filter' in context;
		disposeCanvas(canvas);
		if (hasFilter) {
			return Array.from(filterText.keys()).sort();
		}
	} catch {
		// Ignore
	}
	return ['opacity'];
})();

const addEffectSelection = ref<SpriteFilter['type'] | null>(null);
const currentFilterIdx = ref(0);

const object = computed(() => {
	switch (props.type) {
		case 'object':
			return state.panels.panels[props.panelId!].objects[props.id!];
		case 'background':
			return state.panels.panels[props.panelId!].background;
		case 'panel':
			return state.panels.panels[props.panelId!];
		default:
			throw new UnreachableCaseError(props.type);
	}
});

const compositionMode = computed({
	get(): CompositeModes {
		return object.value.composite;
	},
	set(composite: CompositeModes): void {
		transaction(() => {
			object.value.composite = composite;
		});
	},
});

const filters = computed(() => object.value.filters);
const currentFilter = computed(
	() => filters.value[currentFilterIdx.value] ?? null
);

const isPercentFilter = computed(() => {
	const filter = currentFilter.value;
	if (filter == null) return false;
	return percentageValue.has(filter.type);
});

const maxValue = computed(() => {
	const filter = currentFilter.value;
	if (filter == null) return undefined;

	if (filter.type === 'hue-rotate') return 360;
	if (
		filter.type === 'grayscale' ||
		filter.type === 'sepia' ||
		filter.type === 'opacity' ||
		filter.type === 'invert'
	)
		return 100;

	return undefined;
});

const minValue = computed((): number | undefined => {
	const filter = currentFilter.value;
	if (filter == null) return undefined;

	switch (filter.type) {
		case 'blur':
		case 'brightness':
		case 'contrast':
		case 'grayscale':
		case 'hue-rotate':
		case 'invert':
		case 'opacity':
		case 'saturate':
		case 'sepia':
			return 0;
	}

	return undefined;
});

function getFilterLabel(type: SpriteFilter['type']): string {
	return filterText.get(type)!;
}

function getFilterText(filter: SpriteFilter): string {
	if (percentageValue.has(filter.type)) {
		return `${filterText.get(filter.type)} ${(
			(filter as NumericSpriteFilter<string>).value * 100
		).toFixed()}%`;
	} else if (filter.type === 'hue-rotate') {
		return `${filterText.get(filter.type)} ${filter.value.toFixed()}°`;
	} else if (filter.type === 'blur') {
		return `${filterText.get(filter.type)} ${filter.value.toFixed()}px`;
	}
	return filterText.get(filter.type)!;
}

function addFilter() {
	transaction(() => {
		const addEffect = addEffectSelection.value;
		if (addEffect == null) return;
		object.value.addFilter(addEffect, currentFilterIdx.value + 1);
		return;
	});
}

function selectFilter(idx: number) {
	currentFilterIdx.value = idx;
}

function removeFilter() {
	transaction(() => {
		object.value.removeFilter(currentFilterIdx.value);

		if (currentFilterIdx.value >= object.value.filters.length) {
			currentFilterIdx.value = object.value.filters.length - 1;
		}

		return;
	});
}

function moveFilter(moveBy: 1 | -1) {
	transaction(async () => {
		object.value.moveFilter(currentFilterIdx.value, moveBy);
		currentFilterIdx.value += moveBy;
		return;
	});
}

function updateValue(event: Event) {
	let value = Number((event.target as HTMLInputElement).value);
	if (isPercentFilter.value) {
		value = value / 100;
	}
	setFilterProperty(value);
}

function setFilterProperty(value: number) {
	const filter = object.value.filters[
		currentFilterIdx.value
	] as NumericSpriteFilter<string>;
	transaction(() => {
		filter.value = value;
	});
}

//#region Hue
const hueStops = computed((): string[] => {
	const stops = eightsStops((i) => new HSLAColor(i, 1, 0.5, 1));
	return stops.map((stop) => stop.toRgb().toCss());
});

function eightsStops(gen: (i: number) => IColor): IColor[] {
	const stops: IColor[] = [];
	for (let i = 0; i <= 8; ++i) {
		stops.push(gen(i / 8));
	}
	return stops;
}
//#endregion Hue
//#region Drop Shadow
const showShadowColor = ref(false);
const shadowColor = shadowProp('color');
const shadowX = shadowProp('offsetX');
const shadowY = shadowProp('offsetY');
const shadowBlur = shadowProp('blurRadius');

function shadowProp<K extends keyof Omit<DropShadowSpriteFilter, 'type'>>(
	prop: K
): WritableComputedRef<DropShadowSpriteFilter[K]> {
	return computed({
		get(): DropShadowSpriteFilter[K] {
			const filter = currentFilter.value as DropShadowSpriteFilter;
			if (filter == null || !(prop in filter))
				throw new Error(
					'Tried reading shadow prop on a non shadow object'
				);
			return filter[prop];
		},
		set(value: DropShadowSpriteFilter[K]) {
			transaction(() => {
				const filter = object.value.filters[
					currentFilterIdx.value
				] as DropShadowSpriteFilter;
				filter[prop] = value;
			});
		},
	});
}
//#endregion Drop Shadow
</script>

<style lang="scss" scoped>
@use '@/styles/fixes.scss';

h2 {
	text-align: center;
	color: var(--text);
}

.image-options-subpanel {
	&.vertical {
		.column {
			width: 100%;
			margin-top: 8px;

			button,
			select {
				width: 100%;
			}
		}
	}

	&.horizontal {
		h2 {
			writing-mode: vertical-rl;
			height: inherit;
			width: min-content;
		}

		.column {
			display: flex;
			@include fixes.height-100();
			flex-direction: column;
			flex-wrap: wrap;
			margin-left: 8px;
		}

		.ok-col {
			width: 42px;

			button {
				@include fixes.height-100();
			}
		}

		.filter-flow {
			> .vertical {
				width: auto;
			}
		}
	}
}

.choiceBtn {
	overflow: hidden;
	width: 100%;
	height: 24px;
	text-overflow: ellipsis;
	padding: 2px;

	&.active {
		background-color: var(--border);
	}

	&:focus-visible {
		background: blue;
	}
}

.value-input-table {
	td {
		vertical-align: top;
	}

	input,
	.color-button {
		width: 100px;
	}
}
</style>
