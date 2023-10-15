<!--
	The toolbox is the set of all the controls next to the preview render. It has multiple tabs that are called tools.
-->
<template>
	<div id="panels" :class="{ vertical }" @scroll="resetScroll" ref="panels">
		<div id="toolbar">
			<button
				:class="{ active: panel === 'add' }"
				@click="setPanel('add')"
				title="Add new objects to the scene"
				aria-label="Add new objects to the scene"
			>
				<i class="material-icons" aria-hidden="true">add_box</i>
				<div class="shortcut-popup">A</div>
			</button>
			<button
				:class="{ active: panel === 'backgrounds' }"
				@click="setPanel('backgrounds')"
				aria-label="Change the current background"
				title="Change the current background"
			>
				<i class="material-icons" aria-hidden="true">panorama</i>
				<div class="shortcut-popup">S</div>
			</button>
			<button
				:class="{ active: panel === 'panels' }"
				title="Panels"
				aria-label="Panels"
				@click="setPanel('panels')"
			>
				<i class="material-icons" aria-hidden="true">view_module</i>
				<div class="shortcut-popup">D</div>
			</button>
			<button
				:class="{ active: panel === 'settings' }"
				title="Settings"
				aria-label="Settings"
				@click="setPanel('settings')"
			>
				<i class="material-icons" aria-hidden="true">settings_applications</i>
				<div class="shortcut-popup">F</div>
			</button>
		</div>
		<settings-panel v-if="panel === 'settings'" />
		<backgrounds-panel
			v-else-if="panel === 'backgrounds'"
			@show-dialog="$emit('show-dialog', $event)"
		/>
		<credits-panel v-else-if="panel === 'help_credits'" />
		<character-panel
			v-else-if="panel === 'character'"
			@show-dialog="$emit('show-dialog', $event)"
			@show-expression-dialog="$emit('show-expression-dialog', $event)"
		/>
		<sprite-panel v-else-if="panel === 'sprite'" />
		<text-box-panel v-else-if="panel === 'textBox'" />
		<choice-panel v-else-if="panel === 'choice'" />
		<panels-panel v-else-if="panel === 'panels'" />
		<notification-panel v-else-if="panel === 'notification'" />
		<poem-panel v-else-if="panel === 'poem'" />
		<add-panel v-else @show-dialog="$emit('show-dialog', $event)" />
		<div id="toolbar-end">
			<button
				:class="{ active: panel === 'help_credits' }"
				@click="setPanel('help_credits')"
				title="Help &amp; Credits"
				aria-label="Help &amp; Credits"
			>
				<i class="material-icons" aria-hidden="true">help</i>
			</button>
			<button
				:class="{ active: panel === 'packs' }"
				@click="$emit('show-dialog')"
				title="Content packs"
				aria-label="Content packs"
			>
				<i class="material-icons" aria-hidden="true">extension</i>
			</button>
			<button
				@click="$emit('show-prev-render')"
				title="Show last downloaded panel"
				aria-label="Show last downloaded panel"
				:disabled="!hasPrevRender"
			>
				<i class="material-icons" aria-hidden="true">flip_to_back</i>
			</button>
			<button
				title="Take a screenshot of the current scene"
				aria-label="Take a screenshot of the current scene"
				@click="$emit('download')"
			>
				<i class="material-icons" aria-hidden="true">photo_camera</i>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import environment from '@/environments/environment';
import { IObject, ObjectTypes } from '@/store/objects';
import { IPanel } from '@/store/panels';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent } from 'vue';
import AddPanel from './tools/add.vue';
import BackgroundsPanel from './tools/backgrounds.vue';
import CharacterPanel from './tools/character.vue';
import ChoicePanel from './tools/choice.vue';
import CreditsPanel from './tools/credits.vue';
import NotificationPanel from './tools/notification.vue';
import PanelsPanel from './tools/panels.vue';
import PoemPanel from './tools/poem.vue';
import SettingsPanel from './tools/settings.vue';
import SpritePanel from './tools/sprite.vue';
import TextBoxPanel from './tools/textbox.vue';

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

const ToolKeybindings: { [key: string]: PanelNames | undefined } = {
	a: 'add',
	s: 'backgrounds',
	d: 'panels',
	f: 'settings',
};

export default defineComponent({
	components: {
		SettingsPanel,
		AddPanel,
		BackgroundsPanel,
		CreditsPanel,
		CharacterPanel,
		TextBoxPanel,
		ChoicePanel,
		SpritePanel,
		PanelsPanel,
		NotificationPanel,
		PoemPanel,
	},
	data: () => ({
		panelSelection: 'add' as PanelNames,
	}),
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
		selection(): IObject['id'] | null {
			return this.$store.state.ui.selection;
		},
		panel(): PanelNames | ObjectTypes {
			if (this.panelSelection === 'selection') {
				if (this.selection === null) {
					// eslint-disable-next-line vue/no-side-effects-in-computed-properties
					this.panelSelection = 'add';
				} else {
					return this.currentPanel.objects[this.selection].type;
				}
			}
			return this.panelSelection;
		},
		hasPrevRender(): boolean {
			return this.$store.state.ui.lastDownload !== null;
		},
	},
	methods: {
		setPanel(name: PanelNames) {
			if (name === this.panelSelection) name = 'add';
			this.panelSelection = name;
			if (this.selection !== null) {
				this.$store.commit('ui/setSelection', null);
			}
		},
		resetScroll() {
			console.log('resetting scrolls');
			if (this.$refs.panels instanceof HTMLElement) {
				this.$refs.panels.scrollTop = 0;
				this.$refs.panels.scrollLeft = 0;
			}
		},
		onKeydown(e: KeyboardEvent) {
			if (e.ctrlKey) {
				const newPanel = ToolKeybindings[e.key];
				if (newPanel) {
					this.setPanel(newPanel);
					e.preventDefault();
					e.stopPropagation();
				}
			}
		},
	},
	watch: {
		selection(newSelection: IObject | null) {
			if (newSelection != null) {
				this.panelSelection = 'selection';
				return;
			}
			if (this.panelSelection === 'selection') {
				this.panelSelection = 'add';
			}
		},
	},
	created() {
		environment.onPanelChange((panel: string) => {
			this.panelSelection = panel as PanelNames;
		});
		window.removeEventListener('keydown', this.onKeydown);
		window.addEventListener('keydown', this.onKeydown);
	},
});
</script>

<style lang="scss">
#panels {
	position: fixed;
	//noinspection CssOverwrittenProperties
	background-color: $default-native-background;
	//noinspection CssOverwrittenProperties
	background-color: var(--native-background);
	border: 3px solid $default-border;
	//noinspection CssOverwrittenProperties
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
					border-right-color: $default-native-background;
					border-right-color: var(--native-background);
				}
			}
		}

		#toolbar-end {
			button {
				border-right: none;

				&.active {
					border-left-color: $default-native-background;
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
					border-bottom-color: $default-native-background;
					border-bottom-color: var(--native-background);
				}
			}
		}

		#toolbar-end {
			button {
				border-bottom: none;

				&.active {
					border-top-color: $default-native-background;
					border-top-color: var(--native-background);
				}
			}
		}
	}

	#toolbar button,
	#toolbar-end button {
		outline: 0;
		//noinspection CssOverwrittenProperties
		background-color: $default-accent-background;
		//noinspection CssOverwrittenProperties
		background-color: var(--accent-background);
		border: 3px solid $default-border;
		//noinspection CssOverwrittenProperties
		border: 3px solid var(--border);
		position: relative;

		i {
			vertical-align: sub;
		}

		&.active {
			background: $default-native-background;
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
