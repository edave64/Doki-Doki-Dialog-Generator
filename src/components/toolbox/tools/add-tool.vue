<!--
	A tab allowing you to add characters, sprites or ui objects to the scene.
-->
<template>
	<div
		class="panel"
		ref="root"
		@dragenter="sprites?.showDropTarget"
		@mouseleave="sprites?.hideDropTarget"
	>
		<h1>Add</h1>
		<div :class="{ 'group-selector': true, vertical }">
			<d-button
				v-for="(obj, key) in groups"
				:key="key"
				:class="{
					active: group === key,
					'v-bl0': key !== 'characters',
					'h-bt0': key !== 'characters',
				}"
				icon-pos="top"
				:icon="obj.icon"
				:shortcut="obj.shortcut"
				@click="group = key"
			>
				<span v-html="obj.text" />
			</d-button>
		</div>
		<div :class="{ 'item-grid': true, vertical }">
			<characters-tab
				v-if="group === 'characters'"
				@show-dialog="$emit('show-dialog', $event)"
			/>
			<sprites-tab
				v-else-if="group === 'sprites'"
				ref="sprites"
				@show-dialog="$emit('show-dialog', $event)"
			/>
			<ui-tab v-else-if="group === 'ui'" />
			<button
				class="v-w100"
				@click="paste"
				:disabled="!hasClipboardContent"
			>
				Paste
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import DButton from '@/components/ui/d-button.vue';
import { transaction } from '@/history-engine/transaction';
import { state } from '@/store/root';
import { computed, ref } from 'vue';
import CharactersTab from './add/characters-tab.vue';
import SpritesTab from './add/sprites-tab.vue';
import UiTab from './add/ui-tab.vue';

type GroupNames = 'characters' | 'sprites' | 'ui';
interface Group {
	icon: string;
	text: string;
	shortcut: string;
}

const groups = {
	characters: {
		icon: 'emoji_people',
		text: 'Char&shy;acters',
		shortcut: '1',
	},
	sprites: {
		icon: 'change_history',
		text: 'Sprites',
		shortcut: '2',
	},
	ui: {
		icon: 'view_quilt',
		text: 'UI',
		shortcut: '3',
	},
} as { [P in GroupNames]: Group };

const root = ref(null! as HTMLElement);
const group = ref('characters' as GroupNames);
const sprites = ref(null! as typeof SpritesTab | null);
const { vertical } = setupPanelMixin(root);
//const viewport = useViewport();

const hasClipboardContent = computed(() => {
	return state.ui.clipboard != null;
});

function paste() {
	transaction(async () => {
		// TODO: Fix this
		/*
		await store.dispatch('panels/pasteObjectFromClipboard', {
			panelId: viewport.value.currentPanel,
		} as IPasteFromClipboardAction);
		 */
	});
}
</script>

<style lang="scss" scoped>
@use '@/styles/fixes.scss';

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
		@include fixes.height-100();
		flex-direction: column;
	}

	button {
		flex-grow: 1;

		&.active {
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
	}

	&:not(.vertical) {
		margin-left: 4px;
		@include fixes.height-100();
		flex-direction: column;
	}
}
</style>
