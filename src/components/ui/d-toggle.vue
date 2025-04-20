<!--
	A togglebox widget
-->
<template>
	<div class="toggle_box">
		<input :id="id" type="checkbox" ref="checkbox" v-model="model" />
		<label :for="id" class="switch"></label>
		<label :for="id" class="toggle_label">{{ label }}</label>
	</div>
</template>

<script lang="ts" setup>
import uniqId from '@/util/unique-id';
import { ref } from 'vue';

defineProps<{
	label: string;
}>();
const model = defineModel<boolean>({ default: false });
const id = uniqId();
const checkbox = ref(null! as HTMLInputElement);
</script>

<style lang="scss">
.toggle_box {
	/* The switch - the box around the slider */
	> .switch {
		height: 20px;
		width: 20px;
		display: inline-block;
		background: url('./toggle/inactive.svg');
		background-size: cover;
		vertical-align: text-bottom;
	}

	/* Hide default HTML checkbox */
	> input {
		opacity: 0;
		width: 0;
		height: 0;
		position: absolute;
		pointer-events: none;
	}

	> input:checked + .switch {
		background: url('./toggle/active.svg');
		background-size: cover;
	}

	> input:focus-visible + .switch {
		outline: 1px white auto;
	}

	> .toggle_label {
		user-select: none;
	}
}

body.dark-theme {
	.toggle_box {
		.switch {
			background: url('./toggle/inactive-dark.svg');
		}

		input:checked + .switch {
			background: url('./toggle/active-dark.svg');
		}
	}
}
</style>
