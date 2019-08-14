<template>
	<div>
		<input ref="checkbox" :id="_uid" type="checkbox" @change="onChange" :checked="value" />
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

<style lang="scss">
.btn {
	background-color: #ffe6f4;
	border: 3px solid #ffbde1;

	display: inline-block;
	padding: 4px 4em;

	cursor: pointer;
}

.btn:hover {
	background-color: #fff;
	border: 3px solid #ffbde1;
}
</style>
