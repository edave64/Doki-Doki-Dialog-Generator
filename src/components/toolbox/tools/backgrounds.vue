<!--
	A tab that allows selecting a background
-->
<template>
	<div class="panel" ref="root" @dragenter="dragEnter" @mouseleave="dt.hide()">
		<drop-target ref="dt" class="drop-target" @drop="addImageFile"
			>Drop here to add as a new background
		</drop-target>
		<h1>Background</h1>
		<color v-if="colorSelect" v-model="bgColor" @leave="colorSelect = false" />
		<image-options
			v-else-if="imageOptions"
			type="background"
			title=""
			:panel-id="store.state.panels.currentPanel"
			no-composition
			@leave="imageOptions = false"
		/>
		<template v-else>
			<background-settings
				@change-color="colorSelect = true"
				@open-image-options="imageOptions = true"
			/>
			<d-button icon="upload" class="upload-background" @click="upload.click()">
				Upload
				<input type="file" ref="upload" @change="onFileUpload" />
			</d-button>
			<d-button icon="link" class="upload-background" @click="addByUrl">
				Add by URL
			</d-button>
			<d-button
				icon="extension"
				class="upload-background"
				@click="$emit('show-dialog', 'type: Backgrounds')"
			>
				Search in content packs
			</d-button>
			<d-button
				v-if="showBackgroundsFolder"
				icon="folder"
				class="upload-background"
				@click="openBackgroundFolder"
			>
				Open backgrounds folder
			</d-button>
			<background-button
				v-for="background of backgrounds"
				:key="background"
				:backgroundId="background"
				@input="setBackground(background)"
			/>
		</template>
	</div>
</template>

<script lang="ts" setup>
import DButton from '@/components/ui/d-button.vue';
import environment, { Folder } from '@/environments/environment';
import { transaction } from '@/plugins/vuex-history';
import { IAssetSwitch, ReplaceContentPackAction } from '@/store/content';
import { ISetColorMutation, ISetCurrentMutation } from '@/store/panels';
import {
	Background,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { computed, ref } from 'vue';
import DropTarget from '../drop-target.vue';
import Color from '../subtools/color/color.vue';
import ImageOptions from '../subtools/image-options/image-options.vue';
import BackgroundButton from './background/button.vue';
import BackgroundSettings from './background/settings.vue';
import { setupPanelMixin } from '../../mixins/panel-mixin';
import { Store, useStore } from 'vuex';
import { IRootState } from '@/store';

const uploadedBackgroundsPackDefaults: ContentPack<string> = {
	packId: 'dddg.uploads.backgrounds',
	dependencies: [],
	packCredits: [],
	characters: [],
	fonts: [],
	sprites: [],
	poemStyles: [],
	poemBackgrounds: [],
	backgrounds: [],
	colors: [],
};

const store = useStore() as Store<IRootState>;
const root = ref(null! as HTMLElement);
setupPanelMixin(root);

const colorSelect = ref(false);
const imageOptions = ref(false);
const bgColor = computed({
	get(): string {
		return store.state.panels.panels[store.state.panels.currentPanel].background
			.color;
	},
	set(color: string) {
		transaction(() => {
			store.commit('panels/setBackgroundColor', {
				color,
				panelId: store.state.panels.currentPanel,
			} as ISetColorMutation);
		});
	},
});
const backgrounds = computed((): Array<Background<IAssetSwitch>['id']> => {
	return [
		...store.state.content.current.backgrounds.map(
			(background) => background.id
		),
		'buildin.static-color',
		'buildin.transparent',
	];
});
const showBackgroundsFolder = computed((): boolean => {
	return (environment.supports.openableFolders as ReadonlySet<Folder>).has(
		'backgrounds'
	);
});

function setBackground(id: Background<IAssetSwitch>['id']) {
	store.commit('panels/setCurrentBackground', {
		current: id,
		panelId: store.state.panels.currentPanel,
	} as ISetCurrentMutation);
}
function openBackgroundFolder() {
	environment.openFolder('backgrounds');
}
//#region Uploads
const upload = ref(null! as HTMLInputElement);
function onFileUpload(_e: Event) {
	const uploadInput = upload.value;
	if (!uploadInput.files) return;
	for (const file of uploadInput.files) {
		addImageFile(file);
	}
}
async function addImageFile(file: File) {
	await transaction(async () => {
		const url = URL.createObjectURL(file);
		const assetUrl: string = await store.dispatch('uploadUrls/add', {
			name: file.name,
			url,
		});
		await addNewCustomBackground(file.name, file.name, assetUrl);
	});
}
function addByUrl() {
	const url = prompt('Enter the URL of the image');
	if (url == null) return;
	const lastSegment = url.split('/').slice(-1)[0];
	addNewCustomBackground(lastSegment, lastSegment, url);
}
async function addNewCustomBackground(
	id: Background<IAssetSwitch>['id'],
	label: string,
	url: string
) {
	const old =
		store.state.content.contentPacks.find(
			(x: ContentPack<IAssetSwitch>) =>
				x.packId === uploadedBackgroundsPackDefaults.packId
		) || uploadedBackgroundsPackDefaults;
	const newPackVersion = {
		...old,
		backgrounds: [
			...old.backgrounds,
			{
				id,
				label,
				variants: [
					[
						{
							hq: url,
							lq: url,
							sourcePack: uploadedBackgroundsPackDefaults.packId,
						},
					],
				],
				scaling: 'none',
			},
		],
	};
	await transaction(async () => {
		await store.dispatch('content/replaceContentPack', {
			contentPack: newPackVersion,
			processed: true,
		} as ReplaceContentPackAction);
		setBackground(id);
	});
}
//#endregion Uploads
//#region Drag and Drop
const dt = ref(null! as typeof DropTarget);
function dragEnter(e: DragEvent) {
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
	dt.value.show();
}
//#endregion Drag and Drop
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

.upload-background {
	margin-top: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 48px;
	min-height: 48px;
	text-align: center;
	user-select: none;

	input {
		display: none;
	}
}

#panels .panel:not(.vertical) {
	> .btn,
	button,
	.background {
		height: calc(33% - 4px);
		min-height: calc(33% - 4px);
		margin-top: 4px;
		margin-right: 4px;
		width: 12rem;
	}
}

#panels .panel.vertical {
	> .btn,
	button,
	.background {
		width: 100%;
	}
}

.vertical {
	fieldset {
		input {
			width: 60px;
		}
	}
}
</style>
