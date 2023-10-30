<template>
	<drop-target ref="spriteDt" class="drop-target" @drop="addCustomSpriteFile"
		>Drop here to add as a new sprite
	</drop-target>
	<template v-for="sprite of sprites">
		<div
			class="sprite"
			tabindex="0"
			:key="`${sprite.label}_missing`"
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

	<d-button class="custom-sprite" icon="publish" @click="spriteUpload.click()">
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
</template>

<script lang="ts" setup>
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
import { computed, ref } from 'vue';
import DropTarget from '../../drop-target.vue';
import MissingImage from '@/assets/missing_image.svg';
import { transaction, TransactionLayer } from '@/plugins/vuex-history';
import { useStore } from '@/store';

const store = useStore();

interface ISprite extends Sprite<IAssetSwitch> {
	missing: string | null;
	urls: string[];
}

const sprites = computed((): DeepReadonly<Array<ISprite>> => {
	return store.state.content.current.sprites.map((x) => {
		let missing: string | null = null;
		const urls = x.variants[0].map((y) => {
			const url = getAAssetUrl(y, false);
			if (url.startsWith('uploads:')) {
				// Force sprites to reload on upload
				Object.keys(store.state.uploadUrls);
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
});

const showSpritesFolder = computed(() => {
	return (environment.supports.openableFolders as ReadonlySet<Folder>).has(
		'sprites'
	);
});

function assetSpriteBackground(sprite: DeepReadonly<Sprite<IAssetSwitch>>) {
	return sprite.variants[0]
		.map((variant) => `url('${getAAssetUrl(variant, false)}')`)
		.join(',');
}
async function addSpriteToScene(sprite: DeepReadonly<ISprite>) {
	await transaction(async () => {
		await store.dispatch('panels/createSprite', {
			panelId: store.state.panels.currentPanel,
			assets: sprite.variants[0],
		} as ICreateSpriteAction);
	});
}
function openSpritesFolder() {
	environment.openFolder('sprites');
}
//#region Reupload missing sprite
const missingSpriteUpload = ref(null! as HTMLInputElement);
async function onMissingSpriteFileUpload(_e: Event) {
	const uploadInput = missingSpriteUpload.value;
	const spriteName = (uploadInput as any).uploadingSprite;
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
function reuploadingSprite(sprite: DeepReadonly<ISprite>) {
	const missingSpriteUpload_ = missingSpriteUpload.value;
	(missingSpriteUpload_ as any).uploadingSprite = getAAssetUrl(
		sprite.variants[0][0]
	).substring(8);
	missingSpriteUpload_.click();
}
//#endregion Reupload missing sprite
//#region Sprite Upload
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

const spriteUpload = ref(null! as HTMLInputElement);
function onSpriteFileUpload() {
	const uploadInput = spriteUpload.value;
	if (!uploadInput.files) return;
	for (const file of uploadInput.files) {
		addCustomSpriteFile(file);
	}
}

async function uploadFromURL() {
	const url = prompt('Enter the URL of the image');
	if (url == null) return;
	const lastSegment = url.split('/').slice(-1)[0];
	await addNewCustomSprite(lastSegment, url);
}

async function addCustomSpriteFile(file: File) {
	await transaction(async (subTransaction: TransactionLayer) => {
		const url = URL.createObjectURL(file);
		const assetUrl: string = await store.dispatch('uploadUrls/add', {
			name: file.name,
			url,
		});
		await addNewCustomSprite(file.name, assetUrl, subTransaction);
	});
}

async function addNewCustomSprite(
	label: string,
	url: string,
	subTransaction: TransactionLayer = transaction
) {
	const old =
		store.state.content.contentPacks.find(
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
		await store.dispatch('content/replaceContentPack', {
			contentPack: newPackVersion,
			processed: true,
		} as ReplaceContentPackAction);
	});
}
//#endregion Sprite Upload
//#region Drag and Drop
const spriteDt = ref(null! as typeof DropTarget);
function showDropTarget(e: DragEvent) {
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
	spriteDt.value.show();
}

function hideDropTarget() {
	spriteDt.value.hide();
}

defineExpose({ showDropTarget, hideDropTarget });
//#endregion Drag and Drop
</script>

<style lang="scss" scoped>
//noinspection CssOverwrittenProperties

input {
	display: none;
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
