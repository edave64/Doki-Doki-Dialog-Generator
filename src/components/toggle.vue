<template>
	<div>
		<input :id="_uid" type="checkbox" ref="checkbox" @change="onChange" :checked="value" />
		<label :for="_uid" class="switch"></label>
		<label :for="_uid">{{label}}</label>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class Toggle extends Vue {
	@Prop({ type: String }) private label!: string | undefined;
	@Prop({ type: Boolean, default: false }) private value!: boolean;

	private onChange(event: Event) {
		this.$emit('input', !!(this.$refs.checkbox as HTMLInputElement).checked);
	}

	private get checkbox(): HTMLInputElement {
		return this.$refs.checkbox as HTMLInputElement;
	}
}
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
}

input:checked + .switch {
	background: url('./toggle/active.svg');
	background-size: cover;
}
</style>
