<!--
	The toolbox is the set of all the controls next to the preview render. It has multiple tabs that are called tools.
-->
<template>
	<div id="panels" :class="{ vertical }" @scroll="resetScroll" ref="panels">
		<div id="toolbar">
			<d-button
				icon="add_box"
				icon-pos="top"
				:class="{ active: panel === 'add' }"
				title="Add new objects to the scene"
				shortcut="a"
				@click="setPanel('add')"
			/>
			<d-button
				icon="panorama"
				icon-pos="top"
				:class="{ active: panel === 'backgrounds' }"
				title="Change the current background"
				shortcut="s"
				@click="setPanel('backgrounds')"
			/>
			<d-button
				icon="view_module"
				icon-pos="top"
				:class="{ active: panel === 'panels' }"
				title="Panels"
				shortcut="d"
				@click="setPanel('panels')"
			/>
			<d-button
				icon="settings_applications"
				icon-pos="top"
				:class="{ active: panel === 'settings' }"
				title="Settings"
				shortcut="f"
				@click="setPanel('settings')"
			/>
		</div>
		<app-settings v-if="panel === 'settings'" />
		<backgrounds-tool
			v-else-if="panel === 'backgrounds'"
			@show-dialog="emit('show-dialog', $event)"
		/>
		<app-credits v-else-if="panel === 'help_credits'" />
		<character-tool
			v-else-if="panel === 'character'"
			@show-dialog="emit('show-dialog', $event)"
			@show-expression-dialog="emit('show-expression-dialog', $event)"
		/>
		<sprite-tool v-else-if="panel === 'sprite'" />
		<textbox-tool v-else-if="panel === 'textBox'" />
		<choice-tool v-else-if="panel === 'choice'" />
		<panels-tool v-else-if="panel === 'panels'" />
		<notification-tool v-else-if="panel === 'notification'" />
		<poem-tool v-else-if="panel === 'poem'" />
		<add-tool v-else @show-dialog="emit('show-dialog', $event)" />
		<div id="toolbar-end">
			<d-button
				icon="help"
				icon-pos="top"
				:class="{ active: panel === 'help_credits' }"
				title="Help &amp; Credits"
				shortcut="h"
				@click="setPanel('help_credits')"
			/>
			<d-button
				icon="extension"
				icon-pos="top"
				title="Content Packs"
				shortcut="p"
				@click="emit('show-dialog')"
			/>
			<d-button
				icon="flip_to_back"
				icon-pos="top"
				title="Show last downloaded panel"
				shortcut="l"
				@click="emit('show-prev-render')"
				:disabled="!hasPrevRender"
			/>
			<d-button
				icon="photo_camera"
				icon-pos="top"
				title="Take a screenshot of the current scene"
				shortcut="i"
				@click="emit('download')"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import environment from '@/environments/environment';
import { useSelection, useVertical, useViewport } from '@/hooks/use-viewport';
import { useStore } from '@/store';
import { type ObjectTypes } from '@/store/objects';
import { isHTMLElement } from '@/util/cross-realm';
import { computed, ref, watch } from 'vue';
import DButton from '../ui/d-button.vue';
import AddTool from './tools/add-tool.vue';
import AppCredits from './tools/app-credits.vue';
import AppSettings from './tools/app-settings.vue';
import BackgroundsTool from './tools/backgrounds-tool.vue';
import CharacterTool from './tools/character-tool.vue';
import ChoiceTool from './tools/choice-tool.vue';
import NotificationTool from './tools/notification-tool.vue';
import PanelsTool from './tools/panels-tool.vue';
import PoemTool from './tools/poem-tool.vue';
import SpriteTool from './tools/sprite-tool.vue';
import TextboxTool from './tools/textbox-tool.vue';

type PanelNames =
	| 'add'
	| 'backgrounds'
	| 'help_credits'
	| 'selection'
	| 'packs'
	| 'settings'
	| 'panels'
	| 'notification'
	| 'poem';

const emit = defineEmits<{
	'show-dialog': [search?: string];
	'show-prev-render': [];
	download: [];
	'show-expression-dialog': [settings: { character: string }];
}>();

const store = useStore();
const panels = ref(null! as HTMLDivElement);

const panelSelection = ref('add' as PanelNames);

const currentPanel = computed(() => {
	return store.state.panels.panels[store.state.panels.currentPanel];
});
const viewport = useViewport();
const vertical = useVertical();
const selection = useSelection();
const panel = computed((): PanelNames | ObjectTypes => {
	if (panelSelection.value === 'selection') {
		if (selection.value === null) {
			// eslint-disable-next-line vue/no-side-effects-in-computed-properties
			panelSelection.value = 'add';
		} else {
			return currentPanel.value.objects[selection.value].type;
		}
	}
	return panelSelection.value;
});
const hasPrevRender = computed(() => store.state.ui.lastDownload !== null);
function setPanel(name: PanelNames) {
	if (name === panelSelection.value) name = 'add';
	panelSelection.value = name;
	if (selection.value !== null) {
		viewport.value.selection = null;
	}
}
function resetScroll() {
	if (isHTMLElement(panels.value)) {
		panels.value.scrollTop = 0;
		panels.value.scrollLeft = 0;
	}
}

watch(
	() => selection.value,
	(newSelection) => {
		console.log('selection changed', newSelection);
		if (newSelection != null) {
			panelSelection.value = 'selection';
			return;
		}
		if (panelSelection.value === 'selection') {
			panelSelection.value = 'add';
		}
	}
);
environment.onPanelChange((panel: string) => {
	panelSelection.value = panel as PanelNames;
});
</script>

<style lang="scss">
#panels {
	position: fixed;
	background-color: var(--native-background);
	border: 3px solid var(--border);
	display: flex;
	height: 100%;
	//overflow: hidden;
	.panel {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		padding: 4px;
	}

	&:not(.vertical) {
		flex-direction: row;
		left: 0;
		bottom: 0;
		height: 192px;
		width: 100vw;

		.panel {
			flex-wrap: wrap;
			align-content: flex-start;
			overflow-x: auto;
			overflow-y: hidden;

			> * {
				margin-right: 8px;
			}
		}

		#toolbar,
		#toolbar-end {
			width: 48px;
			min-width: 48px;
			height: 100%;
			display: flex;
			flex-direction: column;

			button {
				flex-grow: 1;
				width: 48px;
				border-bottom: none;

				&:first-child {
					border-top: none;
				}
			}
		}

		#toolbar {
			button {
				border-left: none;

				&.active {
					border-right-color: var(--native-background);
				}
			}
		}

		#toolbar-end {
			button {
				border-right: none;

				&.active {
					border-left-color: var(--native-background);
				}
			}
		}

		h1 {
			writing-mode: vertical-rl;
			height: 100%;
			width: min-content;
		}
	}

	&.vertical {
		flex-direction: column;
		top: 0;
		right: 0;
		height: 100%;
		width: 192px;

		.panel {
			overflow-x: hidden;
			overflow-y: auto;

			> * {
				flex-shrink: 0;
			}
		}

		#toolbar,
		#toolbar-end {
			width: 100%;
			min-height: 48px;
			max-height: 48px;
			display: flex;

			button {
				height: 48px;
				flex-grow: 1;
				border-right: none;

				&:first-child {
					border-left: none;
				}
			}
		}

		#toolbar {
			button {
				border-top: none;

				&.active {
					border-bottom-color: var(--native-background);
				}
			}
		}

		#toolbar-end {
			button {
				border-bottom: none;

				&.active {
					border-top-color: var(--native-background);
				}
			}
		}
	}

	#toolbar button,
	#toolbar-end button {
		outline: 0;
		background-color: var(--accent-background);
		border: 3px solid var(--border);
		position: relative;

		i {
			vertical-align: sub;
		}

		&.active {
			background: var(--native-background);
		}

		&:focus-visible {
			background: #0000ee;
		}
	}
}

h1,
label {
	user-select: none;
}
</style>
