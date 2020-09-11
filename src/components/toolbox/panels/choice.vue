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
					>
						{{ button.text.trim() === '' ? '[Empty]' : button.text }}
					</div>
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
							<input
								id="choice-button-input"
								v-model="button_text"
								@keydown.stop
							/>
						</td>
						<td>
							<button @click="textEditor = true">...</button>
						</td>
					</tr>
				</table>
			</fieldset>
			<button @click="addChoice">Add</button>
			<button @click="removeChoice">Remove</button>
			<toggle label="Auto line wrap?" v-model="autoWrap" />
			<position-and-size :obj="object" />
			<layers :obj="object" />
			<opacity :obj="object" />
			<toggle v-model="flip" label="Flip?" />
			<delete :obj="object" />
		</template>
	</div>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Opacity from '@/components/toolbox/commonsFieldsets/opacity.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import { PanelMixin } from './panelMixin';
import { IChoices, IRemoveChoiceAction } from '@/store/objectTypes/choices';
import { IChoice, IAddChoiceAction } from '@/store/objectTypes/choices';
import { DeepReadonly } from '@/util/readonly';
import TextEditor from '../subpanels/text/text.vue';
import { ComponentCustomProperties, defineComponent } from 'vue';
import { genericSetable } from '@/util/simpleSettable';

const setable = genericSetable<IChoices>();

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Opacity,
		Delete,
		TextEditor,
	},
	data: () => ({
		currentIdx: 0,
		textEditor: false,
	}),
	computed: {
		object(): IChoices {
			const obj = this.$store.state.objects.objects[
				this.$store.state.ui.selection!
			];
			if (obj.type !== 'choice') return undefined!;
			return obj as IChoices;
		},
		flip: setable('flip', 'objects/setFlip'),
		autoWrap: setable('autoWrap', 'objects/setAutoWrapping'),
		// eslint-disable-next-line @typescript-eslint/camelcase
		button_text: simpleButtonSettable('text', 'objects/setChoiceText'),
		buttons(): DeepReadonly<IChoice[]> {
			return this.object.choices;
		},
	},
	methods: {
		select(idx: number): void {
			this.currentIdx = idx;
		},
		addChoice(): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('objects/addChoice', {
					id: this.object.id,
					text: '',
				} as IAddChoiceAction);
			});
		},
		removeChoice(): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('objects/removeChoise', {
					id: this.object.id,
					choiceIdx: this.currentIdx,
				} as IRemoveChoiceAction);
			});
		},
	},
});

function simpleButtonSettable<K extends keyof IChoice>(
	key: K,
	message: string
) {
	return {
		get(this: IThis): IChoice[K] {
			return this.object.choices[this.currentIdx][key];
		},
		set(this: IThis, val: IChoice[K]): void {
			this.vuexHistory.transaction(() => {
				this.$store.commit(message, {
					id: this.object.id,
					choiceIdx: this.currentIdx,
					[key]: val,
				});
			});
		},
	};
}

interface IThis extends ComponentCustomProperties {
	object: IChoices;
	currentIdx: number;
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
