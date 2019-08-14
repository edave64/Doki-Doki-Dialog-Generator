<template>
	<div id="ted" class="gui">
		Edit text:
		<br />
		<br />Use square brackets - [ and ] - to create bold text.
		<br />
		<br />Like this:
		<br />
		<code>
			["fucking
			<br />monikammmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"]
		</code>
		<br />
		<br />
		<textarea ref="area" :value="value" @input="onInput()" />
		<doki-button @click="onExit()">Update textbox</doki-button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import DokiButton from './DokiButton.vue';

@Component({
	components: {
		DokiButton,
	},
})
export default class DialogEditor extends Vue {
	@Prop({ type: String, required: true }) private value!: string;
	@Prop({ type: Boolean, default: false }) private lazy!: boolean;

	private onInput(): void {
		if (!this.lazy) {
			this.$emit('input', (this.$refs.area as HTMLTextAreaElement).value);
		}
	}

	private onExit(): void {
		if (this.lazy) {
			this.$emit('input', (this.$refs.area as HTMLTextAreaElement).value);
		}
		this.$emit('close');
	}
}
</script>

<style lang="scss">
#ted {
	position: absolute;
	top: 5vh;
	height: 90vh;
	left: 20vw;
	width: 60vw;
	border: 3px solid #ffbde1;
	background-color: #ffe6f4;
	padding: 1em;
	box-sizing: border-box;

	> code {
		margin: 1em 4em;
		display: block;
	}

	> textarea {
		overflow: auto;
		resize: none;
		width: 100%;
		height: 10em;
	}
}
</style>
