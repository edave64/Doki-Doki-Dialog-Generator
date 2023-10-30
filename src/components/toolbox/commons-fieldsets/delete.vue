<!--
	A button that deletes the given object when clicked.
-->
<template>
	<button @click="onClick">Delete</button>
</template>

<script lang="ts" setup>
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import { IObject, IRemoveObjectAction } from '@/store/objects';
import { PropType } from 'vue';

const store = useStore();
const props = defineProps({
	obj: {
		required: true,
		type: Object as PropType<IObject>,
	},
});

function onClick() {
	transaction(async () => {
		await store.dispatch('panels/removeObject', {
			panelId: props.obj.panelId,
			id: props.obj.id,
		} as IRemoveObjectAction);
	});
}
</script>
