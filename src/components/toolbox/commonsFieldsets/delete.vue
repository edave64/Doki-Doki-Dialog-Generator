<template>
	<button @click="onClick">Delete</button>
</template>

<script lang="ts">
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
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/removeObject', {
					panelId: this.obj!.panelId,
					id: this.obj!.id,
				} as IRemoveObjectAction);
			});
		},
	},
});
</script>
