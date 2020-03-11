<template>
	<div class="panel">
		<h1>Choice</h1>
		<text-editor
			v-if="textEditor"
			title="Button Text"
			v-model="button_text"
			@leave="textEditor = false"
		/>
		<template v-else>
			<fieldset class="buttons">
				<legend>Buttons:</legend>
				<div class="list">
					<div
						v-for="(button, btnIdx) in buttons"
						:class="{ active: btnIdx === currentIdx }"
						:key="btnIdx"
						@click="select(btnIdx)"
					>{{ (button.text.trim() === '') ? '[Empty]' : button.text }}</div>
				</div>
			</fieldset>
			<fieldset class="current_button">
				<legend>Current button:</legend>
				<table>
					<tr>
						<td colspan="2">
							<label for="choice-button-input">Text</label>
						</td>
					</tr>
					<tr>
						<td>
							<input id="choice-button-input" v-model="button_text" @keydown.stop />
						</td>
						<td>
							<button @click="textEditor = true">...</button>
						</td>
					</tr>
				</table>
			</fieldset>
			<button @click="addChoice">Add</button>
			<button @click="removeChoice">Remove</button>
			<position-and-size :obj="sprite" />
			<layers :obj="sprite" />
			<opacity :obj="sprite" />
			<toggle v-model="flip" label="Flip?" />
			<delete :obj="sprite" />
		</template>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { isWebPSupported } from '@/asset-manager';
import { Character } from '@/renderables/character';
import Toggle from '@/components/toggle.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Opacity from '@/components/toolbox/commonsFieldsets/opacity.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import { IRenderable } from '@/renderables/renderable';
import { Sprite } from '@/renderables/sprite';
import { ISprite } from '@/store/objectTypes/sprite';
import { ICommand } from '@/eventbus/command';
import eventBus from '@/eventbus/event-bus';
import { IHistorySupport } from '@/plugins/vuex-history';
import {
	IObjectSetOnTopAction,
	ISetObjectFlipMutation,
	ISetObjectPositionMutation,
	ISetObjectOpacityMutation,
	IObjectShiftLayerAction,
} from '@/store/objects';
import { PanelMixin } from './panelMixin';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import {
	IChoices,
	IRemoveChoiceAction,
} from '../../../store/objectTypes/choices';
import {
	IChoice,
	IAddChoiceAction,
	ISetChoiceTextAction,
} from '../../../store/objectTypes/choices';
import { DeepReadonly } from '../../../util/readonly';
import TextEditor from '../subpanels/text/text.vue';

@Component({
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Opacity,
		Delete,
		TextEditor,
	},
})
export default class ChoicePanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;

	private vuexHistory!: IHistorySupport;
	private currentIdx: number = 0;
	private textEditor: boolean = false;

	private get sprite(): IChoices {
		const obj = this.$store.state.objects.objects[
			this.$store.state.ui.selection!
		];
		if (obj.type !== 'choice') return undefined!;
		return obj as IChoices;
	}

	private get flip() {
		return this.sprite.flip;
	}

	private set flip(newValue: boolean) {
		this.vuexHistory.transaction(() => {
			this.$store.commit('objects/setFlip', {
				id: this.sprite.id,
				flip: newValue,
			} as ISetObjectFlipMutation);
		});
	}

	private get button_text() {
		return this.sprite.choices[this.currentIdx].text;
	}

	private set button_text(newValue: string) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setChoiceText', {
				id: this.sprite.id,
				choiceIdx: this.currentIdx,
				text: newValue,
			} as ISetChoiceTextAction);
		});
	}

	private select(idx: number): void {
		this.currentIdx = idx;
	}

	private get buttons(): DeepReadonly<IChoice[]> {
		return this.sprite.choices;
	}

	private addChoice(): void {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/addChoice', {
				id: this.sprite.id,
				text: '',
			} as IAddChoiceAction);
		});
	}

	private removeChoice(): void {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/removeChoise', {
				id: this.sprite.id,
				choiceIdx: this.currentIdx,
			} as IRemoveChoiceAction);
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
	> .list {
		* {
			overflow: hidden;
			width: 100%;
			height: 24px;
			text-overflow: ellipsis;
			padding: 2px;

			&.active {
				background-color: #ffbde1;
			}
		}
	}
}

.current_button {
	input {
		width: 145px;
	}
}

.panel.vertical {
	fieldset.buttons {
		width: 100%;

		> .list {
			max-height: 200px;
			width: 172px;

			* {
				width: 100%;
				text-overflow: ellipsis;
				padding: 2px;
			}
		}
	}
}

.panel:not(.vertical) {
	.list {
		max-height: 140px;
		max-width: 172px;
	}
}
</style>
