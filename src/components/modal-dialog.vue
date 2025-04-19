<!--
	A wrapper for modal dialoges (Grays out the background)
-->
<template>
	<dialog
		ref="dialog"
		v-if="isDialogSupported"
		class="native"
		:class="{ 'base-size': !props.noBaseSize }"
		@cancel="close"
	>
		<slot />
		<div v-if="options.length > 0" id="submit-options">
			<button
				v-for="option of options"
				:key="option"
				class="option"
				@click="emit('option', option)"
			>
				{{ option }}
			</button>
		</div>
	</dialog>
	<div class="dialog-wrapper" @click="$emit('leave')" v-else>
		<dialog
			ref="dialog"
			open
			:class="{ 'base-size': !props.noBaseSize }"
			@click.stop
		>
			<slot />
			<div v-if="options.length > 0" id="submit-options">
				<button
					v-for="option of props.options"
					:key="option"
					class="option"
					@click="emit('option', option)"
				>
					{{ option }}
				</button>
			</div>
		</dialog>
	</div>
</template>

<script lang="ts" setup>
import {
	onActivated,
	onDeactivated,
	onMounted,
	onUnmounted,
	type PropType,
	ref,
} from 'vue';

const isDialogSupported = typeof HTMLDialogElement !== 'undefined';
const props = defineProps({
	noBaseSize: Boolean,
	options: {
		type: Array as PropType<string[]>,
		default: [] as string[],
	},
});
const dialog = ref(null! as HTMLDialogElement);
const emit = defineEmits(['leave', 'option']);

function open() {
	if (isDialogSupported) {
		const ele = dialog.value;
		if (ele != null && !ele.open) {
			ele.showModal();
		}
	}
	window.addEventListener('click', clickSomewhere);
}
function close() {
	if (isDialogSupported) {
		const ele = dialog.value;
		if (ele != null && ele.open) {
			ele.close();
		}
		emit('leave');
	}
	window.removeEventListener('click', clickSomewhere);
}
function clickSomewhere(e: MouseEvent) {
	const ele = dialog.value;
	if (ele != null && ele.open) {
		if (e.target === ele) {
			close();
			e.preventDefault();
			e.stopPropagation();
		}
	} else {
		window.removeEventListener('click', clickSomewhere);
	}
}

onMounted(open);
onActivated(open);
onDeactivated(close);
onUnmounted(close);
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

dialog.native::backdrop {
	background: rgba($color: #000000, $alpha: 0.5);
}

dialog {
	max-width: 90vw;
	max-height: 90vh;
	background-attachment: scroll;
	background-color: var(--native-background);
	background-position: right center;
	background-repeat: no-repeat;
	background-size: contain;
	display: flex;
	flex-direction: column;
	align-self: center;
	overflow: hidden;
	padding: 0;
	border: 4px solid var(--border);
	overflow: hidden;
	color: var(--text);
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
			font-family: riffic, sans-serif;
			font-size: 24px;
		}
	}
}
</style>
