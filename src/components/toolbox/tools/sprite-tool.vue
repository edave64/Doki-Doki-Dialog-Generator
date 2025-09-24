<!--
	A tool that is shown when a sprite object is selected.
-->
<template>
	<object-tool ref="root" :object="object" title="Custom Sprite">
		<template v-if="missing">
			<p class="warning">
				MISSING SPRITE! Click below to re-upload
				<span style="word-wrap: break-word">"{{ missing }}"</span>.
			</p>
			<button @click="reupload()">Re-Upload</button>
			<input
				type="file"
				ref="missingSpriteUpload"
				@change="onMissingSpriteFileUpload"
			/>
		</template>
	</object-tool>
</template>

<script lang="ts" setup>
import { getAAssetUrl } from '@/asset-manager';
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import ObjectTool from '@/components/toolbox/tools/object-tool.vue';
import type { Viewport } from '@/newStore/viewport';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import type { ISprite } from '@/store/object-types/sprite';
import type { IPanel } from '@/store/panels';
import type { DeepReadonly } from 'ts-essentials';
import { computed, inject, ref, type Ref } from 'vue';

const store = useStore();
const root = ref(null! as HTMLElement);
const missingSpriteUpload = ref(null! as HTMLInputElement);
setupPanelMixin(root);

const viewport = inject<Ref<Viewport>>('viewport')!;

const missing = computed((): string | null => {
	for (const asset of object.value.assets) {
		const url = getAAssetUrl(asset, false);
		console.log(url);
		if (url.startsWith('uploads:')) return url.substring(8);
	}
	return null;
});
const currentPanel = computed((): DeepReadonly<IPanel> => {
	return store.state.panels.panels[viewport.value.currentPanel];
});
const object = computed((): ISprite => {
	const obj = currentPanel.value.objects[viewport.value.selection!];
	if (obj.type !== 'sprite') return undefined!;
	return obj as ISprite;
});

function reupload() {
	missingSpriteUpload.value.click();
}

async function onMissingSpriteFileUpload() {
	const uploadInput = missingSpriteUpload.value;
	if (!uploadInput.files) return;
	if (uploadInput.files.length !== 1) {
		console.error('More than one file uploaded!');
		return;
	}

	const file = uploadInput.files[0];
	await transaction(async () => {
		const url = URL.createObjectURL(file);
		await store.dispatch('uploadUrls/add', {
			name: missing.value,
			url,
		});
	});
}
</script>

<style lang="scss" scoped>
input[type='file'] {
	display: none;
}
</style>
