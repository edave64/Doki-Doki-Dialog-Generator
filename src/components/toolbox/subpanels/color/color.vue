<template>
	<div :class="{ color: true, vertical }">
		<h2>{{title}}</h2>
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
				<label class="hex-label" :for="`hex_${_uid}`">Hex</label>
				<input :id="`hex_${_uid}`" :value="color" @input="updateHex" />
			</div>
			<button @click="addSwatch">Add as swatch</button>
		</div>
		<div id="color-swatches" :class="{ vertical }">
			<button
				v-for="swatch of swatches"
				class="swatch"
				:key="swatch.color"
				:style="{backgroundColor: swatch.color}"
				:title="swatch.label"
				@click="color = swatch.color; $emit('leave')"
			></button>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
	isWebPSupported,
	registerAsset,
	registerAssetWithURL,
} from '@/asset-manager';
import environment from '@/environments/environment';
import { Part } from '@/models/constants';
import {
	StyleComponent,
	Pose,
	Character,
	Color,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset, ReplaceContentPackAction } from '@/store/content';
import {
	getPose,
	getDataG,
	ISeekPoseAction,
	ISetPosePositionMutation,
	ISetPartAction,
	getData,
	ICharacter,
} from '@/store/objectTypes/characters';
import { IHistorySupport } from '@/plugins/vuex-history';
import { State } from 'vuex-class-decorator';
import SliderGroup from './sliderGroup.vue';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { RGBAColor } from '@/util/colors/rgb';

const generatedPackId = 'dddg.generated.colors';

@Component({
	components: {
		SliderGroup,
	},
})
export default class PartsPanel extends Vue {
	public $store!: Store<IRootState>;

	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	@Prop({ required: true, type: String }) private readonly value!: string;
	@Prop({ type: String, default: '' }) private readonly title!: string;

	private vuexHistory!: IHistorySupport;

	private mode: string = 'hsla';
	private relative: boolean = true;

	private get swatches(): Color[] {
		return this.$store.state.content.current.colors;
	}

	private get color(): string {
		return this.value;
	}

	private set color(newColor: string) {
		this.$emit('input', newColor);
	}

	private updateHex(event: Event) {
		const hex = (event.target as HTMLInputElement).value;
		if (RGBAColor.validHex(hex) && (hex.length === 7 || hex.length === 9)) {
			console.log('setting updateHex', hex);
			this.$emit('input', hex);
		}
	}

	private addSwatch() {
		if (this.swatches.find(swatch => swatch.color === this.color)) return;

		const existingPack = this.$store.state.content.contentPacks.find(
			pack => pack.packId === 'generatedPackId'
		) || {
			packId: generatedPackId,
			packCredits: '',
			characters: [],
			fonts: [],
			backgrounds: [],
			sprites: [],
			poemStyles: [],
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
		};

		this.vuexHistory.transaction(() => {
			this.$store.dispatch('content/replaceContentPack', {
				contentPack: newPack,
				processed: true,
			} as ReplaceContentPackAction);
		});
	}
}
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
