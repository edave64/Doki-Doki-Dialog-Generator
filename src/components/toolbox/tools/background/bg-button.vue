<template>
	<div
		:class="{ background: true, active: isActive }"
		:title="title"
		:style="style"
		tabindex="0"
		@click="reuploadingBackground()"
		@keypress.enter.prevent.stop="reuploadingBackground()"
		@keypress.space.prevent.stop="reuploadingBackground()"
		v-if="missing !== null"
	>
		{{ title }}
		<input
			type="file"
			style="display: none"
			ref="missingBackgroundUpload"
			@change="backgroundReupload"
		/>
	</div>
	<div
		:class="{ background: true, active: isActive }"
		:title="title"
		:style="style"
		tabindex="0"
		@click="$emit('input', backgroundId)"
		@keydown.enter="$emit('input', backgroundId)"
		@keydown.space.prevent="$emit('input', backgroundId)"
		v-else
	>
		{{ title }}
	</div>
</template>

<script lang="ts" setup>
import { getAAssetUrl } from '@/asset-manager';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import type { BackgroundLookup } from '@/store/content';
import { computed, ref } from 'vue';

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

const missingBackgroundUpload = ref(null! as HTMLInputElement);
const missing = computed(() => {
	Object.keys(store.state.uploadUrls);
	const bg = bgData.value;
	if (!bg) return null;
	for (const v of bg.variants) {
		for (const asset of v) {
			const url = getAAssetUrl(asset, false);
			if (url.startsWith('uploads:')) {
				// Force sprites to reload on upload
				Object.keys(store.state.uploadUrls);
				return url.substring(8);
			}
		}
	}
	return null;
});

const bgData = computed(() => {
	const backgrounds: BackgroundLookup =
		store.getters['content/getBackgrounds'];
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
	let missingAsset = false;
	const urls = bgData.value?.variants[0]
		.map((img) => {
			const assetUrl = getAAssetUrl(img, false);
			if (assetUrl.startsWith('uploads:')) {
				missingAsset = true;
			}
			return `url('${assetUrl}')`;
		})
		.join(',');
	if (missingAsset) {
		// Force vue to update this when a file is uploaded
		Object.keys(store.state.uploadUrls);
	}
	return {
		backgroundImage: urls ?? '',
	};
});

function reuploadingBackground() {
	const missingSpriteUpload_ = missingBackgroundUpload.value;
	missingSpriteUpload_.click();
}
async function backgroundReupload() {
	const uploadInput = missingBackgroundUpload.value;
	const spriteName = missing.value;
	if (!uploadInput.files) return;
	if (uploadInput.files.length !== 1) {
		console.error('More than one file uploaded!');
		return;
	}

	const file = uploadInput.files[0];
	await transaction(async () => {
		const url = URL.createObjectURL(file);
		await store.dispatch('uploadUrls/add', {
			name: spriteName,
			url,
		});
	});
}
</script>

<style lang="scss" scoped>
//noinspection CssOverwrittenProperties
.background {
	background-size: cover;
	text-shadow:
		0 0 4px #000,
		-1px -1px 0 #000,
		1px -1px 0 #000,
		-1px 1px 0 #000,
		1px 1px 0 #000;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 0 1px 3px var(--modal-backdrop);
	height: 48px;
	min-height: 48px;
	text-align: center;
	user-select: none;
	margin-top: 4px;
	margin-right: 4px !important;
	&.active {
		box-shadow: inset 0 0 1px 3px var(--modal-backdrop-light);
	}
}
</style>
