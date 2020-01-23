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
				:class="{ active: panel === 'credits' }"
				title="Show credits"
				@click="setPanel('credits')"
			>
				<i class="material-icons">subject</i>
			</button>
			<button title="Take a screenshot of the current scene" @click="$emit('download')">
				<i class="material-icons">photo_camera</i>
			</button>
		</div>
		<general-panel
			v-if="panel === ''"
			@show-prev-render="$emit('show-prev-render')"
			@show-content-packs="setPanel('content-packs')"
		/>
		<content-packs-panel v-if="panel === 'content-packs'" />
		<add-panel v-if="panel === 'add'" />
		<backgrounds-panel v-if="panel === 'backgrounds'" />
		<credits-panel v-if="panel === 'credits'" />
		<character-panel v-if="panel === 'character'" />
		<sprite-panel v-if="panel === 'sprite'" />
		<text-box-panel v-if="panel === 'textBox'" />
	</div>
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
// tslint:disable:member-ordering
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class-decorator';

import GeneralPanel from './panels/general.vue';
import AddPanel from './panels/add.vue';
import CharacterPanel from './panels/character.vue';
import SpritePanel from './panels/sprite.vue';
import TextBoxPanel from './panels/textbox.vue';
import CreditsPanel from './panels/credits.vue';
import BackgroundsPanel from './panels/backgrounds.vue';
import ContentPacksPanel from './panels/content-pack.vue';
import { IObject } from '@/store/objects';
import { IBackground } from '@/models/background';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import environment from '@/environments/environment';

type PanelNames =
	| 'add'
	| 'backgrounds'
	| 'credits'
	| 'selection'
	| 'content-packs'
	| '';

@Component({
	components: {
		GeneralPanel,
		AddPanel,
		BackgroundsPanel,
		CreditsPanel,
		CharacterPanel,
		TextBoxPanel,
		SpritePanel,
		ContentPacksPanel,
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

	private panelSelection: PanelNames = '';

	private get panel() {
		if (this.panelSelection === 'selection') {
			if (this.selection === null) {
				this.panelSelection = '';
			} else {
				const obj = this.$store.state.objects.objects[this.selection];
				return obj.type;
			}
		}
		return this.panelSelection;
	}

	private setPanel(name: PanelNames) {
		if (name === this.panelSelection) name = '';
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
			this.panelSelection = '';
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

		#toolbar {
			width: 48px;
			height: 100%;
			float: left;

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

		#toolbar {
			width: calc(100% + 6px);
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
}
</style>
