<template>
	<object-tool :object="object" title="Choice" :textHandler="textHandler">
		<d-fieldset class="buttons" title="Buttons:">
			<d-flow maxSize="100%" direction="vertical" noWraping>
				<div
					v-for="(button, btnIdx) in buttons"
					:class="{ choiceBtn: true, active: btnIdx === currentIdx }"
					:key="btnIdx"
					@click="select(btnIdx)"
				>
					{{ button.text.trim() === '' ? '[Empty]' : button.text }}
				</div>
			</d-flow>
		</d-fieldset>
		<d-fieldset class="current_button" title="Current button:">
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
							v-model="buttonText"
							@keydown.stop
						/>
					</td>
					<td>
						<button @click="textEditor = true">...</button>
					</td>
				</tr>
			</table>
		</d-fieldset>
		<button @click="addChoice">Add</button>
		<button @click="removeChoice">Remove</button>
		<toggle label="Auto line wrap?" v-model="autoWrap" />
	</object-tool>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import { IPanel } from '@/store/panels';
import { PanelMixin } from './panelMixin';
import {
	IAddChoiceAction,
	IChoice,
	IChoices,
	IRemoveChoiceAction,
} from '@/store/objectTypes/choices';
import { DeepReadonly } from 'ts-essentials';
import { ComponentCustomProperties, defineComponent } from 'vue';
import { genericSetable } from '@/util/simpleSettable';
import ObjectTool, { Handler } from './object-tool.vue';

const setable = genericSetable<IChoices>();

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		DFieldset,
		DFlow,
		ObjectTool,
	},
	data: () => ({
		currentIdx: 0,
		textEditor: false,
	}),
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		object(): IChoices {
			const obj = this.currentPanel.objects[this.$store.state.ui.selection!];
			if (obj.type !== 'choice') return undefined!;
			return obj as IChoices;
		},
		autoWrap: setable('autoWrap', 'panels/setAutoWrapping'),
		// eslint-disable-next-line @typescript-eslint/camelcase
		buttonText: simpleButtonSettable('text'),
		buttons(): DeepReadonly<IChoice[]> {
			return this.object.choices;
		},
		textHandler(): Handler | undefined {
			if (!this.textEditor) return undefined;
			return {
				title: 'Text',
				get: () => {
					return this.buttonText;
				},
				set: (text: string) => {
					this.buttonText = text;
				},
				leave: () => {
					this.textEditor = false;
				},
			};
		},
	},
	methods: {
		select(idx: number): void {
			this.currentIdx = idx;
		},
		addChoice(): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/addChoice', {
					id: this.object.id,
					panelId: this.object.panelId,
					text: '',
				} as IAddChoiceAction);
			});
		},
		removeChoice(): void {
			this.vuexHistory.transaction(() => {
				if (
					this.currentIdx === this.object.choices.length - 1 &&
					this.currentIdx > 0
				) {
					this.select(this.currentIdx - 1);
				}
				this.$store.dispatch('panels/removeChoice', {
					id: this.object.id,
					panelId: this.object.panelId,
					choiceIdx: this.currentIdx,
				} as IRemoveChoiceAction);
			});
		},
	},
});

function simpleButtonSettable<K extends keyof IChoice>(key: K) {
	return {
		get(this: IThis): IChoice[K] {
			return this.object.choices[this.currentIdx][key];
		},
		set(this: IThis, val: IChoice[K]): void {
			this.vuexHistory.transaction(() => {
				this.$store.commit('panels/setChoiceProperty', {
					id: this.object.id,
					panelId: this.object.panelId,
					choiceIdx: this.currentIdx,
					key,
					value: val,
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
.choiceBtn {
	overflow: hidden;
	width: 100%;
	height: 24px;
	max-width: 100%;
	text-overflow: ellipsis;
	padding: 2px;

	//noinspection CssOverwrittenProperties
	&.active {
		background-color: $default-border;
		background-color: var(--border);
	}
}

.current_button {
	input {
		width: 130px;
	}
}

.panel.vertical {
	.buttons {
		max-height: 200px;
		width: 100%;

		> .list {
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
	.buttons {
		@include height-100();
		width: 161px;
	}
}
</style>
