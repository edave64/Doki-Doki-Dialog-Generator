<template>
	<div :class="{ color: true, vertical }">
		<h2>{{title}}</h2>
		<button @click="$emit('leave')">OK</button>
		<!--
		<toggle
			label="Relative color preview?"
			title="Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render."
			v-model="lqRendering"
		/>
		<button>HSLA</button>
		<button>RGBA</button>
		<template v-if="mode === 'hsla'">
			<color-slider min="0" max="360" v-model="h" :gradient="hGradient" />
			<color-slider min="0" max="360" v-model="s" :gradient="sGradient" />
			<color-slider min="0" max="360" v-model="l" :gradient="lGradient" />
		</template>
		<template v-else>
			<color-slider min="0" max="255" v-model="r" :gradient="rGradient" />
			<color-slider min="0" max="255" v-model="g" :gradient="gGradient" />
			<color-slider min="0" max="255" v-model="b" :gradient="bGradient" />
		</template>
		<color-slider min="0" max="1" v-model="a" :gradient="aGradient" transparency-mode />
		-->
		<table>
			<tr>
				<td>
					<label>Color:</label>
				</td>
				<td>
					<input type="color" v-model="color" />
				</td>
			</tr>
			<tr>
				<td colspan="2">
					<button @click="addSwatch">Add as swatch</button>
				</td>
			</tr>
		</table>
		<div id="color-swatches">
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
import Toggle from '../../toggle.vue';
import { Store } from 'vuex';
import { IRootState } from '@/store';

const generatedPackId = 'dddg.generated.colors';

@Component({
	components: {
		Toggle,
	},
})
export default class PartsPanel extends Vue {
	public $store!: Store<IRootState>;

	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	@Prop({ required: true, type: String }) private readonly value!: string;
	@Prop({ type: String, default: '' }) private readonly title!: string;

	private vuexHistory!: IHistorySupport;

	private get swatches(): Color[] {
		return this.$store.state.content.current.colors;
	}

	private get color(): string {
		return this.value;
	}

	private set color(newColor: string) {
		this.$emit('input', newColor);
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

	h2 {
		font-size: 20px;
		color: black;
		font-family: riffic, sans-serif;
		text-align: center;
	}

	&.vertical {
		flex-direction: column;
		width: 100%;
	}

	&:not(.vertical) {
		flex-direction: row;
		height: 100%;

		h2 {
			writing-mode: vertical-rl;
			height: 100%;
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

		button {
			width: 100%;
		}
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
