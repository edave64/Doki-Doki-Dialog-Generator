<!--
	A button that deletes the given object when clicked.
-->
<template>
	<button @click="onClick">Delete</button>
</template>

<script lang="ts" setup>
import { transaction } from '@/history-engine/transaction';
import type { GenObject } from '@/store/object-types/object';
import { state } from '@/store/root';

const props = defineProps<{
	obj: GenObject;
}>();

function onClick() {
	transaction(async () => {
		state.panels.panels[props.obj.panelId].removeObject(props.obj);
	});
}
</script>
