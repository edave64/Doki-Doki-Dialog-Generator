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
import { IObject } from '@/store/objects';
import { defineComponent, Prop } from 'vue';

export default defineComponent({
	props: {
		obj: {
			required: true,
		} as Prop<IObject>,
	},
	computed: {
		opacity: {
			get(): number {
				return 1;
				/*return this.obj!.opacity;*/
			},
			set(opacity: number) {
				this.vuexHistory.transaction(() => {
					/*
					this.$store.commit('objects/setOpacity', {
						id: this.obj.id,
						opacity,
					} as ISetObjectOpacityMutation);
					*/
				});
			},
		},
	},
});
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
