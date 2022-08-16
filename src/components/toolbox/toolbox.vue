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
			</button>
			<button
				:class="{ active: panel === 'backgrounds' }"
				@click="setPanel('backgrounds')"
				aria-label="Change the current background"
				title="Change the current background"
			>
				<i class="material-icons" aria-hidden="true">panorama</i>
			</button>
			<button
				:class="{ active: panel === 'panels' }"
				title="Panels"
				aria-label="Panels"
				@click="setPanel('panels')"
			>
				<i class="material-icons" aria-hidden="true">view_module</i>
			</button>
			<button
				:class="{ active: panel === 'settings' }"
				title="Settings"
				aria-label="Settings"
				@click="setPanel('settings')"
			>
				<i class="material-icons" aria-hidden="true">settings_applications</i>
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
import { IPanel } from '@/store/panels';
import { DeepReadonly } from 'ts-essentials';
import SettingsPanel from './tools/settings.vue';
import AddPanel from './tools/add.vue';
import CharacterPanel from './tools/character.vue';
import SpritePanel from './tools/sprite.vue';
import TextBoxPanel from './tools/textbox.vue';
import ChoicePanel from './tools/choice.vue';
import CreditsPanel from './tools/credits.vue';
import BackgroundsPanel from './tools/backgrounds.vue';
import PanelsPanel from './tools/panels.vue';
import NotificationPanel from './tools/notification.vue';
import PoemPanel from './tools/poem.vue';
import { IObject, ObjectTypes } from '@/store/objects';
import environment from '@/environments/environment';
import { defineComponent } from 'vue';

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
					const obj = this.currentPanel.objects[this.selection];
					return obj.type;
				}
			}
			return this.panelSelection;
		},
		hasPrevRender(): boolean {
			return this.$store.state.ui.lastDownload !== null;
		},
	},
	methods: {
		create() {
			environment.onPanelChange((panel: string) => {
				this.panelSelection = panel as PanelNames;
			});
		},
		setPanel(name: PanelNames) {
			if (name === this.panelSelection) name = 'add';
			this.panelSelection = name;
			if (this.selection) {
				if (this.$store.state.ui.selection === null) return;
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
});
</script>

<style lang="scss">
#panels {
	//noinspection CssOverwrittenProperties
	background-color: $default-native-background;
	//noinspection CssOverwrittenProperties
	background-color: var(--native-background);
	border: 3px solid $default-border;
	//noinspection CssOverwrittenProperties
	border: 3px solid var(--border);
	position: absolute;
	display: flex;
	overflow: hidden;

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
			flex-grow: 1;
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
			height: 100%;
			float: left;
			margin-top: -3px;
		}

		#toolbar {
			button {
				border-bottom: none;

				&:nth-child(4) {
					border: 3px solid $default-border;
					//noinspection CssOverwrittenProperties
					border: 3px solid var(--border);
				}

				&.active {
					border-right: 3px solid $default-native-background;
					border-right: 3px solid var(--native-background);
				}
			}
		}

		#toolbar-end {
			button {
				border-bottom: none;

				&:nth-child(4) {
					border: 3px solid $default-border;
					//noinspection CssOverwrittenProperties
					border: 3px solid var(--border);
				}

				&.active {
					border-left: 3px solid $default-native-background;
					border-left: 3px solid var(--native-background);
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
			width: calc(100% + 6px);
		}

		#toolbar {
			button {
				border-right: none;

				&:nth-child(4) {
					border-right: 3px solid $default-border;
					border-right: 3px solid var(--border);
				}

				&.active {
					border-bottom: 3px solid $default-native-background;
					border-bottom: 3px solid var(--native-background);
				}
			}
		}

		#toolbar-end {
			margin-bottom: -3px;

			button {
				border-left: none;

				&:nth-child(4) {
					border-right: 3px solid $default-border;
					border-right: 3px solid var(--border);
				}

				&.active {
					border-top: 3px solid $default-native-background;
					border-top: 3px solid var(--native-background);
				}
			}
		}
	}

	#toolbar {
		margin-top: -3px;
		margin-left: -3px;

		button {
			outline: 0;
			width: 48px;
			height: 48px;
			line-height: 48px;
			//noinspection CssOverwrittenProperties
			background-color: $default-accent-background;
			//noinspection CssOverwrittenProperties
			background-color: var(--accent-background);
			border: 3px solid $default-border;
			//noinspection CssOverwrittenProperties
			border: 3px solid var(--border);

			i {
				vertical-align: sub;
			}

			&.active {
				background: $default-native-background;
				background: var(--native-background);
			}
		}
	}

	#toolbar-end {
		margin-right: -3px;

		button {
			outline: 0;
			width: 48px;
			height: 48px;
			line-height: 48px;
			//noinspection CssOverwrittenProperties
			background-color: $default-accent-background;
			//noinspection CssOverwrittenProperties
			background-color: var(--accent-background);
			border: 3px solid $default-border;
			//noinspection CssOverwrittenProperties
			border: 3px solid var(--border);

			i {
				vertical-align: sub;
			}

			&.active {
				background: $default-native-background;
				background: var(--native-background);
			}
		}
	}
}

h1,
label {
	user-select: none;
}
</style>
