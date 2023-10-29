<!--
	Allows shifting an object through the different layers.

	+---+ +---+ +---+ +---+
	| ⇊ | | ↑ | | ↓ | | ⇈ |
	+---+ +---+ +---+ +---+
-->
<template>
	<d-fieldset id="layerfs" title="Layer:">
		<table class="button-tbl">
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
	</d-fieldset>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import { transaction } from '@/plugins/vuex-history';
import { IObject, IObjectShiftLayerAction } from '@/store/objects';
import { genericSetable } from '@/util/simple-settable';
import { defineComponent, Prop } from 'vue';

export default defineComponent({
	components: { Toggle, DFieldset },
	props: {
		object: {
			required: true,
		} as Prop<IObject>,
	},
	computed: {
		onTop: genericSetable<IObject>()('onTop', 'panels/setOnTop', true),
	},
	methods: {
		shiftLayer(delta: number) {
			transaction(async () => {
				await this.$store.dispatch('panels/shiftLayer', {
					id: this.object!.id,
					panelId: this.object!.panelId,
					delta,
				} as IObjectShiftLayerAction);
			});
		},
	},
});
</script>

<style lang="scss" scoped>
table {
	button {
		width: 100%;
		height: auto;
	}
}

.button-tbl {
	margin: 2px;
	width: calc(100% - 4px);
}
</style>