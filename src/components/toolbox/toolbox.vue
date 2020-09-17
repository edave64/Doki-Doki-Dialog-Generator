<template>
	<div id="panels" :class="{ vertical }">
		<div id="toolbar">
			<button
				:class="{ active: panel === 'add' }"
				@click="setPanel('add')"
				title="Add new objects to the scene"
			>
				<i class="material-icons">add_box</i>
			</button>
			<button
				:class="{ active: panel === 'backgrounds' }"
				@click="setPanel('backgrounds')"
				title="Change the current background"
			>
				<i class="material-icons">panorama</i>
			</button>
			<button
				:class="{ active: panel === 'panels' }"
				title="Panels"
				@click="setPanel('panels')"
			>
				<i class="material-icons">view_module</i>
			</button>
			<button
				:class="{ active: panel === 'settings' }"
				title="Settings"
				@click="setPanel('settings')"
			>
				<i class="material-icons">settings_applications</i>
			</button>
		</div>
		<settings-panel v-if="panel === 'settings'" />
		<content-packs-panel v-else-if="panel === 'packs'" />
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
			>
				<i class="material-icons">help</i>
			</button>
			<button
				:class="{ active: panel === 'packs' }"
				@click="$emit('show-dialog')"
				title="Content packs"
			>
				<i class="material-icons">extension</i>
			</button>
			<button
				@click="$emit('show-prev-render')"
				title="Show last downloaded panel"
				:disabled="!hasPrevRender"
			>
				<i class="material-icons">flip_to_back</i>
			</button>
			<button
				title="Take a screenshot of the current scene"
				@click="$emit('download')"
			>
				<i class="material-icons">photo_camera</i>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import SettingsPanel from './tools/settings.vue';
import AddPanel from './tools/add.vue';
import CharacterPanel from './tools/character.vue';
import SpritePanel from './tools/sprite.vue';
import TextBoxPanel from './tools/textbox.vue';
import ChoicePanel from './tools/choice.vue';
import CreditsPanel from './tools/credits.vue';
import BackgroundsPanel from './tools/backgrounds.vue';
import ContentPacksPanel from './tools/content-pack.vue';
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
		ContentPacksPanel,
		PanelsPanel,
		NotificationPanel,
		PoemPanel,
	},
	data: () => ({
		panelSelection: 'add' as PanelNames,
	}),
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
		selection(): string | null {
			return this.$store.state.ui.selection;
		},
		panel(): PanelNames | ObjectTypes {
			if (this.panelSelection === 'selection') {
				if (this.selection === null) {
					// eslint-disable-next-line vue/no-side-effects-in-computed-properties
					this.panelSelection = 'add';
				} else {
					const obj = this.$store.state.objects.objects[this.selection];
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
	},
	watch: {
		selection(newSelection: IObject | null) {
			if (newSelection) {
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
	background-color: #ffffff;
	border: 3px solid #ffbde1;
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
					border-bottom: 3px solid #ffbde1;
				}

				&.active {
					border-right: 3px solid white;
				}
			}
		}

		#toolbar-end {
			button {
				border-bottom: none;
				&:nth-child(4) {
					border-top: 3px solid #ffbde1;
				}

				&.active {
					border-left: 3px solid white;
				}
			}
		}

		h1 {
			writing-mode: vertical-rl;
			height: 100%;
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
		}

		#toolbar,
		#toolbar-end {
			width: calc(100% + 6px);
		}

		#toolbar {
			button {
				border-right: none;
				&:nth-child(4) {
					border-right: 3px solid #ffbde1;
				}

				&.active {
					border-bottom: 3px solid white;
				}
			}
		}

		#toolbar-end {
			margin-bottom: -3px;
			button {
				border-left: none;

				&:nth-child(4) {
					border-right: 3px solid #ffbde1;
				}

				&.active {
					border-top: 3px solid white;
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
			background-color: #ffe6f4;
			border: 3px solid #ffbde1;

			i {
				vertical-align: sub;
			}

			&.active {
				background: white;
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
			background-color: #ffe6f4;
			border: 3px solid #ffbde1;

			i {
				vertical-align: sub;
			}

			&.active {
				background: white;
			}
		}
	}
}
</style>
