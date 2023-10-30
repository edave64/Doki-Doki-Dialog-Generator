<template>
	<div
		:class="{ background: true, active: isActive }"
		:title="title"
		:style="style"
		tabindex="0"
		@click="$emit('input', backgroundId)"
		@keydown.enter="$emit('input', backgroundId)"
		@keydown.space.prevent="$emit('input', backgroundId)"
	>
		{{ title }}
	</div>
</template>

<script lang="ts" setup>
import { getAAssetUrl } from '@/asset-manager';
import { useStore } from '@/store';
import { BackgroundLookup } from '@/store/content';
import { computed } from 'vue';

const store = useStore();
const props = defineProps({
	backgroundId: {
		type: String,
		required: true,
	},
});

const background = computed(() => {
	const currentPanel = store.state.panels.currentPanel;
	return store.state.panels.panels[currentPanel].background;
});

const bgData = computed(() => {
	const backgrounds: BackgroundLookup = store.getters['content/getBackgrounds'];
	return backgrounds.get(props.backgroundId) || null;
});

const isActive = computed(() => {
	return props.backgroundId === background.value.current;
});

const title = computed(() => {
	switch (props.backgroundId) {
		case 'buildin.static-color':
			return 'Static color';
		case 'buildin.transparent':
			return 'Transparent';
	}
	return bgData.value!.label ?? '';
});

const style = computed((): { [id: string]: string } => {
	switch (props.backgroundId) {
		case 'buildin.static-color':
			return {
				'background-color': background.value.color,
			};
		case 'buildin.transparent':
			return {};
	}
	const urls = bgData.value?.variants[0]
		.map((img) => `url('${getAAssetUrl(img, false)}')`)
		.join(',');
	return {
		backgroundImage: urls ?? '',
	};
});
</script>

<style lang="scss" scoped>
//noinspection CssOverwrittenProperties
.background {
	background-size: cover;
	text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 0 1px 3px $default-modal-backdrop;
	box-shadow: inset 0 0 1px 3px var(--modal-backdrop);
	height: 48px;
	min-height: 48px;
	text-align: center;
	user-select: none;
	margin-top: 4px;
	margin-right: 4px !important;
	&.active {
		box-shadow: inset 0 0 1px 3px $default-modal-backdrop-light;
		box-shadow: inset 0 0 1px 3px var(--modal-backdrop-light);
	}
}
</style>
