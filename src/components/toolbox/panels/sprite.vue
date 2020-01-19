<template>
	<div class="panel">
		<h1>Custom Sprite</h1>
		<position-and-size :obj="sprite" />
		<layers :obj="sprite" />
		<opacity :obj="sprite" />
		<toggle v-model="flip" label="Flip?" />
		<delete :obj="sprite" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { isWebPSupported } from '@/asset-manager';
import { Character } from '@/models/character';
import Toggle from '@/components/toggle.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Opacity from '@/components/toolbox/commonsFieldsets/opacity.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import { IRenderable } from '@/models/renderable';
import { Sprite } from '@/models/sprite';
import { ISprite } from '@/store/objectTypes/sprite';
import { ICommand } from '@/eventbus/command';
import eventBus from '@/eventbus/event-bus';
import { IHistorySupport } from '@/plugins/vuex-history';
import {
	IObjectSetOnTopAction,
	ISetObjectFlipMutation,
	ISetObjectPositionMutation,
	ISetObjectOpacityMutation,
	IObjectShiftLayerAction,
} from '@/store/objects';
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
	},
})
export default class SpritePanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;

	private get sprite(): ISprite {
		const obj = this.$store.state.objects.objects[
			this.$store.state.ui.selection!
		];
		if (obj.type !== 'sprite') return undefined!;
		return obj as ISprite;
	}

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
