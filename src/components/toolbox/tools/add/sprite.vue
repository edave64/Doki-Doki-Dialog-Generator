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
		<template v-for="sprite of sprites">
			<div
				class="sprite"
				tabindex="0"
				:key="sprite.label"
				:title="sprite.label"
				:style="{ background: assetSpriteBackground(sprite) }"
				@click="reuploadingSprite(sprite)"
				@keypress.enter.prevent.stop="reuploadingSprite(sprite)"
				@keypress.space.prevent.stop="reuploadingSprite(sprite)"
				v-if="sprite.missing !== null"
			>
				{{ sprite.label }}
			</div>
			<div
				class="sprite"
				tabindex="0"
				:key="sprite.label"
				:title="sprite.label"
				:style="{ background: assetSpriteBackground(sprite) }"
				@click="addSpriteToScene(sprite)"
				@keypress.enter.prevent.stop="addSpriteToScene(sprite)"
				@keypress.space.prevent.stop="addSpriteToScene(sprite)"
				v-else
			>
				{{ sprite.label }}
			</div>
		</template>

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
		<input
			type="file"
			ref="missingSpriteUpload"
			@change="onMissingSpriteFileUpload"
		/>
	</div>
</template>

<script lang="ts">
import { getAAssetUrl } from '@/asset-manager';
import DButton from '@/components/ui/d-button.vue';
import environment, { Folder } from '@/environments/environment';
import { IAssetSwitch, ReplaceContentPackAction } from '@/store/content';
import { ICreateSpriteAction } from '@/store/object-types/sprite';
import {
	ContentPack,
	Sprite,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent } from 'vue';
import DropTarget from '../../drop-target.vue';
import { PanelMixin } from '../panel-mixin';

import MissingImage from '@/assets/missing_image.svg';
import { transaction, TransactionLayer } from '@/plugins/vuex-history';

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

interface ISprite extends Sprite<IAssetSwitch> {
	missing: string | null;
	urls: string[];
}

export default defineComponent({
	mixins: [PanelMixin],
	components: { DropTarget, DButton },
	computed: {
		sprites(): DeepReadonly<Array<ISprite>> {
			return this.$store.state.content.current.sprites.map((x) => {
				let missing: string | null = null;
				const urls = x.variants[0].map((y) => {
					const url = getAAssetUrl(y, false);
					if (url.startsWith('uploads:')) {
						// Force sprites to reload on upload
						Object.keys(this.$store.state.uploadUrls);
						missing = url;
						return MissingImage;
					} else {
						return url;
					}
				});
				return {
					...x,
					missing,
					urls,
				} as ISprite;
			});
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
		async onMissingSpriteFileUpload(_e: Event) {
			const uploadInput = this.$refs.missingSpriteUpload as HTMLInputElement;
			const spriteName = (uploadInput as any).uploadingSprite;
			if (!uploadInput.files) return;
			if (uploadInput.files.length !== 1) {
				console.error('More than one file uploaded!');
				return;
			}

			const file = uploadInput.files[0];
			await transaction(async () => {
				const url = URL.createObjectURL(file);
				await this.$store.dispatch('uploadUrls/add', {
					name: spriteName,
					url,
				});
			});
		},
		async uploadFromURL() {
			const url = prompt('Enter the URL of the image');
			if (url == null) return;
			const lastSegment = url.split('/').slice(-1)[0];
			await this.addNewCustomSprite(lastSegment, url);
		},
		async addSpriteToScene(sprite: ISprite) {
			await transaction(async () => {
				await this.$store.dispatch('panels/createSprite', {
					panelId: this.$store.state.panels.currentPanel,
					assets: sprite.variants[0],
				} as ICreateSpriteAction);
			});
		},
		reuploadingSprite(sprite: ISprite) {
			const missingSpriteUpload = this.$refs
				.missingSpriteUpload as HTMLInputElement;
			(missingSpriteUpload as any).uploadingSprite = getAAssetUrl(
				sprite.variants[0][0]
			).substring(8);
			missingSpriteUpload.click();
		},
		async addCustomSpriteFile(file: File) {
			await transaction(async (subTransaction: TransactionLayer) => {
				const url = URL.createObjectURL(file);
				const assetUrl: string = await this.$store.dispatch('uploadUrls/add', {
					name: file.name,
					url,
				});
				await this.addNewCustomSprite(file.name, assetUrl, subTransaction);
			});
		},
		async addNewCustomSprite(
			label: string,
			url: string,
			subTransaction: TransactionLayer = transaction
		) {
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
			await subTransaction(async () => {
				await this.$store.dispatch('content/replaceContentPack', {
					contentPack: newPackVersion,
					processed: true,
				} as ReplaceContentPackAction);
			});
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
