<!--
	A color picker. It allows RGBA and HSLA color inputs, has sliders for picking colors, a color-picker button
	and color swatches. The value is returned as either rgba or hex.
-->
<template>
	<div :class="{ color: true, vertical }" class="v-w100 h-h100">
		<h2>{{ title }}</h2>
		<button @click="emit('leave')">OK</button>
		<table>
			<tbody>
				<tr>
					<td>
						<button @click="mode = 'hsla'">HSLA</button>
					</td>
					<td>
						<button @click="mode = 'rgba'">RGBA</button>
					</td>
				</tr>
			</tbody>
		</table>

		<div class="v-w100 h-h100">
			<slider-group :mode="mode" v-model="color" :relative="true" />
			<div class="hex-selector">
				<label class="hex-label" :for="`hex_${id}`">Hex</label>
				<input
					:id="`hex_${id}`"
					:value="color"
					@input="updateHex"
					@keydown.stop
				/>
			</div>
			<d-flow direction="global" class="color-tools">
				<button @click="addSwatch">Add as swatch</button>
				<d-button class="h-bl0 v-bt0" icon="colorize" @click="pickColor"
					>Pick color</d-button
				>
			</d-flow>
		</div>
		<div id="color-swatches" :class="{ vertical }">
			<button
				v-for="swatch of swatches"
				class="swatch"
				:key="swatch.color"
				:style="{ backgroundColor: swatch.color }"
				:title="swatch.label"
				@click="
					color = swatch.color;
					emit('leave');
				"
			></button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import DFlow from '@/components/ui/d-flow.vue';
import eventBus, { ColorPickedEvent } from '@/eventbus/event-bus';
import { useVertical } from '@/hooks/use-viewport';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import type { IAssetSwitch, ReplaceContentPackAction } from '@/store/content';
import { RGBAColor } from '@/util/colors/rgb';
import uniqId from '@/util/unique-id';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import type { DeepReadonly } from 'ts-essentials';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import DButton from '../../../ui/d-button.vue';
import SliderGroup from './slider-group.vue';

defineOptions({ inheritAttrs: false });
const props = withDefaults(
	defineProps<{
		title?: string;
		format?: 'rgb' | 'hex';
	}>(),
	{ format: 'hex', title: '' }
);
const model = defineModel<string>({
	required: true,
});
const emit = defineEmits<{
	leave: [];
}>();
const store = useStore();

const generatedPackId = 'dddg.generated.colors';
const id = uniqId();
const mode = ref('hsla' as 'hsla' | 'rgba' | undefined);
const vertical = useVertical();
const color = computed({
	get(): string {
		if (props.format === 'rgb') {
			const rgb = RGBAColor.fromCss(model.value);
			return rgb.toHex();
		} else {
			return model.value;
		}
	},
	set(newColor: string) {
		if (props.format === 'rgb') {
			const rgb = RGBAColor.fromCss(newColor);
			model.value = rgb.toCss();
		} else {
			model.value = newColor;
		}
	},
});

function updateHex(event: Event) {
	const hex = (event.target as HTMLInputElement).value;
	if (RGBAColor.validHex(hex) && (hex.length === 7 || hex.length === 9)) {
		color.value = hex;
	}
}
//#region Swatches
const swatches = computed(() => store.state.content.current.colors);

function addSwatch() {
	if (swatches.value.find((swatch) => swatch.color === color.value)) return;
	const existingPack: DeepReadonly<ContentPack<IAssetSwitch>> =
		store.state.content.contentPacks.find(
			(pack) => pack.packId === generatedPackId
		) || {
			packId: generatedPackId,
			packCredits: [''],
			dependencies: [],
			characters: [],
			fonts: [],
			backgrounds: [],
			sprites: [],
			poemStyles: [],
			poemBackgrounds: [],
			colors: [],
		};

	const newPack: ContentPack<IAssetSwitch> = {
		...existingPack,
		colors: [
			...existingPack.colors,
			{
				label: color.value,
				color: color.value,
			},
		],
	} as unknown as ContentPack<IAssetSwitch>;

	transaction(async () => {
		await store.dispatch('content/replaceContentPack', {
			contentPack: newPack,
			processed: true,
		} as ReplaceContentPackAction);
	});
}
//#endregion Swatches
//#region Picker
function pickColor(): void {
	transaction(() => {
		// Notifies the render.vue to switch into color picker mode
		store.commit('ui/setColorPicker', true);
	});
}

function settingColor(ev: ColorPickedEvent) {
	color.value = RGBAColor.fromCss(ev.color).toHex();
}

onMounted(() => {
	// Notification from render.vue, that a color was picked
	eventBus.subscribe(ColorPickedEvent, settingColor);
});

onUnmounted(() => {
	eventBus.unsubscribe(ColorPickedEvent, settingColor);
});
//#endregion Picker
</script>

<style lang="scss" scoped>
@use '@/styles/fixes.scss';

.color {
	display: flex;
	flex-wrap: wrap;

	//noinspection CssOverwrittenProperties
	h2 {
		font-size: 20px;
		color: var(--text);
		font-family: riffic, sans-serif;
		text-align: center;
	}

	&.vertical {
		flex-direction: row;
	}

	&:not(.vertical) {
		flex-direction: column;

		h2 {
			writing-mode: vertical-rl;
			height: inherit;
			width: min-content;
		}
	}
}

.hex-selector {
	display: table;

	label {
		text-align: right;
		width: 100px;
	}

	input {
		margin-left: 7px;
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

#color-swatches {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-evenly;

	&.vertical {
		margin-top: 4px;
		width: 100%;
		flex-direction: row;
	}

	&:not(.vertical) {
		margin-left: 4px;
		@include fixes.height-100();
		flex-direction: column;
	}

	.swatch {
		height: 42px;
		width: 42px;
		margin: 1px;
		border-color: black;
	}
}

.color-tools button {
	height: 30px;
}
</style>
