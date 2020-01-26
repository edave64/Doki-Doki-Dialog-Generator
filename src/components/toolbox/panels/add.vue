<template>
	<div class="panel" v-if="isWebPSupported !== undefined">
		<h1>Add</h1>
		<div :class="{'group-selector': true, vertical }">
			<button :class="{active: group === 'characters'}" @click="group = 'characters'">
				<i class="material-icons">emoji_people</i> Characters
			</button>
			<button :class="{active: group === 'sprites'}" @click="group = 'sprites'">
				<i class="material-icons">change_history</i> Sprites
			</button>
			<button :class="{active: group === 'ui'}" @click="group = 'ui'">
				<i class="material-icons">view_quilt</i> UI
			</button>
		</div>
		<div :class="{'item-grid': true, vertical }">
			<template v-if="group === 'characters'">
				<div
					class="character"
					v-for="character of characters"
					:key="character.id"
					:title="character.label"
					@click="onChosen(character.id.toLowerCase())"
				>
					<img :src="assetPath(character)" :alt="character.label" />
				</div>
			</template>
			<template v-if="group === 'sprites'">
				<div class="btn custom-sprite" @click="$refs.upload.click()">
					Custom sprite upload
					<input type="file" ref="upload" @change="onFileUpload" />
				</div>
				<div class="btn custom-sprite" @click="uploadFromURL">Custom sprite from URL</div>
			</template>
			<template v-if="group === 'ui'">
				<button @click="addTextBox">Textbox</button>
			</template>
		</div>
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
	private group: 'characters' | 'sprites' | 'ui' = 'characters';

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
			})(++this.customAssetCount);
		}
	}

	private async uploadFromURL() {
		const url = prompt('Enter the URL of the image');
		if (!url) return;
		const name = 'customAsset' + ++this.customAssetCount;
		await registerAssetWithURL(name, url);
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

.group-selector {
	display: flex;

	&.vertical {
		width: 100%;
		flex-direction: row;
	}

	&:not(.vertical) {
		height: 100%;

		flex-direction: column;
	}

	button {
		flex-grow: 1;
		&.active {
			background: white;
		}
		.material-icons {
			display: block;
		}
	}
}

.item-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-evenly;

	&.vertical {
		margin-top: 4px;
		width: 100%;
		flex-direction: row;
	}

	&:not(.vertical) {
		margin-left: 4px;
		height: 100%;
		flex-direction: column;
	}

	.character img {
		max-height: 72px;
		max-width: 72px;
	}
}
</style>
