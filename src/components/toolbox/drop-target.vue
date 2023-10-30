<!--
	Allows to drop files into the application
-->
<template>
	<div
		v-if="visible"
		@dragleave="visible = false"
		@drop="drop"
		:class="{ vertical: vertical }"
	>
		<slot />
	</div>
</template>
<script lang="ts" setup>
import { useStore } from '@/store';
import { computed, ref } from 'vue';

const emit = defineEmits(['drop']);
const store = useStore();
const visible = ref(false);
const vertical = computed(() => store.state.ui.vertical);

function show(): void {
	visible.value = true;
}
function hide(): void {
	visible.value = false;
}
function drop(e: DragEvent): void {
	hide();
	e.stopPropagation();
	e.preventDefault();

	if (!e.dataTransfer) return;

	for (const item of e.dataTransfer.items) {
		if (item.kind === 'file' && item.type.match(/image.*/)) {
			emit('drop', item.getAsFile());
		}
	}
}
defineExpose({ show, hide });
</script>
<style lang="scss" scoped>
div {
	z-index: 1000;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(50, 50, 50, 0.75);
	display: flex;
	justify-content: center;
	align-items: center;
	//noinspection CssOverwrittenProperties
	color: $default-native-background;
	//noinspection CssOverwrittenProperties
	color: var(--native-background);
	text-shadow: 0 0 4px $default-text, -1px -1px 0 $default-text,
		1px -1px 0 $default-text, -1px 1px 0 $default-text, 1px 1px 0 $default-text;
	text-shadow: 0 0 4px var(--text), -1px -1px 0 var(--text),
		1px -1px 0 var(--text), -1px 1px 0 var(--text), 1px 1px 0 var(--text);
	font-size: 24px;
	font-family: riffic, sans-serif;
}
</style>
