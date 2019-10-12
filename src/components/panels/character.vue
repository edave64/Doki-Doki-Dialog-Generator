<template>
	<div :class="{ panel: true }">
		<h1>{{character.label}}</h1>
		<fieldset v-if="hasMultiplePoses || parts.length > 0">
			<legend>Pose:</legend>
			<table>
				<tbody>
					<tr v-if="hasMultiplePoses">
						<td>
							<button @click="seekPose(-1, nsfw);">&lt;</button>
						</td>
						<td>Pose</td>
						<td>
							<button @click="seekPose(1, nsfw);">&gt;</button>
						</td>
					</tr>
					<tr v-for="part of parts" :key="part">
						<td>
							<button @click="seekPart(part, -1, nsfw);">&lt;</button>
						</td>
						<td>{{captialize(part)}}</td>
						<td>
							<button @click="seekPart(part, 1, nsfw);">&gt;</button>
						</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
		<position-and-size :obj="character.obj" />
		<layers :obj="character.obj" />
		<opacity :obj="character.obj" />
		<toggle v-model="closeUp" label="Close up?" />
		<toggle v-model="flip" label="Flip?" />
		<delete :obj="character.obj" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';
import { isWebPSupported } from '@/asset-manager';
import { IHistorySupport } from '@/plugins/vuex-history';
import { Character } from '@/models/character';
import { IRenderable } from '@/models/renderable';
import { positions, characterPositions, Part } from '@/models/constants';
import {
	getData,
	getParts,
	closestCharacterSlot,
	ISeekPoseAction,
	ISetCloseMutation,
	ISeekPosePartAction,
} from '@/store/objectTypes/characters';
import {
	ISetPositionAction,
	ISetObjectPositionMutation,
	ISetObjectFlipMutation,
} from '@/store/objects';
import Toggle from '@/components/Toggle.vue';
import PositionAndSize from '@/components/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/commonsFieldsets/layers.vue';
import Opacity from '@/components/commonsFieldsets/opacity.vue';
import Delete from '@/components/commonsFieldsets/delete.vue';

@Component({
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Opacity,
		Delete,
	},
})
export default class CharacterPanel extends Vue {
	@Prop({ type: Character, required: true })
	private readonly character!: Character;

	@State('nsfw', { namespace: 'ui' })
	private readonly nsfw!: boolean;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get positionNames(): string[] {
		return positions;
	}

	private get parts(): string[] {
		return getParts(this.character.obj);
	}

	private get hasMultiplePoses(): boolean {
		return getData(this.character.obj).poses.length > 1;
	}

	private seekPose(delta: number, nsfw: boolean): void {
		debugger;
		this.history.transaction(() => {
			this.$store.dispatch('objects/seekPose', {
				id: this.character.obj.id,
				delta,
				nsfw,
			} as ISeekPoseAction);
		});
	}

	private seekPart(part: Part, delta: number, nsfw: boolean): void {
		debugger;
		this.history.transaction(() => {
			this.$store.dispatch('objects/seekPart', {
				id: this.character.obj.id,
				delta,
				nsfw,
				part,
			} as ISeekPosePartAction);
		});
	}

	private captialize(str: string) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}

	private get flip() {
		return this.character.obj.flip;
	}

	private set flip(newValue: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setFlip', {
				id: this.character.obj.id,
				flip: newValue,
			} as ISetObjectFlipMutation);
		});
	}

	private get closeUp() {
		return this.character.obj.close;
	}

	private set closeUp(newValue: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setClose', {
				id: this.character.obj.id,
				close: newValue,
			} as ISetCloseMutation);
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}

.vertical {
	fieldset {
		width: calc(100% - 4px);
		input {
			width: 60px;
		}
	}
}
</style>