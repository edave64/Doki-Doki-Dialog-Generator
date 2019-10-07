<template>
	<div :class="{ panel: true }">
		<h1>Custom Sprite</h1>
		<position-and-size :obj="sprite" />
		<layers :obj="sprite" />
		<opacity :obj="sprite" />
		<toggle v-model="flip" label="Flip?" />
		<delete :obj="sprite" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported } from '../../asset-manager';
import { Character } from '../../models/character';
import Toggle from '../Toggle.vue';
import PositionAndSize from '../commonsFieldsets/positionAndSize.vue';
import Layers from '../commonsFieldsets/layers.vue';
import Opacity from '../commonsFieldsets/opacity.vue';
import Delete from '../commonsFieldsets/delete.vue';
import { IRenderable } from '../../models/renderable';
import { Sprite } from '../../models/sprite';
import {
	ISprite,
	ISetSpriteHeightAction,
	ISetSpriteWidthAction,
	ISetSpriteRatioAction,
} from '../../store/objectTypes/sprite';
import { ICommand } from '../../eventbus/command';
import eventBus from '../../eventbus/event-bus';
import { IHistorySupport } from '../../plugins/vuex-history';
import {
	IObjectSetOnTopAction,
	ISetObjectFlipMutation,
	ISetObjectPositionMutation,
	ISetObjectOpacityMutation,
	IObjectShiftLayerAction,
} from '../../store/objects';

@Component({
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Opacity,
		Delete,
	},
})
export default class SpritePanel extends Vue {
	@Prop({ required: true }) private sprite!: ISprite;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get flip() {
		return this.sprite.flip;
	}

	private set flip(newValue: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setFlip', {
				id: this.sprite.id,
				flip: newValue,
			} as ISetObjectFlipMutation);
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}
</style>