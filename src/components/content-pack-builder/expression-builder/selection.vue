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

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
	icon: String,
	label: String,
	images: {
		default: [] as string[],
	},
});

const background = computed(() => {
	return props.images
		.map((i) => `center / contain no-repeat url('${i}')`)
		.join(',');
});
</script>

<style lang="scss" scoped>
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
	text-shadow:
		0 0 4px #000,
		-1px -1px 0 #000,
		1px -1px 0 #000,
		-1px 1px 0 #000,
		1px 1px 0 #000;
	color: white;
	align-items: center;
	//noinspection CssOverwrittenProperties
	box-shadow: inset 0 0 1px 3px $default-modal-backdrop;
	//noinspection CssOverwrittenProperties
	box-shadow: inset 0 0 1px 3px var(--modal-backdrop);
	user-select: none;
}
</style>
