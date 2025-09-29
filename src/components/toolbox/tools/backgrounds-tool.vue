<!--
	A tab that allows selecting a background
-->
<template>
	<div
		class="panel"
		ref="root"
		@dragenter="dragEnter"
		@mouseleave="dt.hide()"
	>
		<drop-target ref="dt" class="drop-target" @drop="addImageFile"
			>Drop here to add as a new background
		</drop-target>
		<h1>Background</h1>
		<color-picker
			v-if="colorPickerActive"
			v-model="bgColor"
			@leave="colorPickerActive = false"
		/>
		<image-options
			v-else-if="imageOptionsActive"
			type="background"
			title=""
			:panel-id="viewport.currentPanel"
			no-composition
			@leave="imageOptionsActive = false"
		/>
		<template v-else>
			<bg-settings
				@change-color="colorPickerActive = true"
				@open-image-options="imageOptionsActive = true"
			/>
			<d-button
				icon="upload"
				class="upload-background"
				@click="upload.click()"
			>
				Upload
				<input
					type="file"
					ref="upload"
					@change="onFileUpload"
					multiple
				/>
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
			<bg-button
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
import environment, { type Folder } from '@/environments/environment';
import { transaction } from '@/history-engine/transaction';
import { useViewport } from '@/hooks/use-viewport';
import type { IAssetSwitch } from '@/store/content';
import { state } from '@/store/root';
import type {
	Background,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { computed, ref } from 'vue';
import { setupPanelMixin } from '../../mixins/panel-mixin';
import DropTarget from '../drop-target.vue';
import ColorPicker from '../subtools/color/color-picker.vue';
import ImageOptions from '../subtools/image-options/image-options.vue';
import BgButton from './background/bg-button.vue';
import BgSettings from './background/bg-settings.vue';

const uploadedBackgroundsPackDefaults: ContentPack<IAssetSwitch> = {
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

const root = ref(null! as HTMLElement);
setupPanelMixin(root);
const viewport = useViewport();

const colorPickerActive = ref(false);
const imageOptionsActive = ref(false);
const bgColor = computed({
	get(): string {
		return state.panels.panels[viewport.value.currentPanel].background
			.color;
	},
	set(color: string) {
		transaction(() => {
			state.panels.panels[viewport.value.currentPanel].background.color =
				color;
		});
	},
});
const backgrounds = computed((): Array<Background<IAssetSwitch>['id']> => {
	return [
		...state.content.current.backgrounds.map((background) => background.id),
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
	transaction(() => {
		state.panels.panels[viewport.value.currentPanel].background.current =
			id;
	});
}
function openBackgroundFolder() {
	environment.openFolder('backgrounds');
}
//#region Uploads
const upload = ref(null! as HTMLInputElement);
function onFileUpload() {
	const uploadInput = upload.value;
	if (!uploadInput.files) return;
	for (const file of uploadInput.files) {
		addImageFile(file);
	}
}
async function addImageFile(file: File) {
	await transaction(async () => {
		const url = URL.createObjectURL(file);
		const assetUrl: string = await state.uploadUrls.add(file.name, url);
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
		state.content.contentPacks.find(
			(x: ContentPack<IAssetSwitch>) =>
				x.packId === uploadedBackgroundsPackDefaults.packId
		) || uploadedBackgroundsPackDefaults;
	const newPackVersion: ContentPack<IAssetSwitch> = {
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
							sourcePack: uploadedBackgroundsPackDefaults.packId!,
						},
					],
				],
				scaling: 'none',
			},
		],
	};
	await transaction(async () => {
		await state.content.replaceContentPack({
			contentPack: newPackVersion,
			processed: true,
		});
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
