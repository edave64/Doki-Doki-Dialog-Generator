<template>
	<div
		class="panel"
		v-if="isWebPSupported !== undefined"
		@dragenter="showDropTarget"
		@mouseleave="hideDropTarget"
	>
		<drop-target ref="spriteDt" class="drop-target" @drop="addCustomSpriteFile"
			>Drop here to add as a new sprite
		</drop-target>
		<h1>Add</h1>
		<div :class="{ 'group-selector': true, vertical }">
			<d-button
				:class="{ active: group === 'characters' }"
				icon-pos="top"
				icon="emoji_people"
				@click="group = 'characters'"
			>
				Char&shy;acters
			</d-button>
			<d-button
				:class="{ active: group === 'sprites' }"
				icon-pos="top"
				icon="change_history"
				@click="group = 'sprites'"
			>
				Sprites
			</d-button>
			<d-button
				:class="{ active: group === 'ui' }"
				icon-pos="top"
				icon="view_quilt"
				@click="group = 'ui'"
			>
				UI
			</d-button>
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
				<d-button
					class="custom-sprite"
					icon="extension"
					@click="$emit('show-dialog', 'type: Characters')"
				>
					Search in content packs
				</d-button>
			</template>
			<template v-if="group === 'sprites'">
				<div
					class="sprite"
					v-for="sprite of sprites"
					:key="sprite.label"
					:title="sprite.label"
					:style="{ background: assetSpriteBackground(sprite) }"
					@click="addSpriteToScene(sprite)"
				>
					{{ sprite.label }}
				</div>

				<d-button
					class="custom-sprite"
					icon="publish"
					@click="$refs.spriteUpload.click()"
				>
					Upload new sprite
					<input type="file" ref="spriteUpload" @change="onSpriteFileUpload" />
				</d-button>
				<d-button icon="insert_link" @click="uploadFromURL">
					New sprite from URL
				</d-button>
				<d-button
					icon="extension"
					@click="$emit('show-dialog', 'type: Sprites')"
				>
					Search in content packs
				</d-button>
				<d-button
					v-if="showSpritesFolder"
					icon="folder"
					@click="openSpritesFolder"
				>
					Open sprites folder
				</d-button>
			</template>
			<template v-if="group === 'ui'">
				<button @click="addTextBox">Textbox</button>
				<button @click="addPoem">Poem</button>
				<button @click="addDialog">Notification</button>
				<button @click="addChoice">Choice</button>
				<button @click="addConsole">Console</button>
			</template>
			<button @click="paste" :disabled="!hasClipboardContent">Paste</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { isWebPSupported } from '@/asset-manager';
import { ICreateCharacterAction } from '@/store/objectTypes/characters';
import { ICreateTextBoxAction } from '@/store/objectTypes/textbox';
import { IAssetSwitch, ReplaceContentPackAction } from '@/store/content';
import {
	Character,
	ContentPack,
	Sprite,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { PanelMixin } from './panelMixin';
import DropTarget from '../drop-target.vue';
import DButton from '@/components/ui/d-button.vue';
import { ICreateSpriteAction } from '@/store/objectTypes/sprite';
import { ICreateChoicesAction } from '@/store/objectTypes/choices';
import { ICreateNotificationAction } from '@/store/objectTypes/notification';
import { ICreatePoemAction } from '@/store/objectTypes/poem';
import environment, { Folder } from '@/environments/environment';
import { DeepReadonly } from 'ts-essentials';
import { IPasteFromClipboardAction } from '@/store/objects';
import { IPanel } from '@/store/panels';

const uploadedSpritesPack: ContentPack<string> = {
	packId: 'dddg.buildin.uploadedSprites',
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

export default defineComponent({
	mixins: [PanelMixin],
	components: { DropTarget, DButton },
	data: () => ({
		isWebPSupported: null as boolean | null,
		customAssetCount: 0,
		group: 'characters' as 'characters' | 'sprites' | 'ui',
	}),
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		characters(): DeepReadonly<Array<Character<IAssetSwitch>>> {
			return this.$store.state.content.current.characters;
		},
		sprites(): DeepReadonly<Array<Sprite<IAssetSwitch>>> {
			return this.$store.state.content.current.sprites;
		},
		hasClipboardContent(): boolean {
			return !!this.$store.state.ui.clipboard;
		},
		showSpritesFolder(): boolean {
			return (environment.supports.openableFolders as ReadonlySet<Folder>).has(
				'sprites'
			);
		},
	},
	methods: {
		assetSpriteBackground(sprite: Sprite<IAssetSwitch>) {
			return sprite.variants[0]
				.map((variant) => `url('${variant.lq}')`)
				.join(',');
		},
		assetPath(character: Character<IAssetSwitch>) {
			return character.chibi
				? environment.supports.lq
					? character.chibi.lq
					: character.chibi.hq
				: '';
		},
		showDropTarget(e: DragEvent) {
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
			if (this.group === 'sprites') {
				(this.$refs.spriteDt as any).show();
			}
		},
		hideDropTarget() {
			if (this.group === 'sprites') {
				(this.$refs.spriteDt as any).hide();
			}
		},
		onSpriteFileUpload() {
			const uploadInput = this.$refs.spriteUpload as HTMLInputElement;
			if (!uploadInput.files) return;
			for (const file of uploadInput.files) {
				this.addCustomSpriteFile(file);
			}
		},
		async uploadFromURL() {
			const url = prompt('Enter the URL of the image');
			if (!url) return;
			const lastSegment = url.split('/').slice(-1)[0];
			this.addNewCustomSprite(lastSegment, url);
		},
		async addSpriteToScene(sprite: Sprite<IAssetSwitch>) {
			await this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createSprite', {
					panelId: this.currentPanel.id,
					assets: sprite.variants[0],
				} as ICreateSpriteAction);
			});
		},
		addTextBox() {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createTextBox', {
					panelId: this.currentPanel.id,
				} as ICreateTextBoxAction);
			});
		},
		addChoice() {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createChoice', {
					panelId: this.currentPanel.id,
				} as ICreateChoicesAction);
			});
		},
		addDialog() {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createNotification', {
					panelId: this.currentPanel.id,
				} as ICreateNotificationAction);
			});
		},
		addPoem() {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createPoem', {
					panelId: this.currentPanel.id,
				} as ICreatePoemAction);
			});
		},
		addConsole() {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createConsole', {
					panelId: this.currentPanel.id,
				} as ICreatePoemAction);
			});
		},
		paste() {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/pasteObjectFromClipboard', {
					panelId: this.currentPanel.id,
				} as IPasteFromClipboardAction);
			});
		},
		onChosen(id: string) {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/createCharacters', {
					characterType: id,
					panelId: this.currentPanel.id,
				} as ICreateCharacterAction);
			});
		},
		addCustomSpriteFile(file: File) {
			const url = URL.createObjectURL(file);
			this.addNewCustomSprite(file.name, url);
		},
		addNewCustomSprite(label: string, url: string) {
			uploadedSpritesPack.sprites.push({
				id: url,
				label,
				variants: [[url]],
				defaultScale: [1.0, 1.0],
				hd: null,
			});
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('content/replaceContentPack', {
					contentPack: uploadedSpritesPack,
					processed: false,
				} as ReplaceContentPackAction);
			});
		},
		openSpritesFolder() {
			environment.openFolder('sprites');
		},
	},
	async created() {
		this.isWebPSupported = await isWebPSupported();
	},
});
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
		@include height-100();
		flex-direction: column;
	}

	button {
		flex-grow: 1;

		&.active {
			background: $default-native-background;
			background: var(--native-background);
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
		@include height-100();
		flex-direction: column;
	}

	.character img {
		max-height: 72px;
		max-width: 72px;
	}
}

.item-grid {
	//noinspection CssOverwrittenProperties
	.sprite {
		box-shadow: inset 0 0 1px 3px $default-modal-backdrop;
		box-shadow: inset 0 0 1px 3px var(--modal-backdrop);
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
