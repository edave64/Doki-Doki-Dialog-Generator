<template>
	<div
		v-if="visible"
		@dragleave="visible = false"
		@drop="drop"
		:class="{ vertical: vertical }"
	>
		<slot />
	</div>
</template>
<script lang="ts">
import { Component, Mixins, Vue, Prop } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { State } from 'vuex-class-decorator';

@Component({})
export default class Drop extends Vue {
	public $store!: Store<IRootState>;

	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	private visible = false;

	private show(): void {
		this.visible = true;
	}

	private hide(): void {
		this.visible = false;
	}

	private drop(e: DragEvent): void {
		this.hide();
		e.stopPropagation();
		e.preventDefault();

		if (!e.dataTransfer) return;

		for (const item of e.dataTransfer.items) {
			if (item.kind === 'file' && item.type.match(/image.*/)) {
				this.$emit('drop', item.getAsFile());
			}
		}
	}
}
</script>
<style lang="css" scoped>
div {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(50, 50, 50, 0.75);
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	text-shadow: 2px black;
	font-size: 24px;
	text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
	font-size: 24px;
	font-family: riffic, sans-serif;
}
</style>
