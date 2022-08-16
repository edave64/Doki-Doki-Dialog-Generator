<template>
	<color
		v-if="showShadowColor"
		v-model="shadowColor"
		format="rgb"
		@leave="showShadowColor = false"
	/>
	<d-flow v-else no-wraping class="image-options-subpanel">
		<h2>Image options</h2>
		<div class="column ok-col">
			<button @click="$emit('leave')">Back</button>
		</div>
		<div class="column" v-if="!noComposition">
			<label for="compositionSelect">Compositing Mode:</label>
			<l
				to="https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation#Types"
				>[?]
			</l>
			<select id="compositionSelect" v-model="compositionMode" @keydown.stop>
				<option value="source-over">source-over</option>
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
					<select id="addEffect" v-model="addEffectSelection" @keydown.stop>
						<option
							v-for="filterType of filterTypes"
							:key="filterType"
							:value="filterType"
						>
							{{ getFilterLabel(filterType) }}
						</option>
					</select>
					<button
						:disabled="addEffectSelection === ''"
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
							currentFilterIdx === filters.length - 1 || filters.length === 0
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
						:class="{ choiceBtn: true, active: filterIdx === currentFilterIdx }"
						@click="selectFilter(filterIdx)"
					>
						{{ getFilterText(filter) }}
					</div>
				</d-flow>
				<table v-if="currentFilter" class="value-input-table">
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
								<!--suppress XmlDuplicatedId -->
								<input
									id="filter_value"
									:value="(currentFilter.value * 100).toFixed()"
									type="number"
									:max="maxValue"
									:min="minValue"
									@input="
										setValue({ value: Number($event.target.value / 100) })
									"
									@keydown.stop
								/>%
							</td>
						</tr>
						<tr v-if="minValue === 0 && maxValue !== undefined">
							<td colspan="2">
								<slider
									:gradientStops="['#000000', '#ffffff']"
									label=""
									:maxValue="maxValue"
									:modelValue="currentFilter.value * 100"
									no-input
									@update:modelValue="
										setValue({ value: Math.round($event) / 100 })
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
								<!--suppress XmlDuplicatedId -->
								<input
									id="filter_value"
									:value="currentFilter.value"
									type="number"
									:max="maxValue"
									:min="minValue"
									@input="setValue({ value: Number($event.target.value) })"
									@keydown.stop
								/>
							</td>
						</tr>
						<tr v-if="minValue === 0 && maxValue !== undefined">
							<td colspan="2">
								<slider
									:gradientStops="hueStops"
									label=""
									:maxValue="maxValue"
									:modelValue="currentFilter.value"
									no-input
									@update:modelValue="setValue({ value: Math.round($event) })"
								/>
								<slider
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
				</table>
			</d-flow>
		</d-fieldset>
	</d-flow>
</template>

<script lang="ts">
import DFlow from '@/components/ui/d-flow.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import Slider from '@/components/toolbox/subtools/color/slider.vue';
import Color from '@/components/toolbox/subtools/color/color.vue';
import { IObject, ISetCompositionMutation } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { defineComponent, Prop, PropType } from 'vue';
import { CompositeModes } from '@/renderer/rendererContext';
import { DeepReadonly, UnreachableCaseError } from 'ts-essentials';
import {
	IAddFilterAction,
	IHasSpriteFilters,
	IMoveFilterAction,
	INumericSpriteFilter,
	IRemoveFilterAction,
	ISetFilterAction,
	percentageValue,
	SpriteFilter,
} from '@/store/sprite_options';
import { IColor } from '@/util/colors/color';
import { HSLAColor } from '@/util/colors/hsl';
import L from '@/components/ui/link.vue';

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

const filters: ReadonlyArray<SpriteFilter['type']> = Array.from(
	filterText.keys()
).sort();

export default defineComponent({
	components: { DFlow, DFieldset, Color, Slider, L },
	props: {
		type: {
			type: String as PropType<'object' | 'background' | 'panel'>,
			required: true,
		},
		title: {
			type: String,
		},
		id: {} as Prop<IObject['id']>,
		panelId: {
			required: true,
		} as Prop<IPanel['id']>,
		noComposition: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['leave'],
	data: () => ({
		addEffectSelection: '' as SpriteFilter['type'] | '',
		currentFilterIdx: 0,
		showShadowColor: false,
	}),
	computed: {
		object(): DeepReadonly<IHasSpriteFilters> {
			switch (this.type) {
				case 'object':
					return this.$store.state.panels.panels[this.panelId!].objects[
						this.id!
					];
				case 'background':
					return this.$store.state.panels.panels[this.panelId!].background;
				case 'panel':
					return this.$store.state.panels.panels[this.panelId!];
				default:
					throw new UnreachableCaseError(this.type);
			}
		},
		compositionMode: {
			get(): CompositeModes {
				return this.object.composite;
			},
			set(composite: CompositeModes): void {
				this.vuexHistory.transaction(() => {
					switch (this.type) {
						case 'object':
							this.$store.commit('panels/setComposition', {
								id: this.id,
								panelId: this.panelId,
								composite,
							} as ISetCompositionMutation);
							break;
						case 'background':
							break;
						case 'panel':
							break;
						default:
							throw new UnreachableCaseError(this.type);
					}
				});
			},
		},
		filters(): DeepReadonly<SpriteFilter[]> {
			return this.object.filters;
		},
		filterTypes(): ReadonlyArray<SpriteFilter['type']> {
			try {
				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d')!;
				if ('filter' in context) {
					return filters;
				}
			} catch (_e) {}
			return ['opacity'];
		},
		currentFilter(): DeepReadonly<SpriteFilter> | null {
			return this.filters[this.currentFilterIdx] || null;
		},
		isPercentFilter(): boolean {
			const filter = this.currentFilter;
			if (!filter) return false;
			return percentageValue.has(filter.type);
		},
		maxValue(): number | undefined {
			const filter = this.currentFilter;
			if (!filter) return undefined;

			if (filter.type === 'hue-rotate') return 360;
			if (
				filter.type === 'grayscale' ||
				filter.type === 'sepia' ||
				filter.type === 'opacity' ||
				filter.type === 'invert'
			)
				return 100;

			return undefined;
		},
		minValue(): number | undefined {
			const filter = this.currentFilter;
			if (!filter) return undefined;

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
		},
		shadowColor: {
			get(): string | undefined {
				const filter = this.currentFilter;
				if (!filter) return undefined;
				if (!('color' in filter)) return undefined;
				return filter.color;
			},
			set(color: string) {
				this.setValue({ color });
			},
		},
		shadowX: {
			get(): number | undefined {
				const filter = this.currentFilter;
				if (!filter) return undefined;
				if (!('offsetX' in filter)) return undefined;
				return filter.offsetX;
			},
			set(offsetX: number) {
				this.setValue({ offsetX });
			},
		},
		shadowY: {
			get(): number | undefined {
				const filter = this.currentFilter;
				if (!filter) return undefined;
				if (!('offsetY' in filter)) return undefined;
				return filter.offsetY;
			},
			set(offsetY: number) {
				this.setValue({ offsetY });
			},
		},
		shadowBlur: {
			get(): number | undefined {
				const filter = this.currentFilter;
				if (!filter) return undefined;
				if (!('blurRadius' in filter)) return undefined;
				return filter.blurRadius;
			},
			set(blurRadius: number) {
				this.setValue({ blurRadius });
			},
		},
		hueStops(): string[] {
			const stops = this.eightsStops((i) => new HSLAColor(i, 1, 0.5, 1));
			return stops.map((stop) => stop.toRgb().toCss());
		},
	},
	methods: {
		getFilterLabel(type: SpriteFilter['type']): string {
			return filterText.get(type)!;
		},
		getFilterText(filter: SpriteFilter): string {
			if (percentageValue.has(filter.type)) {
				return `${filterText.get(filter.type)} ${(
					(filter as INumericSpriteFilter<any>).value * 100
				).toFixed()}%`;
			} else if (filter.type === 'hue-rotate') {
				return `${filterText.get(filter.type)} ${filter.value.toFixed()}°`;
			} else if (filter.type === 'blur') {
				return `${filterText.get(filter.type)} ${filter.value.toFixed()}px`;
			}
			return filterText.get(filter.type)!;
		},
		objectTypeScope(command: string): string {
			switch (this.type) {
				case 'object':
					return 'panels/object_' + command;
				case 'background':
					return (
						'panels/background' + command[0].toUpperCase() + command.slice(1)
					);
				case 'panel':
					return 'panels/' + command;
			}
		},
		addFilter() {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch(this.objectTypeScope('addFilter'), {
					id: this.id,
					panelId: this.panelId,
					type: this.addEffectSelection,
					idx: this.currentFilterIdx + 1,
				} as IAddFilterAction);
				return;
			});
		},
		selectFilter(idx: number) {
			this.currentFilterIdx = idx;
		},
		removeFilter() {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch(this.objectTypeScope('removeFilter'), {
					id: this.id,
					panelId: this.panelId,
					idx: this.currentFilterIdx,
				} as IRemoveFilterAction);
				return;
			});
		},
		moveFilter(moveBy: number) {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch(this.objectTypeScope('moveFilter'), {
					id: this.id,
					panelId: this.panelId,
					idx: this.currentFilterIdx,
					moveBy,
				} as IMoveFilterAction);
				this.currentFilterIdx += moveBy;
				return;
			});
		},
		setValue(value: Omit<ISetFilterAction, 'id' | 'panelId' | 'idx'>) {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch(this.objectTypeScope('setFilter'), {
					id: this.id,
					panelId: this.panelId,
					idx: this.currentFilterIdx,
					...value,
				} as ISetFilterAction);
			});
		},
		eightsStops(gen: (i: number) => IColor): IColor[] {
			const stops: IColor[] = [];
			for (let i = 0; i <= 8; ++i) {
				stops.push(gen(i / 8));
			}
			return stops;
		},
	},
});
</script>

<style lang="scss" scoped>
h2 {
	text-align: center;
	//noinspection CssOverwrittenProperties
	color: $default-text;
	//noinspection CssOverwrittenProperties
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
			@include height-100();
			flex-direction: column;
			flex-wrap: wrap;
			margin-left: 8px;
		}

		.ok-col {
			width: 42px;

			button {
				@include height-100();
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
		//noinspection CssOverwrittenProperties
		background-color: $default-border;
		//noinspection CssOverwrittenProperties
		background-color: var(--border);
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
