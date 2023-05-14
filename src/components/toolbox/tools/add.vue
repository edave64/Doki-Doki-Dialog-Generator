<!--
	A tab allowing you to add characters, sprites or ui objects to the scene.
-->
<template>
	<div class="panel">
		<h1>Add</h1>
		<div :class="{ 'group-selector': true, vertical }">
			<d-button
				v-for="(obj, key) in groups"
				:key="key"
				:class="{ active: group === key }"
				icon-pos="top"
				:icon="obj.icon"
				@click="group = key"
			>
				<span v-html="obj.text" />
			</d-button>
		</div>
		<div :class="{ 'item-grid': true, vertical }">
			<Characters
				v-if="group === 'characters'"
				@show-dialog="$emit('show-dialog', $event)"
			/>
			<Sprites
				v-else-if="group === 'sprites'"
				@show-dialog="$emit('show-dialog', $event)"
			/>
			<UI v-else-if="group === 'ui'" />
			<button @click="paste" :disabled="!hasClipboardContent">Paste</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PanelMixin } from './panelMixin';
import DButton from '@/components/ui/d-button.vue';
import environment, { Folder } from '@/environments/environment';
import { DeepReadonly } from 'ts-essentials';
import { IPasteFromClipboardAction } from '@/store/objects';
import { IPanel } from '@/store/panels';
import Characters from './add/character.vue';
import Sprites from './add/sprite.vue';
import UI from './add/ui.vue';

type GroupNames = 'characters' | 'sprites' | 'ui';
interface Group {
	icon: string;
	text: string;
}

export default defineComponent({
	mixins: [PanelMixin],
	components: { DButton, Characters, Sprites, UI },
	data: () => ({
		group: 'characters' as GroupNames,
		groups: {
			characters: {
				icon: 'emoji_people',
				text: 'Char&shy;acters',
			},
			sprites: {
				icon: 'change_history',
				text: 'Sprites',
			},
			ui: {
				icon: 'view_quilt',
				text: 'UI',
			},
		} as { [P in GroupNames]: Group },
	}),
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		hasClipboardContent(): boolean {
			return this.$store.state.ui.clipboard != null;
		},
		showSpritesFolder(): boolean {
			return (environment.supports.openableFolders as ReadonlySet<Folder>).has(
				'sprites'
			);
		},
	},
	methods: {
		paste() {
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/pasteObjectFromClipboard', {
					panelId: this.currentPanel.id,
				} as IPasteFromClipboardAction);
			});
		},
	},
});
</script>

<style lang="scss" scoped>
#panels {
	&:not(.vertical) .panel {
		justify-content: center;
	}
}

.panel {
	flex-wrap: nowrap;
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

		:deep(button) {
			width: 100%;
		}
	}

	&:not(.vertical) {
		margin-left: 4px;
		@include height-100();
		flex-direction: column;
	}
}
</style>
