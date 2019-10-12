<template>
	<div :class="{ panel: true }">
		<h1>{{label}}</h1>
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
		<position-and-size :obj="character" />
		<layers :obj="character" />
		<opacity :obj="character" />
		<toggle v-model="closeUp" label="Close up?" />
		<toggle v-model="flip" label="Flip?" />
		<delete :obj="character" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
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
} from '@/store/objectTypes/characters';
import { ISetObjectFlipMutation } from '@/store/objects';
import Toggle from '@/components/toggle.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Opacity from '@/components/toolbox/commonsFieldsets/opacity.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';

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
	@Prop({ required: true })
	private readonly character!: ICharacter;

	@State('nsfw', { namespace: 'ui' })
	private readonly nsfw!: boolean;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get label(): string {
		return getData(this.character).name;
	}

	private get parts(): string[] {
		return getParts(this.character);
	}

	private get hasMultiplePoses(): boolean {
		return getData(this.character).poses.length > 1;
	}

	private seekPose(delta: number, nsfw: boolean): void {
		this.history.transaction(() => {
			this.$store.dispatch('objects/seekPose', {
				id: this.character.id,
				delta,
				nsfw,
			} as ISeekPoseAction);
		});
	}

	private seekPart(part: Part, delta: number, nsfw: boolean): void {
		this.history.transaction(() => {
			this.$store.dispatch('objects/seekPart', {
				id: this.character.id,
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