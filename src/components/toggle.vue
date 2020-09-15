<template>
	<div>
		<input :id="_.uid" type="checkbox" ref="checkbox" v-model="value" />
		<label :for="_.uid" class="switch"></label>
		<label :for="_.uid">{{ label }}</label>
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

<style lang="scss" scoped>
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
</style>
