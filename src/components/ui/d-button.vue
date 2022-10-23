<template>
	<button :class="[iconPos]" :disabled="disabled">
		<div class="material-icons" aria-hidden="true">{{ icon }}</div>
		<div class="content">
			<slot />
		</div>
		<div class="shortcut-popup" v-if="showPopup">{{ popupText }}</div>
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
		shortcut: {
			type: String as PropType<string | null>,
			default: null,
		},
	},
	computed: {
		showPopup(): boolean {
			return this.shortcut != null && !this.shortcut.startsWith('!');
		},
		popupText(): string {
			const shortcut = this.shortcut;
			if (shortcut == null) return '';
			if (shortcut.startsWith('!')) return shortcut.substring(1);
			return shortcut;
		},
	},
});
</script>

<style lang="scss" scoped>
//noinspection CssOverwrittenProperties
button {
	border: 2px solid $default-border;
	border: 2px solid var(--border);
	background: $default-accent-background;
	background: var(--accent-background);
	padding: 1px;
	display: flex;
	text-align: center;
	justify-content: center;
	align-items: center;
	position: relative;

	&.left {
		flex-direction: row;

		> .content {
			flex-grow: 1;
		}
	}

	&.top {
		flex-direction: column;
	}

	&:active {
		background: $default-border;
		background: var(--border);
	}
}
</style>
