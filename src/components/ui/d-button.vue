<!--
	A generic button component with text, and icon, and a possible keyboard shortcut

	+----------+
	| d-button |
	+----------+
-->
<template>
	<button
		:class="[iconPos]"
		:disabled="disabled"
		:title="title ?? undefined"
		:aria-label="title ?? undefined"
		:style="icon ? 'height: auto' : ''"
		ref="btn"
	>
		<div class="material-icons" aria-hidden="true" v-if="icon">{{ icon }}</div>
		<div class="content">
			<slot />
		</div>
		<div class="shortcut-popup" v-if="showPopup">{{ popupText }}</div>
	</button>
</template>

<script lang="ts" setup>
import {
	computed,
	onMounted,
	onUnmounted,
	type PropType,
	ref,
	type VNodeRef,
} from 'vue';

const props = defineProps({
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
	title: {
		type: String as PropType<string | null>,
		default: null,
	},
});
const btn = ref(null! as VNodeRef);
const showPopup = computed(
	() => props.shortcut != null && !props.shortcut.startsWith('!')
);
const popupText = computed(() => {
	const shortcut = props.shortcut;
	if (shortcut == null) return '';
	if (shortcut.startsWith('!')) return shortcut.substring(1);
	return shortcut;
});

function fireShortcut(e: KeyboardEvent) {
	if (props.disabled) return;
	if (
		e.key === props.shortcut &&
		e.ctrlKey &&
		!e.altKey &&
		!e.metaKey &&
		!e.shiftKey
	) {
		(btn.value as HTMLButtonElement).focus({ focusVisible: false });
		(btn.value as HTMLButtonElement).click();
		e.preventDefault();
		e.stopPropagation();
	}
}

onMounted(() => {
	if (props.shortcut == null) return;
	window.addEventListener('keydown', fireShortcut);
});
onUnmounted(() => {
	window.removeEventListener('keydown', fireShortcut);
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
