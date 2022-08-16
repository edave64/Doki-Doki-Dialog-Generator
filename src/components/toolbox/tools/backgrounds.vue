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

			<div class="btn upload-background" @click="$refs.upload.click()">
				Upload
				<input type="file" ref="upload" @change="onFileUpload" />
			</div>
			<button class="upload-background" @click="addByUrl">Add by URL</button>
			<button
				class="upload-background"
				@click="$emit('show-dialog', 'type: Backgrounds')"
			>
				<i class="material-icons">extension</i> Search in content packs
			</button>
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
import BackgroundButton from './background/button.vue';
import BackgroundSettings from './background/settings.vue';
import ImageOptions from '../subtools/image-options/image-options.vue';
import DropTarget from '../drop-target.vue';
import { IAssetSwitch, ReplaceContentPackAction } from '@/store/content';
import {
	Background,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { ISetColorMutation, ISetCurrentMutation } from '@/store/panels';
import { PanelMixin } from './panelMixin';
import Color from '../subtools/color/color.vue';
import { defineComponent } from 'vue';
import environment, { Folder } from '@/environments/environment';
import DButton from '@/components/ui/d-button.vue';

const uploadedBackgroundsPack: ContentPack<string> = {
	packId: 'dddg.buildin.uploadedBackgrounds',
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
				this.vuexHistory.transaction(() => {
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
		addImageFile(file: File) {
			const url = URL.createObjectURL(file);
			this.addNewCustomBackground(file.name, file.name, url);
		},
		addByUrl() {
			const url = prompt('Enter the URL of the image');
			if (!url) return;
			const lastSegment = url.split('/').slice(-1)[0];
			this.addNewCustomBackground(lastSegment, lastSegment, url);
		},
		addNewCustomBackground(
			id: Background<IAssetSwitch>['id'],
			label: string,
			url: string
		) {
			uploadedBackgroundsPack.backgrounds.push({
				id,
				label,
				variants: [[url]],
				scaling: 'none',
			});
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('content/replaceContentPack', {
					contentPack: uploadedBackgroundsPack,
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

.panel:not(.vertical) {
	> div,
	button {
		&:not(.drop-target) {
			width: 12rem;
		}
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
