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
			<button :class="{ active: panel === 'panels' }" title="Panels" @click="setPanel('panels')">
				<i class="material-icons">view_module</i>
			</button>
			<button :class="{ active: panel === 'settings' }" title="Settings" @click="setPanel('settings')">
				<i class="material-icons">settings_applications</i>
			</button>
		</div>
		<settings-panel v-if="panel === 'settings'" />
		<content-packs-panel v-else-if="panel === 'packs'" />
		<backgrounds-panel v-else-if="panel === 'backgrounds'" />
		<credits-panel v-else-if="panel === 'help_credits'" />
		<character-panel v-else-if="panel === 'character'" />
		<sprite-panel v-else-if="panel === 'sprite'" />
		<text-box-panel v-else-if="panel === 'textBox'" />
		<panels-panel v-else-if="panel === 'panels'" />
		<add-panel v-else />
		<div id="toolbar-end">
			<button
				:class="{ active: panel === 'help_credits' }"
				@click="setPanel('help_credits')"
				title="Help &amp; Credits"
			>
				<i class="material-icons">help</i>
			</button>
			<button :class="{ active: panel === 'packs' }" @click="setPanel('packs')" title="Content packs">
				<i class="material-icons">extension</i>
			</button>
			<button
				@click="$emit('show-prev-render')"
				title="Show last downloaded panel"
				:disabled="!hasPrevRender"
			>
				<i class="material-icons">flip_to_back</i>
			</button>
			<button title="Take a screenshot of the current scene" @click="$emit('download')">
				<i class="material-icons">photo_camera</i>
			</button>
		</div>
	</div>
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
// tslint:disable:member-ordering
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';

import SettingsPanel from './panels/settings.vue';
import AddPanel from './panels/add.vue';
import CharacterPanel from './panels/character.vue';
import SpritePanel from './panels/sprite.vue';
import TextBoxPanel from './panels/textbox.vue';
import CreditsPanel from './panels/credits.vue';
import BackgroundsPanel from './panels/backgrounds.vue';
import ContentPacksPanel from './panels/content-pack.vue';
import PanelsPanel from './panels/panels.vue';
import { IObject } from '@/store/objects';
import { IBackground } from '@/models/background';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import environment from '@/environments/environment';

type PanelNames =
	| 'add'
	| 'backgrounds'
	| 'help_credits'
	| 'selection'
	| 'packs'
	| 'settings'
	| 'panels';

@Component({
	components: {
		SettingsPanel,
		AddPanel,
		BackgroundsPanel,
		CreditsPanel,
		CharacterPanel,
		TextBoxPanel,
		SpritePanel,
		ContentPacksPanel,
		PanelsPanel,
	},
})
export default class ToolBox extends Vue {
	public $store!: Store<IRootState>;

	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	private create() {
		environment.onPanelChange((panel: string) => {
			this.panelSelection = panel as PanelNames;
		});
	}

	private get selection(): string | null {
		return this.$store.state.ui.selection;
	}

	private panelSelection: PanelNames = 'add';

	private get panel() {
		if (this.panelSelection === 'selection') {
			if (this.selection === null) {
				this.panelSelection = 'add';
			} else {
				const obj = this.$store.state.objects.objects[this.selection];
				return obj.type;
			}
		}
		return this.panelSelection;
	}

	private get hasPrevRender(): boolean {
		return this.$store.state.ui.lastDownload !== null;
	}

	private setPanel(name: PanelNames) {
		if (name === this.panelSelection) name = 'add';
		this.panelSelection = name;
		if (this.selection) {
			this.$store.commit('ui/setSelection', null);
		}
	}

	@Watch('selection')
	private onSelectionChange(newSelection: IObject | null) {
		if (newSelection) {
			this.panelSelection = 'selection';
			return;
		}
		if (this.panelSelection === 'selection') {
			this.panelSelection = 'add';
		}
	}
}
</script>

<style lang="scss">
#panels {
	background-color: #ffffff;
	border: 3px solid #ffbde1;
	position: absolute;
	display: flex;

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
