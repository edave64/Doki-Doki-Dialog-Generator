<template>
	<button @click="onClick">Delete</button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IHistorySupport } from '../../plugins/vuex-history';
import { IObject, IRemoveObjectAction } from '../../store/objects';

@Component({})
export default class Delete extends Vue {
	@Prop({ required: true }) private obj!: IObject;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private onClick() {
		this.history.transaction(() => {
			this.$store.dispatch('objects/removeObject', {
				id: this.obj.id,
			} as IRemoveObjectAction);
		});
	}
}
</script>
