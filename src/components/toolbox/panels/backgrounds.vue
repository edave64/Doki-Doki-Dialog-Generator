<template>
	<div class="panel" @dragenter="$refs.dt.show()" @mouseleave="$refs.dt.hide()">
		<drop-target ref="dt" class="drop-target" @drop="addImageFile"
			>Drop here to add as a new background</drop-target
		>
		<h1>Background</h1>
		<background-settings :value="value" />

		<background-button
			v-for="background of backgrounds"
			:key="background"
			:background="background"
			@input="setBackground(background)"
		/>
		<div class="btn upload-background" @click="$refs.upload.click()">
			Upload
			<input type="file" ref="upload" @change="onFileUpload" />
		</div>
		<button class="upload-background" @click="addByUrl">Add by URL</button>
		<button
			class="upload-background"
			title="Not yet implemented"
			disabled="disabled"
		>
			<i class="material-icons">extension</i> Search in content packs
		</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { registerAsset, getAsset } from '@/asset-manager';
import { IBackground, color } from '@/models/background';
import BackgroundButton from './background/button.vue';
import BackgroundSettings from './background/settings.vue';
import DropTarget from '../drop-target.vue';
import { State } from 'vuex-class-decorator';
import { Store } from 'vuex';
import { IRootState } from '../../../store';
import { IAsset, IReplaceContentPackAction } from '../../../store/content';
import {
	Background,
	ContentPack,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { ISetCurrentMutation } from '../../../store/background';
import { PanelMixin } from './panelMixin';
import { IHistorySupport } from '../../../plugins/vuex-history';

const uploadedBackgroundsPack: ContentPack<string> = {
	packId: 'dddg.buildin.uploadedBackgrounds',
	packCredits: '',
	characters: [],
	fonts: [],
	sprites: [],
	poemStyles: [],
	backgrounds: [],
};

@Component({
	components: {
		BackgroundButton,
		BackgroundSettings,
		DropTarget,
	},
})
export default class BackgroundsPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get backgrounds(): string[] {
		return [
			...this.$store.state.content.current.backgrounds.map(
				background => background.label
			),
			'buildin.static-color',
			'buildin.transparent',
		];
	}

	private setBackground(id: string) {
		this.$store.commit('background/setCurrent', {
			current: id,
		} as ISetCurrentMutation);
	}

	private onFileUpload(e: Event) {
		const uploadInput = this.$refs.upload as HTMLInputElement;
		if (!uploadInput.files) return;
		for (const file of uploadInput.files) {
			this.addImageFile(file);
		}
	}

	private addImageFile(file: File) {
		const url = URL.createObjectURL(file);
		this.addNewCustomBackground(file.name, url);
	}

	private addByUrl() {
		const url = prompt('Enter the URL of the image');
		if (!url) return;
		const lastSegment = url.split('/').slice(-1)[0];
		this.addNewCustomBackground(lastSegment, url);
	}

	private addNewCustomBackground(label: string, url: string) {
		uploadedBackgroundsPack.backgrounds.push({
			label,
			variants: [[url]],
		});
		this.history.transaction(() => {
			this.$store.dispatch('content/replaceContentPack', {
				contentPack: uploadedBackgroundsPack,
			} as IReplaceContentPackAction);
			this.setBackground(label);
		});
	}
}
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

.upload-background {
	margin-top: 4px;
	background-size: cover;
	text-shadow: 0 0 2px white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
	height: 48px;
	min-height: 48px;
	text-align: center;
	user-select: none;
	text-align: center;
	user-select: none;

	input {
		display: none;
	}
}

#panels:not(.vertical) > .panel {
	> div,
	button {
		&:not(.drop-target) {
			width: 12rem;
		}
	}
}

#panels.vertical > .panel {
	> div {
		text-align: center;
	}
}

.vertical {
	fieldset {
		width: calc(100% - 4px);
		input {
			width: 60px;
		}
	}
}
</style>
