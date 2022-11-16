<template>
	<div
		class="sub-item-grid"
		:class="{ vertical }"
		@dragenter="showDropTarget"
		@mouseleave="hideDropTarget"
	>
		<drop-target ref="spriteDt" class="drop-target" @drop="addCustomSpriteFile"
			>Drop here to add as a new sprite
		</drop-target>
		<div
			class="sprite"
			tabindex="0"
			v-for="sprite of sprites"
			:key="sprite.label"
			:title="sprite.label"
			:style="{ background: assetSpriteBackground(sprite) }"
			@click="addSpriteToScene(sprite)"
			@keypress.enter.prevent.stop="addSpriteToScene(sprite)"
			@keypress.space.prevent.stop="addSpriteToScene(sprite)"
		>
			{{ sprite.label }}
		</div>

		<d-button
			class="custom-sprite"
			icon="publish"
			@click="$refs.spriteUpload.click()"
		>
			Upload new sprite
			<input type="file" ref="spriteUpload" @change="onSpriteFileUpload" />
		</d-button>
		<d-button icon="insert_link" @click="uploadFromURL">
			New sprite from URL
		</d-button>
		<d-button icon="extension" @click="$emit('show-dialog', 'type: Sprites')">
			Search in content packs
		</d-button>
		<d-button v-if="showSpritesFolder" icon="folder" @click="openSpritesFolder">
			Open sprites folder
		</d-button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getAAssetUrl } from '@/asset-manager';
import { IAssetSwitch, ReplaceContentPackAction } from '@/store/content';
import {
	ContentPack,
	Sprite,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import DropTarget from '../../drop-target.vue';
import DButton from '@/components/ui/d-button.vue';
import { ICreateSpriteAction } from '@/store/objectTypes/sprite';
import environment, { Folder } from '@/environments/environment';
import { DeepReadonly } from 'ts-essentials';
import { IPanel } from '@/store/panels';
import { PanelMixin } from '../panelMixin';

const uploadedSpritesPackDefault: ContentPack<string> = {
	packId: 'dddg.uploads.sprites',
	packCredits: [''],
	dependencies: [],
	characters: [],
	fonts: [],
	sprites: [],
	poemStyles: [],
	poemBackgrounds: [],
	backgrounds: [],
	colors: [],
};

export default defineComponent({
	mixins: [PanelMixin],
	components: { DropTarget, DButton },
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		sprites(): DeepReadonly<Array<Sprite<IAssetSwitch>>> {
			return this.$store.state.content.current.sprites;
		},
		showSpritesFolder(): boolean {
			return (environment.supports.openableFolders as ReadonlySet<Folder>).has(
				'sprites'
			);
		},
	},
	methods: {
		assetSpriteBackground(sprite: Sprite<IAssetSwitch>) {
			return sprite.variants[0]
				.map((variant) => `url('${getAAssetUrl(variant, false)}')`)
				.join(',');
		},
		showDropTarget(e: DragEvent) {
			if (!e.dataTransfer) return;
			e.dataTransfer.effectAllowed = 'none';
			if (
				!Array.from(e.dataTransfer.items).find((item) =>
					item.type.match(/^image.*$/)
				)
			) {
				return;
			}
			e.dataTransfer.effectAllowed = 'link';
			(this.$refs.spriteDt as any).show();
		},
		hideDropTarget() {
			(this.$refs.spriteDt as any).hide();
		},
		onSpriteFileUpload() {
			const uploadInput = this.$refs.spriteUpload as HTMLInputElement;
			if (!uploadInput.files) return;
			for (const file of uploadInput.files) {
				this.addCustomSpriteFile(file);
			}
		},
		async uploadFromURL() {
			const url = prompt('Enter the URL of the image');
			if (url == null) return;
			const lastSegment = url.split('/').slice(-1)[0];
			await this.vuexHistory.transaction(async () => {
				await this.addNewCustomSprite(lastSegment, url);
			});
		},
		async addSpriteToScene(sprite: Sprite<IAssetSwitch>) {
			await this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createSprite', {
					panelId: this.currentPanel.id,
					assets: sprite.variants[0],
				} as ICreateSpriteAction);
			});
		},
		async addCustomSpriteFile(file: File) {
			await this.vuexHistory.transaction(async () => {
				const url = URL.createObjectURL(file);
				const assetUrl: string = await this.$store.dispatch('uploadUrls/add', {
					name: file.name,
					url,
				});
				await this.addNewCustomSprite(file.name, assetUrl);
			});
		},
		async addNewCustomSprite(label: string, url: string) {
			const old =
				this.$store.state.content.contentPacks.find(
					(x) => x.packId === uploadedSpritesPackDefault.packId
				) || uploadedSpritesPackDefault;
			const newPackVersion = {
				...old,
				sprites: [
					...old.sprites,
					{
						id: url,
						label,
						variants: [[{ lq: url, hq: url }]],
						defaultScale: [1.0, 1.0],
						hd: null,
					},
				],
			};
			await this.$store.dispatch('content/replaceContentPack', {
				contentPack: newPackVersion,
				processed: true,
			} as ReplaceContentPackAction);
		},
		openSpritesFolder() {
			environment.openFolder('sprites');
		},
	},
});
</script>

<style lang="scss" scoped>
//noinspection CssOverwrittenProperties

input {
	display: none;
}

.sub-item-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-evenly;
	margin: 0;

	&.vertical {
		width: 100%;
		flex-direction: row;

		:deep(button) {
			width: 100%;
		}
	}

	&:not(.vertical) {
		@include height-100();
		flex-direction: column;
	}
}

.sprite {
	box-shadow: inset 0 0 1px 3px $default-modal-backdrop;
	box-shadow: inset 0 0 1px 3px var(--modal-backdrop);
	height: 198px;
	width: 198px;
	background-size: contain !important;
	background-repeat: no-repeat !important;
	background-position: center center !important;
	text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
