<!--
	A tab that allows selecting a background
-->
<template>
	<div class="panel" @dragenter="dragEnter" @mouseleave="$refs.dt.hide()">
		<drop-target ref="dt" class="drop-target" @drop="addImageFile"
			>Drop here to add as a new background
		</drop-target>
		<h1>Background</h1>
		<color v-if="colorSelect" v-model="bgColor" @leave="colorSelect = false" />
		<image-options
			v-else-if="imageOptions"
			type="background"
			title=""
			:panel-id="$store.state.panels.currentPanel"
			no-composition
			@leave="imageOptions = false"
		/>
		<template v-else>
			<background-settings
				@change-color="colorSelect = true"
				@open-image-options="imageOptions = true"
			/>
			<d-button
				icon="upload"
				class="upload-background"
				@click="$refs.upload.click()"
			>
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

<script lang="ts">
import DButton from '@/components/ui/d-button.vue';
import environment, { Folder } from '@/environments/environment';
import { transaction } from '@/plugins/vuex-history';
import { IAssetSwitch, ReplaceContentPackAction } from '@/store/content';
import { ISetColorMutation, ISetCurrentMutation } from '@/store/panels';
import {
	Background,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { defineComponent } from 'vue';
import DropTarget from '../drop-target.vue';
import Color from '../subtools/color/color.vue';
import ImageOptions from '../subtools/image-options/image-options.vue';
import BackgroundButton from './background/button.vue';
import BackgroundSettings from './background/settings.vue';
import { PanelMixin } from '../../mixins/panel-mixin';

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

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		BackgroundButton,
		BackgroundSettings,
		DropTarget,
		Color,
		ImageOptions,
		DButton,
	},
	data: () => ({
		colorSelect: false,
		imageOptions: false,
	}),
	computed: {
		bgColor: {
			get(): string {
				return this.$store.state.panels.panels[
					this.$store.state.panels.currentPanel
				].background.color;
			},
			set(color: string) {
				transaction(() => {
					this.$store.commit('panels/setBackgroundColor', {
						color,
						panelId: this.$store.state.panels.currentPanel,
					} as ISetColorMutation);
				});
			},
		},
		backgrounds(): Array<Background<IAssetSwitch>['id']> {
			return [
				...this.$store.state.content.current.backgrounds.map(
					(background) => background.id
				),
				'buildin.static-color',
				'buildin.transparent',
			];
		},
		showBackgroundsFolder(): boolean {
			return (environment.supports.openableFolders as ReadonlySet<Folder>).has(
				'backgrounds'
			);
		},
	},
	methods: {
		setBackground(id: Background<IAssetSwitch>['id']) {
			this.$store.commit('panels/setCurrentBackground', {
				current: id,
				panelId: this.$store.state.panels.currentPanel,
			} as ISetCurrentMutation);
		},
		onFileUpload(_e: Event) {
			const uploadInput = this.$refs.upload as HTMLInputElement;
			if (!uploadInput.files) return;
			for (const file of uploadInput.files) {
				this.addImageFile(file);
			}
		},
		async addImageFile(file: File) {
			await transaction(async () => {
				const url = URL.createObjectURL(file);
				const assetUrl: string = await this.$store.dispatch('uploadUrls/add', {
					name: file.name,
					url,
				});
				await this.addNewCustomBackground(file.name, file.name, assetUrl);
			});
		},
		addByUrl() {
			const url = prompt('Enter the URL of the image');
			if (url == null) return;
			const lastSegment = url.split('/').slice(-1)[0];
			this.addNewCustomBackground(lastSegment, lastSegment, url);
		},
		async addNewCustomBackground(
			id: Background<IAssetSwitch>['id'],
			label: string,
			url: string
		) {
			const old =
				this.$store.state.content.contentPacks.find(
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
				await this.$store.dispatch('content/replaceContentPack', {
					contentPack: newPackVersion,
					processed: true,
				} as ReplaceContentPackAction);
				this.setBackground(id);
			});
		},
		dragEnter(e: DragEvent) {
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
			(this.$refs.dt as any).show();
		},
		openBackgroundFolder() {
			environment.openFolder('backgrounds');
		},
	},
});
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
