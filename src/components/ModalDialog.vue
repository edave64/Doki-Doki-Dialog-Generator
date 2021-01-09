<template>
	<div class="dialog-wrapper" @click="$emit('leave')">
		<dialog open :class="{ 'base-size': !noBaseSize }" @click.stop>
			<slot />
			<div v-if="options.length > 0" id="submit-options">
				<button
					v-for="option of options"
					:key="option"
					class="option"
					@click="$emit('option', option)"
				>
					{{ option }}
				</button>
			</div>
		</dialog>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
	props: {
		noBaseSize: Boolean,
		options: {
			type: Array as PropType<string[]>,
			default: [],
		},
	},
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.dialog-wrapper {
	position: absolute;
	top: 0;
	bottom: 0;
	right: 0;
	left: 0;
	background: rgba($color: #000000, $alpha: 0.5);
	display: flex;
	transition: all 0.15s;
}

dialog {
	max-width: 90vw;
	max-height: 90vh;
	background-attachment: scroll;
	background-color: $default-native-background;
	background-color: var(--native-background);
	background-position: right center;
	background-repeat: no-repeat;
	background-size: contain;
	display: flex;
	flex-direction: column;
	align-self: center;
	overflow: hidden;
	padding: 0;
	border: 4px solid $default-border;
	border: 4px solid var(--border);
	overflow: hidden;
	align-self: center;
	justify-self: center;
	margin: auto;

	&.base-size {
		width: 860px;
		height: 860px;
	}

	#submit-options {
		display: flex;
		justify-content: space-evenly;

		button.option {
			border: 0;
			background: none;
			font-family: riffic;
			font-size: 24px;
		}
	}
}
</style>
