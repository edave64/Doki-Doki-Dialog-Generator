<!--
	A button that deletes the given object when clicked.
-->
<template>
	<button @click="onClick">Delete</button>
</template>

<script lang="ts" setup>
import { transaction } from '@/history-engine/transaction';
import { useStore } from '@/store';
import type { IObject, IRemoveObjectAction } from '@/store/objects';

const props = defineProps<{
	obj: IObject;
}>();

const store = useStore();
function onClick() {
	transaction(async () => {
		await store.dispatch('panels/removeObject', {
			panelId: props.obj.panelId,
			id: props.obj.id,
		} as IRemoveObjectAction);
	});
}
</script>
