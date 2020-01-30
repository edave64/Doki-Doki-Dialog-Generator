<template>
	<div class="panel">
		<h1>{{ label }}</h1>
		<parts
			v-if="panelForParts"
			:character="character"
			:part="panelForParts"
			@leave="panelForParts = null"
		/>
		<template v-else>
			<fieldset v-if="hasMultiplePoses || parts.length > 0">
				<legend>Pose:</legend>
				<table>
					<tbody>
						<tr v-if="hasMultipleStyles">
							<td class="arrow-col">
								<button @click="seekStyle(-1)">&lt;</button>
							</td>
							<td>
								<button class="middle-button" @click="panelForParts = 'style'">Style</button>
							</td>
							<td class="arrow-col">
								<button @click="seekStyle(1)">&gt;</button>
							</td>
						</tr>
						<tr v-if="hasMultiplePoses">
							<td class="arrow-col">
								<button @click="seekPose(-1)">&lt;</button>
							</td>
							<td>
								<button class="middle-button" @click="panelForParts = 'pose'">Pose</button>
							</td>
							<td class="arrow-col">
								<button @click="seekPose(1)">&gt;</button>
							</td>
						</tr>
						<tr v-for="part of parts" :key="part">
							<td class="arrow-col">
								<button @click="seekPart(part, -1)">&lt;</button>
							</td>
							<td>
								<button class="middle-button" @click="panelForParts = part">{{ captialize(part) }}</button>
							</td>
							<td class="arrow-col">
								<button @click="seekPart(part, 1)">&gt;</button>
							</td>
						</tr>
					</tbody>
				</table>
			</fieldset>
			<position-and-size :obj="character" />
			<layers :obj="character" />
			<opacity :obj="character" />
			<toggle v-model="closeUp" label="Close up?" />
			<toggle v-model="flip" label="Flip?" />
			<delete :obj="character" />
		</template>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';
import { IHistorySupport } from '@/plugins/vuex-history';
import { Part } from '@/models/constants';
import {
	getData,
	getParts,
	ISeekPoseAction,
	ISetCloseMutation,
	ISeekPosePartAction,
	ICharacter,
	ISeekStyleAction,
} from '@/store/objectTypes/characters';
import { ISetObjectFlipMutation } from '@/store/objects';
import Toggle from '@/components/toggle.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Opacity from '@/components/toolbox/commonsFieldsets/opacity.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import Parts from './character/parts.vue';
import { Character } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '../../../store/content';
import { PanelMixin } from './panelMixin';
import { Store } from 'vuex';
import { IRootState } from '../../../store';

@Component({
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Opacity,
		Delete,
		Parts,
	},
})
export default class CharacterPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;

	private get character(): ICharacter {
		const obj = this.$store.state.objects.objects[
			this.$store.state.ui.selection!
		];
		if (obj.type !== 'character') return undefined!;
		return obj as ICharacter;
	}

	private panelForParts: Part | null = null;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get charData(): Readonly<Character<IAsset>> {
		return getData(this.$store, this.character);
	}

	private get label(): string {
		return this.charData.label || '';
	}

	private get parts(): string[] {
		return getParts(this.charData, this.character);
	}

	private get hasMultipleStyles(): boolean {
		return this.charData.styles.length > 1;
	}

	private get hasMultiplePoses(): boolean {
		const style = this.charData.styles[this.character.styleId];
		return this.charData.poses.filter(x => x.style === style.name).length > 1;
	}

	private seekPose(delta: number): void {
		this.history.transaction(() => {
			this.$store.dispatch('objects/seekPose', {
				id: this.character.id,
				delta,
			} as ISeekPoseAction);
		});
	}

	private seekStyle(delta: number): void {
		this.history.transaction(() => {
			this.$store.dispatch('objects/seekStyle', {
				id: this.character.id,
				delta,
			} as ISeekStyleAction);
		});
	}

	private seekPart(part: Part, delta: number): void {
		this.history.transaction(() => {
			this.$store.dispatch('objects/seekPart', {
				id: this.character.id,
				delta,
				part,
			} as ISeekPosePartAction);
		});
	}

	private captialize(str: string) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}

	private get flip() {
		return this.character.flip;
	}

	private set flip(newValue: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setFlip', {
				id: this.character.id,
				flip: newValue,
			} as ISetObjectFlipMutation);
		});
	}

	private get closeUp() {
		return this.character.close;
	}

	private set closeUp(newValue: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setClose', {
				id: this.character.id,
				close: newValue,
			} as ISetCloseMutation);
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;

	table {
		width: 100%;
	}
}

.vertical {
	fieldset {
		width: calc(100% - 4px);
		input {
			width: 60px;
		}
	}
}

.middle-button {
	width: 100%;
}

.arrow-col {
	width: 24px;

	button {
		width: 24px;
	}
}
</style>
