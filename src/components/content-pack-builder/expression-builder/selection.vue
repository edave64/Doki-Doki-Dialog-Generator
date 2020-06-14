<template>
	<div
		class="selection"
		:style="{ background: background }"
		@click.stop="$emit('selected')"
	>
		<div class="icon material-icons">{{ icon }}</div>
		<div class="label">{{ label }}</div>
	</div>
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class Selection extends Vue {
	@Prop() private icon!: string;
	@Prop() private label!: string;
	@Prop({ default: [] }) private images!: string[];

	public get background(): string {
		return this.images
			.map(i => `center / contain no-repeat url('${i}')`)
			.join(',');
	}
}
</script>

<style scoped>
.selection {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	justify-content: center;
	align-content: center;
	flex-direction: column;
	text-align: center;

	margin-top: 4px;
	background-size: cover;
	text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
	text-align: center;
	user-select: none;
}
</style>
