<template>
	<div
		:class="{ background: true, active: isActive }"
		:title="title"
		:style="style"
		@click="$emit('input', backgroundId)"
	>
		{{ title }}
	</div>
</template>

<script lang="ts">
import { getAAsset } from '@/asset-manager';
import { Background } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { BackgroundLookup, IAssetSwitch } from '@/store/content';
import { IPanel } from '@/store/panels';
import { defineComponent } from 'vue';
import { DeepReadonly } from 'ts-essentials';
import { IAsset } from '@/render-utils/assets/asset';
import { ImageAsset } from '@/render-utils/assets/image-asset';

export default defineComponent({
	props: {
		backgroundId: {
			type: String,
			required: true,
		},
	},
	data: () => ({
		isWebPSupported: null as boolean | null,
		assets: [] as IAsset[],
	}),
	computed: {
		background(): DeepReadonly<IPanel['background']> {
			const currentPanel = this.$store.state.panels.currentPanel;
			return this.$store.state.panels.panels[currentPanel].background;
		},

		bgData(): Background<IAssetSwitch> | null {
			const backgrounds: BackgroundLookup =
				this.$store.getters['content/getBackgrounds'];
			return backgrounds.get(this.backgroundId) || null;
		},

		isActive(): boolean {
			return this.backgroundId === this.background.current;
		},

		title(): string {
			switch (this.backgroundId) {
				case 'buildin.static-color':
					return 'Static color';
				case 'buildin.transparent':
					return 'Transparent';
			}
			return this.bgData!.label || '';
		},

		style(): { [id: string]: string } {
			switch (this.backgroundId) {
				case 'buildin.static-color':
					return {
						'background-color': this.background.color,
					};
				case 'buildin.transparent':
					return {};
			}
			const urls = this.assets
				.filter((img) => img instanceof ImageAsset)
				.map((img) => `url('${(img as ImageAsset).html.src}')`)
				.join(',');
			return {
				backgroundImage: urls,
			};
		},
	},
	async created() {
		if (this.bgData) {
			this.assets = await Promise.all(
				this.bgData.variants[0].map((asset) => getAAsset(asset, false))
			);
		}
	},
});
</script>

<style lang="scss" scoped>
//noinspection CssOverwrittenProperties
.background {
	margin-top: 4px;
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

	&.active {
		box-shadow: inset 0 0 1px 3px $default-modal-backdrop-light;
		box-shadow: inset 0 0 1px 3px var(--modal-backdrop-light);
	}
}
</style>
