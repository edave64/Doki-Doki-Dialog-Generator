<!--
	The toolbox is the set of all the controls next to the preview render. It has multiple tabs that are called tools.
-->
<template>
	<div id="tools" :class="{ vertical }" @scroll="resetScroll" ref="tools">
		<div id="toolbar">
			<d-button
				icon="add_box"
				icon-pos="top"
				:class="{ active: tool === 'add' }"
				title="Add new objects to the scene"
				shortcut="a"
				@click="setPanel('add')"
			/>
			<d-button
				icon="panorama"
				icon-pos="top"
				:class="{ active: tool === 'backgrounds' }"
				title="Change the current background"
				shortcut="s"
				@click="setPanel('backgrounds')"
			/>
			<d-button
				icon="view_module"
				icon-pos="top"
				:class="{ active: tool === 'panels' }"
				title="Panels"
				shortcut="d"
				@click="setPanel('panels')"
			/>
			<d-button
				icon="settings_applications"
				icon-pos="top"
				:class="{ active: tool === 'settings' }"
				title="Settings"
				shortcut="f"
				@click="setPanel('settings')"
			/>
			<d-button
				icon="help"
				icon-pos="top"
				:class="{ active: tool === 'help_credits' }"
				title="Help &amp; Credits"
				shortcut="h"
				@click="setPanel('help_credits')"
			/>
			<div id="toolbar-spacer"></div>
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
		<app-settings v-if="tool === 'settings'" />
		<backgrounds-tool
			v-else-if="tool === 'backgrounds'"
			@show-dialog="emit('show-dialog', $event)"
		/>
		<app-credits v-else-if="tool === 'help_credits'" />
		<character-tool
			v-else-if="tool === 'character'"
			@show-dialog="emit('show-dialog', $event)"
			@show-expression-dialog="emit('show-expression-dialog', $event)"
		/>
		<sprite-tool v-else-if="tool === 'sprite'" />
		<textbox-tool v-else-if="tool === 'textBox'" />
		<choice-tool v-else-if="tool === 'choice'" />
		<panels-tool v-else-if="tool === 'panels'" />
		<notification-tool v-else-if="tool === 'notification'" />
		<poem-tool v-else-if="tool === 'poem'" />
		<add-tool v-else @show-dialog="emit('show-dialog', $event)" />
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
const tools = ref(null! as HTMLDivElement);

const panelSelection = ref('add' as PanelNames);

const currentPanel = computed(() => {
	return store.state.panels.panels[viewport.value.currentPanel];
});
const viewport = useViewport();
const vertical = useVertical();
const selection = useSelection();
const tool = computed((): PanelNames | ObjectTypes => {
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
	if (isHTMLElement(tools.value)) {
		tools.value.scrollTop = 0;
		tools.value.scrollLeft = 0;
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
#tools {
	--button-size: 42px;
	--tool-size: 192px;

	position: fixed;
	background-color: var(--native-background);
	display: flex;

	.panel {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		padding: 4px;
	}

	#toolbar {
		display: flex;

		button {
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

		#toolbar-spacer {
			flex-grow: 1;
		}
	}

	&:not(.vertical) {
		flex-direction: column;
		left: 0;
		bottom: 0;
		height: calc(var(--tool-size) + var(--button-size));
		width: 100vw;

		.panel {
			border-top: 0;
			flex-wrap: wrap;
			align-content: flex-start;
			overflow-x: auto;
			overflow-y: hidden;
			height: 192px;

			> * {
				margin-right: 8px;
			}
		}

		#toolbar {
			width: 100%;
			height: var(--button-size);
			flex-direction: row;

			button {
				flex-grow: 0;
				width: var(--button-size);
				border-right: 0;

				::after {
					/* To prevent the toolbox border being cut off by other button border, we put another one on top */
					content: ' ';
					position: absolute;
					height: 3px;
					left: -3px;
					right: -3px;
					bottom: -3px;
					border-bottom: 3px solid var(--toolbox-border);
					z-index: 1;
				}

				&:first-child {
					border-left: 0;
					padding-left: 3px;
				}

				&:last-child {
					border-bottom: 3px solid var(--border);
				}

				&.active {
					padding-bottom: 3px;
					border-color: var(--toolbox-border);
					border-bottom: none;
					::after {
						right: none;
						top: -6px;
					}
				}
			}

			button + #toolbar-spacer {
				border-left: 3px solid var(--border);
			}

			button.active + #toolbar-spacer,
			button.active + button {
				border-left-color: var(--toolbox-border);
			}

			#toolbar-spacer {
				border-bottom: 3px solid var(--toolbox-border);
				border-top: 3px solid var(--border);
			}
		}

		h1 {
			writing-mode: vertical-rl;
			height: 100%;
			width: min-content;
		}
	}

	&.vertical {
		flex-direction: row;
		top: 0;
		right: 0;
		height: 100%;
		width: 234px;
		border-top-left-radius: 16px;
		border-bottom-left-radius: 16px;

		.panel {
			border-left: 0;
			overflow-x: hidden;
			overflow-y: auto;
			width: 192px;
			> * {
				flex-shrink: 0;
			}
		}

		#toolbar {
			width: var(--button-size) !important;
			height: 100%;
			display: flex;
			flex-direction: column;
			overflow: visible;

			button {
				height: var(--button-size) !important;
				flex-shrink: 0;
				border-bottom: none;
				border-right-color: var(--toolbox-border);
				position: relative;

				::after {
					/* To prevent the toolbox border being cut off by other button border, we put another one on top */
					content: ' ';
					width: 3px;
					top: -3px;
					bottom: -3px;
					position: absolute;
					right: -3px;
					border-right: 3px solid var(--toolbox-border);
					z-index: 1;
				}

				&:first-child {
					border-top: 0;
					padding-top: 3px;
				}

				&.active {
					padding-right: 3px;
					border-color: var(--toolbox-border);
					border-right: none;
					::after {
						right: none;
						left: -6px;
					}
				}
			}

			button + #toolbar-spacer {
				border-top: 3px solid var(--border);
			}

			button.active + #toolbar-spacer,
			button.active + button {
				border-top-color: var(--toolbox-border);
			}

			#toolbar-spacer {
				border-right: 3px solid var(--toolbox-border);
				border-left: 3px solid var(--border);
			}
		}
	}
}

#toolbar-spacer {
	min-height: 8px;
	min-width: 8px;
}

h1,
label {
	user-select: none;
}
</style>
