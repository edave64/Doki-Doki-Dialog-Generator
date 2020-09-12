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
		<toggle v-model="onTop" label="In front?" />
	</fieldset>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import { IObjectShiftLayerAction, IObject } from '@/store/objects';
import { genericSetable } from '@/util/simpleSettable';
import { defineComponent, Prop } from 'vue';

export default defineComponent({
	components: { Toggle },
	props: {
		object: {
			required: true,
		} as Prop<IObject>,
	},
	computed: {
		onTop: genericSetable<IObject>()('onTop', 'objects/setOnTop', true),
	},
	methods: {
		shiftLayer(delta: number) {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('objects/shiftLayer', {
					id: this.object!.id,
					delta,
				} as IObjectShiftLayerAction);
			});
		},
	},
});
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
