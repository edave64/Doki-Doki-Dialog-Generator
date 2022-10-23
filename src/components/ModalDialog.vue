<template>
	<dialog
		ref="dialog"
		v-if="nativeDialogs"
		class="native"
		:class="{ 'base-size': !noBaseSize }"
		@cancel="close"
	>
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
	<div class="dialog-wrapper" @click="$emit('leave')" v-else>
		<dialog ref="dialog" open :class="{ 'base-size': !noBaseSize }" @click.stop>
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

const isDialogSupported = (window as any).HTMLDialogElement != null;

export default defineComponent({
	props: {
		noBaseSize: Boolean,
		options: {
			type: Array as PropType<string[]>,
			default: [] as string[],
		},
	},
	computed: {
		nativeDialogs() {
			return isDialogSupported;
		},
	},
	methods: {
		open() {
			if (this.nativeDialogs) {
				const ele = this.$refs.dialog as HTMLDialogElement | undefined;
				if (ele && !ele.open) {
					ele.showModal();
				}
			}
			window.addEventListener('click', this.clickSomewhere);
		},
		close() {
			if (this.nativeDialogs) {
				const ele = this.$refs.dialog as HTMLDialogElement | undefined;
				if (ele && ele.open) {
					ele.close();
				}
				this.$emit('leave');
			}
			window.removeEventListener('click', this.clickSomewhere);
		},
		clickSomewhere(e: MouseEvent) {
			const ele = this.$refs.dialog as HTMLDialogElement | undefined;
			if (ele && ele.open) {
				if (e.target === ele) {
					this.close();
					e.preventDefault();
					e.stopPropagation();
				}
			} else {
				window.removeEventListener('click', this.clickSomewhere);
			}
		},
	},
	mounted() {
		this.open();
	},
	activated() {
		this.open();
	},
	deactivated() {
		this.close();
	},
	unmounted() {
		this.close();
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

dialog.native::backdrop {
	background: rgba($color: #000000, $alpha: 0.5);
}

dialog {
	max-width: 90vw;
	max-height: 90vh;
	background-attachment: scroll;
	//noinspection CssOverwrittenProperties
	background-color: $default-native-background;
	//noinspection CssOverwrittenProperties
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
	//noinspection CssOverwrittenProperties
	border: 4px solid var(--border);
	//noinspection CssOverwrittenProperties
	overflow: hidden;
	//noinspection CssOverwrittenProperties
	color: $default-text;
	//noinspection CssOverwrittenProperties
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
