<!--
	A tool that is shown when a sprite object is selected.
-->
<template>
	<object-tool :object="object" title="Custom Sprite">
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

<script lang="ts">
import { getAAssetUrl } from '@/asset-manager';
import { PanelMixin } from '@/components/mixins/panel-mixin';
import ObjectTool from '@/components/toolbox/tools/object-tool.vue';
import { transaction } from '@/plugins/vuex-history';
import { ISprite } from '@/store/object-types/sprite';
import { IPanel } from '@/store/panels';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent } from 'vue';

export default defineComponent({
	mixins: [PanelMixin],
	components: { ObjectTool },
	computed: {
		missing(): string | null {
			for (const asset of this.object.assets) {
				const url = getAAssetUrl(asset, false);
				console.log(url);
				if (url.startsWith('uploads:')) return url.substring(8);
			}
			return null;
		},
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		object(): ISprite {
			const obj = this.currentPanel.objects[this.$store.state.ui.selection!];
			if (obj.type !== 'sprite') return undefined!;
			return obj as ISprite;
		},
	},
	methods: {
		reupload() {
			const missingSpriteUpload = this.$refs
				.missingSpriteUpload as HTMLInputElement;
			missingSpriteUpload.click();
		},
		async onMissingSpriteFileUpload(_e: Event) {
			const uploadInput = this.$refs.missingSpriteUpload as HTMLInputElement;
			if (!uploadInput.files) return;
			if (uploadInput.files.length !== 1) {
				console.error('More than one file uploaded!');
				return;
			}

			const file = uploadInput.files[0];
			await transaction(async () => {
				const url = URL.createObjectURL(file);
				await this.$store.dispatch('uploadUrls/add', {
					name: this.missing,
					url,
				});
			});
		},
	},
});
</script>

<style lang="scss" scoped>
input[type='file'] {
	display: none;
}
</style>
