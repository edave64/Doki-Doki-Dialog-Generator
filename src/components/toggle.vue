<template>
	<div class="toggle_box">
		<input :id="_.uid" type="checkbox" ref="checkbox" v-model="value" />
		<label :for="_.uid" class="switch"></label>
		<label :for="_.uid" class="toggle_label">{{ label }}</label>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		label: String,
		modelValue: { type: Boolean, default: false },
	},
	computed: {
		value: {
			get(): boolean {
				return this.modelValue;
			},
			set(value: boolean) {
				this.$emit('update:modelValue', value);
			},
		},
		checkbox(): HTMLInputElement {
			return this.$refs.checkbox as HTMLInputElement;
		},
	},
});
</script>

<style lang="scss">
.toggle_box {
	div {
		overflow: visible;
	}

	/* The switch - the box around the slider */
	.switch {
		height: 20px;
		width: 20px;
		display: inline-block;
		background: url('./toggle/inactive.svg');
		background-size: cover;
		vertical-align: text-bottom;
	}

	/* Hide default HTML checkbox */
	input {
		opacity: 0;
		width: 0;
		height: 0;
		position: absolute;
		pointer-events: none;
	}

	input:checked + .switch {
		background: url('./toggle/active.svg');
		background-size: cover;
	}

	.toggle_label {
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
