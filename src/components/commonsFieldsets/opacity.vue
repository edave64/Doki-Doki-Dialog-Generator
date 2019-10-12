<template>
	<div>
		<label for="characterOpacity">Opacity:</label>
		<input
			type="number"
			max="100"
			min="0"
			id="characterOpacity"
			v-model.number="opacity"
			@keydown.stop
		/>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { ICommand } from '@/eventbus/command';
import eventBus from '@/eventbus/event-bus';
import { IHistorySupport } from '@/plugins/vuex-history';
import { IObject, ISetObjectOpacityMutation } from '@/store/objects';

@Component({})
export default class Opacity extends Vue {
	@Prop({ required: true }) private obj!: IObject;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get opacity() {
		return this.obj.opacity;
	}

	private set opacity(opacity: number) {
		this.history.transaction(() => {
			this.$store.commit('objects/setOpacity', {
				id: this.obj.id,
				opacity,
			} as ISetObjectOpacityMutation);
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}
</style>