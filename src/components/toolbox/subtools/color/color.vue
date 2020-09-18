<template>
	<div :class="{ color: true, vertical }">
		<h2>{{ title }}</h2>
		<button @click="$emit('leave')">OK</button>
		<table>
			<tr>
				<td>
					<button @click="mode = 'hsla'">HSLA</button>
				</td>
				<td>
					<button @click="mode = 'rgba'">RGBA</button>
				</td>
			</tr>
		</table>

		<div class="column">
			<slider-group :mode="mode" v-model="color" :relative="true" />
			<div class="hex-selector">
				<label class="hex-label" :for="`hex_${_.uid}`">Hex</label>
				<input :id="`hex_${_.uid}`" :modelValue="color" @input="updateHex" />
			</div>
			<button @click="addSwatch">Add as swatch</button>
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
					$emit('leave');
				"
			></button>
		</div>
	</div>
</template>

<script lang="ts">
import {
	Color,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset, ReplaceContentPackAction } from '@/store/content';
import SliderGroup from './sliderGroup.vue';
import { RGBAColor } from '@/util/colors/rgb';
import { defineComponent, PropType } from 'vue';
import { DeepReadonly } from '@/util/readonly';

const generatedPackId = 'dddg.generated.colors';

export default defineComponent({
	components: {
		SliderGroup,
	},
	props: {
		modelValue: {
			required: true,
			type: String,
		},
		title: { default: '' },
		format: {
			type: String as PropType<'rgb' | 'hex'>,
			default: 'hex',
		},
	},
	data: () => ({
		mode: 'hsla',
		relative: true,
	}),
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
		swatches(): DeepReadonly<Color[]> {
			return this.$store.state.content.current.colors;
		},
		color: {
			get(): string {
				if (this.format === 'rgb') {
					const rgb = RGBAColor.fromCss(this.modelValue);
					return rgb.toHex();
				} else {
					return this.modelValue;
				}
			},
			set(newColor: string) {
				if (this.format === 'rgb') {
					const rgb = RGBAColor.fromCss(newColor);
					this.$emit('update:modelValue', rgb.toCss());
				} else {
					this.$emit('update:modelValue', newColor);
				}
			},
		},
	},
	methods: {
		updateHex(event: Event) {
			const hex = (event.target as HTMLInputElement).value;
			// tslint:disable-next-line: no-magic-numbers
			if (RGBAColor.validHex(hex) && (hex.length === 7 || hex.length === 9)) {
				console.log('setting updateHex', hex);
				this.color = hex;
			}
		},
		addSwatch() {
			if (this.swatches.find(swatch => swatch.color === this.color)) return;

			const existingPack = this.$store.state.content.contentPacks.find(
				pack => pack.packId === 'generatedPackId'
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

			const newPack: ContentPack<IAsset> = {
				...existingPack,
				colors: [
					...existingPack.colors,
					{
						label: this.color,
						color: this.color,
					},
				],
			} as any;

			this.vuexHistory.transaction(() => {
				this.$store.dispatch('content/replaceContentPack', {
					contentPack: newPack,
					processed: true,
				} as ReplaceContentPackAction);
			});
		},
	},
});
</script>

<style lang="scss" scoped>
.color {
	display: flex;
	flex-wrap: wrap;

	h2 {
		font-size: 20px;
		color: black;
		font-family: riffic, sans-serif;
		text-align: center;
	}

	&.vertical {
		flex-direction: row;
		width: 100%;

		.column {
			width: 100%;
		}
	}

	&:not(.vertical) {
		flex-direction: column;
		height: 100%;

		h2 {
			writing-mode: vertical-rl;
			height: 100%;
		}

		.column {
			height: 100%;
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
		height: 100%;
		flex-direction: column;
	}

	.swatch {
		height: 42px;
		width: 42px;
		margin: 1px;
		border-color: black;
	}
}
</style>
