<template>
	<button :class="[iconPos]" :disabled="disabled">
		<div class="material-icons">{{ icon }}</div>
		<div class="content"><slot /></div>
	</button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
export default defineComponent({
	props: {
		icon: {
			type: String,
			required: true,
		},
		iconPos: {
			type: String as PropType<'left' | 'top'>,
			default: 'left',
		},
		disabled: {
			type: Boolean,
			default: false,
		},
	},
});
</script>

<style lang="scss" scoped>
button {
	border: 2px solid #ffbde1;
	background: #ffe6f4;
	padding: 1px;
	display: flex;
	text-align: center;
	justify-content: center;
	align-items: center;

	&.left {
		flex-direction: row;
		> .content {
			flex-grow: 1;
		}
	}
	&.top {
		flex-direction: column;
	}
}
</style>
