<!--
	A button that deletes the given object when clicked.
-->
<template>
	<button @click="onClick">Delete</button>
</template>

<script lang="ts">
import { transaction } from '@/plugins/vuex-history';
import { IObject, IRemoveObjectAction } from '@/store/objects';
import { defineComponent, Prop } from 'vue';

export default defineComponent({
	props: {
		obj: {
			required: true,
		} as Prop<IObject>,
	},

	methods: {
		onClick() {
			transaction(() => {
				this.$store.dispatch('panels/removeObject', {
					panelId: this.obj!.panelId,
					id: this.obj!.id,
				} as IRemoveObjectAction);
			});
		},
	},
});
</script>
