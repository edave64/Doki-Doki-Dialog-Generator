<template>
	<div id="panels" :class="{ vertical }">
		<div id="toolbar">
			<button :class="{ active: panel === 'add' }" @click="setPanel('add')">A</button>
			<button :class="{ active: panel === 'backgrounds' }" @click="setPanel('backgrounds')">B</button>
			<button :class="{ active: panel === 'credits' }" @click="setPanel('credits')">C</button>
			<button @click="$emit('download')">D</button>
		</div>
		<keep-alive>
			<general-panel
				v-if="panel === ''"
				:has-prev-render="prevRender !== ''"
				:lqRendering="lqRendering"
				@update:lqRendering="$emit('update:lqRendering', $event)"
				@show-prev-render="$emit('show-prev-render')"
			/>
			<add-panel v-if="panel === 'add'" />
			<backgrounds-panel
				v-if="panel === 'backgrounds'"
				:value="currentBackground"
				@input="$emit('update:currentBackground', $event)"
			/>
			<credits-panel v-if="panel === 'credits'" />
			<character-panel v-if="panel === 'character'" :character="selected" />
			<sprite-panel v-if="panel === 'sprite'" :sprite="selected" />
			<text-box-panel v-if="panel === 'textBox'" :textbox="selected" />
		</keep-alive>
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
import { IObject } from '@/store/objects';
import { IBackground } from '../../models/background';

@Component({
	components: {
		GeneralPanel,
		AddPanel,
		BackgroundsPanel,
		CreditsPanel,
		CharacterPanel,
		TextBoxPanel,
		SpritePanel,
	},
})
export default class ToolBox extends Vue {
	@Prop({ required: true })
	private selected: IObject | null = null;
	@Prop({ required: true, default: '' })
	private prevRender!: string;
	@Prop({ required: true })
	private lqRendering!: boolean;
	@Prop({ required: true })
	private currentBackground: IBackground | null = null;
	private panelSelection: 'add' | 'backgrounds' | 'credits' | 'selection' | '' =
		'';
	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	private get panel() {
		if (this.panelSelection === 'selection') {
			if (this.selected === null) {
				this.panelSelection = '';
			} else {
				return this.selected.type;
			}
		}
		return this.panelSelection;
	}

	private setPanel(name: 'add' | 'backgrounds' | 'credits' | 'selection' | '') {
		if (name === this.panelSelection) name = '';
		this.panelSelection = name;
		if (this.selected) {
			this.$emit('clear-selection');
		}
	}

	@Watch('selected')
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
		width: calc(100vw - 6px);

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
			background-color: #ffe6f4;
			border: 3px solid #ffbde1;

			&.active {
				background: white;
			}
		}
	}
}
</style>
