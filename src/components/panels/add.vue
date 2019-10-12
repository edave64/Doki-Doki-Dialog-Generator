<template>
	<div :class="{ panel: true }" v-if="isWebPSupported !== undefined">
		<h1>Add character</h1>
		<div
			class="character"
			v-for="character of characters"
			:key="character.id"
			:title="character.name"
			@click="onChosen(character.id.toLowerCase())"
		>
			<img :src="assetPath(character)" :alt="character.name" />
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
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
	isWebPSupported,
	ICharacter,
	characterOrder,
	registerAsset,
	registerAssetWithURL,
} from '../../asset-manager';
import { ICreateCharacterAction } from '../../store/objectTypes/characters';
import { ICreateTextBoxAction } from '@/store/objectTypes/textbox';

@Component({
	components: {},
})
export default class AddPanel extends Vue {
	private isWebPSupported: boolean | null = null;
	private customAssetCount = 0;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get characters(): Array<ICharacter<any>> {
		return characterOrder;
	}

	private assetPath(character: ICharacter<any>) {
		return `${process.env.BASE_URL}/assets/chibis/${character.internalId}.lq.${
			this.isWebPSupported ? 'webp' : 'png'
		}`.replace(/\/+/, '/');
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

	&.vertical .panel {
		.character {
			text-align: center;
		}
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
</style>