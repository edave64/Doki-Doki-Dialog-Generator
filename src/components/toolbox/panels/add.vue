<template>
	<div
		class="panel"
		v-if="isWebPSupported !== undefined"
		@dragenter="showDropTarget"
		@mouseleave="hideDropTarget"
	>
		<drop-target
			ref="spriteDt"
			class="drop-target"
			@drop="addCustomSpriteFile"
		>Drop here to add as a new sprite</drop-target>
		<h1>Add</h1>
		<div :class="{ 'group-selector': true, vertical }">
			<button :class="{ active: group === 'characters' }" @click="group = 'characters'">
				<i class="material-icons">emoji_people</i> Characters
			</button>
			<button :class="{ active: group === 'sprites' }" @click="group = 'sprites'">
				<i class="material-icons">change_history</i> Sprites
			</button>
			<button :class="{ active: group === 'ui' }" @click="group = 'ui'">
				<i class="material-icons">view_quilt</i> UI
			</button>
		</div>
		<div :class="{ 'item-grid': true, vertical }">
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
				<div class="btn custom-sprite disabled" title="Not yet implemented">
					<i class="material-icons">extension</i> Search in content packs
				</div>
			</template>
			<template v-if="group === 'sprites'">
				<div
					class="sprite"
					v-for="sprite of sprites"
					:key="sprite.label"
					:title="sprite.label"
					:style="{ background: assetSpriteBackground(sprite) }"
					@click="addSpriteToScene(sprite)"
				>{{ sprite.label }}</div>
				<button class="btn custom-sprite" @click="$refs.spriteUpload.click()">
					<i class="material-icons">publish</i>
					Upload new sprite
					<input type="file" ref="spriteUpload" @change="onSpriteFileUpload" />
				</button>
				<button @click="uploadFromURL">
					<i class="material-icons">insert_link</i> New sprite from URL
				</button>
				<button title="Not yet implemented" disabled="disabled">
					<i class="material-icons">extension</i> Search in content packs
				</button>
			</template>
			<template v-if="group === 'ui'">
				<button @click="addTextBox">Textbox</button>
				<button disabled="disabled">Poem</button>
				<button disabled="disabled">Dialog box</button>
				<button disabled="disabled">Choice</button>
				<button disabled="disabled">Console</button>
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
import { IAsset, ReplaceContentPackAction } from '@/store/content';
import {
	Character,
	ContentPack,
	Sprite,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { PanelMixin } from './panelMixin';
import { State } from 'vuex-class-decorator';
import { IHistorySupport } from '@/plugins/vuex-history';
import DropTarget from '../drop-target.vue';
import { ICreateSpriteAction } from '@/store/objectTypes/sprite';

const uploadedSpritesPack: ContentPack<string> = {
	packId: 'dddg.buildin.uploadedSprites',
	packCredits: '',
	characters: [],
	fonts: [],
	sprites: [],
	poemStyles: [],
	backgrounds: [],
	colors: [],
};

@Component({
	components: { DropTarget },
})
export default class AddPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;
	private isWebPSupported: boolean | null = null;
	private customAssetCount = 0;
	private group: 'characters' | 'sprites' | 'ui' = 'characters';

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get characters(): Array<Character<IAsset>> {
		return this.$store.state.content.current.characters;
	}

	private get sprites(): Array<Sprite<IAsset>> {
		return this.$store.state.content.current.sprites;
	}

	private assetSpriteBackground(sprite: Sprite<IAsset>) {
		return sprite.variants[0].map(variant => `url('${variant.lq}')`).join(',');
	}

	private assetPath(character: Character<IAsset>) {
		return character.chibi ? character.chibi.lq : '';
	}

	private showDropTarget(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.effectAllowed = 'none';
		if (
			!Array.from(e.dataTransfer.items).find(item =>
				item.type.match(/^image.*$/)
			)
		) {
			return;
		}
		e.dataTransfer.effectAllowed = 'link';
		if (this.group === 'sprites') {
			(this.$refs.spriteDt as DropTarget).show();
		}
	}

	private hideDropTarget() {
		if (this.group === 'sprites') {
			(this.$refs.spriteDt as DropTarget).hide();
		}
	}

	private onSpriteFileUpload(e: Event) {
		const uploadInput = this.$refs.spriteUpload as HTMLInputElement;
		if (!uploadInput.files) return;
		for (const file of uploadInput.files) {
			this.addCustomSpriteFile(file);
		}
	}

	private async uploadFromURL() {
		const url = prompt('Enter the URL of the image');
		if (!url) return;
		const lastSegment = url.split('/').slice(-1)[0];
		this.addNewCustomSprite(lastSegment, url);
	}

	private async addSpriteToScene(sprite: Sprite<IAsset>) {
		this.history.transaction(async () => {
			await this.$store.dispatch('objects/createSprite', {
				assets: sprite.variants[0],
			} as ICreateSpriteAction);
		});
	}

	private addTextBox() {
		this.$store.dispatch('objects/createTextBox', {} as ICreateTextBoxAction);
	}

	private onChosen(id: string) {
		this.$store.dispatch('objects/createCharacters', {
			characterType: id,
		} as ICreateCharacterAction);
	}

	private addCustomSpriteFile(file: File) {
		const url = URL.createObjectURL(file);
		this.addNewCustomSprite(file.name, url);
	}

	private addNewCustomSprite(label: string, url: string) {
		uploadedSpritesPack.sprites.push({
			label,
			variants: [[url]],
		});
		this.history.transaction(() => {
			this.$store.dispatch('content/replaceContentPack', {
				contentPack: uploadedSpritesPack,
				processed: false,
			} as ReplaceContentPackAction);
		});
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

		button {
			width: 100%;
		}
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

.item-grid {
	.sprite {
		box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
		height: 256px;
		width: 256px;
		background-size: contain !important;
		background-repeat: no-repeat !important;
		background-position: center center !important;
		margin-right: 4px;
		text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000,
			-1px 1px 0 #000, 1px 1px 0 #000;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style>
