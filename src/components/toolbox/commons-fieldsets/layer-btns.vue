<!--
	Allows shifting an object through the different layers.

	+---+ +---+ +---+ +---+
	| ⇊ | | ↑ | | ↓ | | ⇈ |
	+---+ +---+ +---+ +---+
-->
<template>
	<d-fieldset id="layerfs" title="Layer:">
		<d-flow class="layer_flow" direction="horizontal">
			<d-button
				icon="vertical_align_bottom"
				icon-pos="top"
				@click="shiftLayer(-Infinity)"
				title="Move to back"
			/>
			<d-button
				icon="arrow_downward"
				icon-pos="top"
				@click="shiftLayer(-1)"
				title="Move backwards"
			/>
			<d-button
				icon="arrow_upward"
				icon-pos="top"
				@click="shiftLayer(1)"
				title="Move forwards"
			/>
			<d-button
				icon="vertical_align_top"
				icon-pos="top"
				@click="shiftLayer(Infinity)"
				title="Move to front"
			/>
		</d-flow>
		<toggle-box v-model="onTop" label="In front?" />
	</d-fieldset>
</template>

<script lang="ts" setup>
import DButton from '@/components/ui/d-button.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import { transaction } from '@/history-engine/transaction';
import { useStore } from '@/store';
import type { IObject, IObjectShiftLayerAction } from '@/store/objects';
import { genericSetterMerged } from '@/util/simple-settable';
import { computed } from 'vue';

const props = defineProps<{
	object: IObject;
}>();

const store = useStore();
const onTop = genericSetterMerged(
	store,
	computed(() => props.object),
	'panels/setOnTop',
	true,
	'onTop'
);

function shiftLayer(delta: number) {
	transaction(async () => {
		await store.dispatch('panels/shiftLayer', {
			id: props.object.id,
			panelId: props.object.panelId,
			delta,
		} as IObjectShiftLayerAction);
	});
}
</script>

<style lang="scss" scoped>
.layer_flow {
	margin: 2px;
	width: calc(100% - 4px);
	& > button {
		flex-grow: 1;

		&:not(:last-child) {
			border-right: 0;
		}
	}
}
</style>
