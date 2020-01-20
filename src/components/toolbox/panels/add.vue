<template>
	<div class="panel" v-if="isWebPSupported !== undefined">
		<h1>Add character</h1>
		<div :class="{characterGrid: true, vertical }">
			<div
				class="character"
				v-for="character of characters"
				:key="character.id"
				:title="character.name"
				@click="onChosen(character.id.toLowerCase())"
			>
				<img :src="assetPath(character)" :alt="character.name" />
			</div>
		</div>
		<div class="btn custom-sprite" @click="$refs.upload.click()">
			Custom sprite upload
			<input type="file" ref="upload" @change="onFileUpload" />
		</div>
		<div class="btn custom-sprite" @click="uploadFromURL">Custom sprite from URL</div>
		<button @click="addTextBox">Textbox</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import {
	isWebPSupported,
	registerAsset,
	registerAssetWithURL,
} from '@/asset-manager';
import { ICreateCharacterAction } from '@/store/objectTypes/characters';
import { ICreateTextBoxAction } from '@/store/objectTypes/textbox';
import { IAsset } from '../../../store/content';
import { Character } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { Store } from 'vuex';
import { IRootState } from '../../../store';
import { PanelMixin } from './panelMixin';
import { State } from 'vuex-class-decorator';

@Component({
	components: {},
})
export default class AddPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;
	private isWebPSupported: boolean | null = null;
	private customAssetCount = 0;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get characters(): Array<Character<IAsset>> {
		return this.$store.state.content.current.characters;
	}

	private assetPath(character: Character<IAsset>) {
		return character.chibi.lq;
	}

	private onFileUpload(e: Event) {
		const uploadInput = this.$refs.upload as HTMLInputElement;
		if (!uploadInput.files) return;
		for (const file of uploadInput.files) {
			(nr => {
				const name = 'customAsset' + nr;
				const url = registerAsset(name, file);
				this.$emit('add-custom-asset', name);
			})(++this.customAssetCount);
		}
	}

	private async uploadFromURL() {
		const url = prompt('Enter the URL of the image');
		if (!url) return;
		const name = 'customAsset' + ++this.customAssetCount;
		await registerAssetWithURL(name, url);
		this.$emit('add-custom-asset', name);
	}

	private addTextBox() {
		this.$store.dispatch('objects/createTextBox', {} as ICreateTextBoxAction);
	}

	private onChosen(id: string) {
		this.$store.dispatch('objects/createCharacters', {
			characterType: id,
		} as ICreateCharacterAction);
	}
}
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

#panels {
	&:not(.vertical) .panel {
		justify-content: center;
	}
}

.panel {
	flex-wrap: nowrap;

	.custom-sprite {
		input {
			display: none;
		}
	}
}

.characterGrid {
	overflow: hidden;
	display: grid;
	place-items: center;

	&.vertical {
		width: 100%;
		grid-template-columns: 1fr 1fr 1fr;
		grid-auto-rows: 72px;
		grid-auto-flow: row;
	}

	&:not(.vertical) {
		height: 100%;
		grid-template-rows: 1fr 1fr;
		grid-auto-columns: 72px;
		grid-auto-flow: column;
	}

	.character {
		align-self: center;
		justify-self: center;
	}

	.character img {
		max-height: 72px;
		max-width: 72px;
	}
}
</style>
