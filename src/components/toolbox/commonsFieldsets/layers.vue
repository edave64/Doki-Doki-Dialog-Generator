<template>
	<fieldset id="layerfs">
		<legend>Layer:</legend>

		<table>
			<tbody>
				<tr>
					<td>
						<button @click="shiftLayer(-Infinity)" title="Move to back">
							<i class="material-icons">vertical_align_bottom</i>
						</button>
					</td>
					<td>
						<button @click="shiftLayer(-1)" title="Move backwards">
							<i class="material-icons">arrow_downward</i>
						</button>
					</td>
					<td>
						<button @click="shiftLayer(1)" title="Move forwards">
							<i class="material-icons">arrow_upward</i>
						</button>
					</td>
					<td>
						<button @click="shiftLayer(Infinity)" title="Move to front">
							<i class="material-icons">vertical_align_top</i>
						</button>
					</td>
				</tr>
			</tbody>
		</table>
		<toggle @input="setInFront" :value="obj.onTop" label="In front?" />
	</fieldset>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Toggle from '@/components/toggle.vue';
import { ICommand } from '@/eventbus/command';
import eventBus from '@/eventbus/event-bus';
import { IHistorySupport } from '@/plugins/vuex-history';
import {
	IObjectSetOnTopAction,
	IObjectShiftLayerAction,
	IObject,
} from '@/store/objects';

@Component({
	components: {
		Toggle,
	},
})
export default class Layers extends Vue {
	@Prop({ required: true }) private obj!: IObject;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private shiftLayer(delta: number) {
		this.history.transaction(() => {
			this.$store.dispatch('objects/shiftLayer', {
				id: this.obj.id,
				delta,
			} as IObjectShiftLayerAction);
		});
	}

	private setInFront(newValue: boolean) {
		this.history.transaction(() => {
			this.$store.dispatch('objects/setOnTop', {
				id: this.obj.id,
				onTop: newValue,
			} as IObjectSetOnTopAction);
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}

table {
	width: 100%;

	button {
		width: 100%;
	}
}
</style>