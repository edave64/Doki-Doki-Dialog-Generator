<template>
	<table>
		<tr>
			<td>
				<label for="characterOpacity">Opacity:</label>
			</td>
			<td>
				<input
					type="number"
					max="100"
					min="0"
					id="characterOpacity"
					v-model.number="opacity"
					@keydown.stop
				/>
			</td>
		</tr>
	</table>
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

	private vuexHistory!: IHistorySupport;

	private get opacity() {
		return this.obj.opacity;
	}

	private set opacity(opacity: number) {
		this.vuexHistory.transaction(() => {
			this.$store.commit('objects/setOpacity', {
				id: this.obj.id,
				opacity,
			} as ISetObjectOpacityMutation);
		});
	}
}
</script>

<style lang="scss" scoped>
input {
	width: 80px;
}

table {
	td:nth-child(2) {
		width: 80px;
	}
}
</style>