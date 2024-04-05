<!--
	A tool that is shown when a choice object is selected.
-->
<template>
	<object-tool
		ref="root"
		:object="object"
		title="Choice"
		:textHandler="textHandler"
	>
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

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import { transaction } from '@/plugins/vuex-history';
import {
	IAddChoiceAction,
	IChoice,
	IChoices,
	IRemoveChoiceAction,
} from '@/store/object-types/choices';
import { IPanel } from '@/store/panels';
import { genericSetterMerged } from '@/util/simple-settable';
import { DeepReadonly } from 'ts-essentials';
import { ComponentCustomProperties, computed, ref } from 'vue';
import ObjectTool, { Handler } from './object-tool.vue';
import { useStore } from '@/store';

const store = useStore();
const root = ref(null! as HTMLElement);
setupPanelMixin(root);
const currentPanel = computed((): DeepReadonly<IPanel> => {
	return store.state.panels.panels[store.state.panels.currentPanel];
});
const object = computed((): IChoices => {
	const obj = currentPanel.value.objects[store.state.ui.selection!];
	if (obj.type !== 'choice') return undefined!;
	return obj as IChoices;
});

const setable = <K extends keyof IChoices>(prop: K, message: string) =>
	genericSetterMerged(store, object, message, false, prop);

const currentIdx = ref(0);
const textEditor = ref(false);

const autoWrap = setable('autoWrap', 'panels/setAutoWrapping');
const buttonText = simpleButtonSettable('text');
const buttons = computed(() => {
	return object.value.choices;
});
const textHandler = computed((): Handler | undefined => {
	if (!textEditor.value) return undefined;
	return {
		title: 'Text',
		get: () => {
			return buttonText.value;
		},
		set: (text: string) => {
			buttonText.value = text;
		},
		leave: () => {
			textEditor.value = false;
		},
	};
});

function select(idx: number): void {
	currentIdx.value = idx;
}

function addChoice(): void {
	transaction(async () => {
		await store.dispatch('panels/addChoice', {
			id: object.value.id,
			panelId: object.value.panelId,
			text: '',
		} as IAddChoiceAction);
	});
}

function removeChoice(): void {
	transaction(async () => {
		if (
			currentIdx.value === object.value.choices.length - 1 &&
			currentIdx.value > 0
		) {
			select(currentIdx.value - 1);
		}
		await store.dispatch('panels/removeChoice', {
			id: object.value.id,
			panelId: object.value.panelId,
			choiceIdx: currentIdx.value,
		} as IRemoveChoiceAction);
	});
}

function simpleButtonSettable<K extends keyof IChoice>(key: K) {
	return computed({
		get(this: IThis): IChoice[K] {
			return object.value.choices[currentIdx.value][key];
		},
		set(this: IThis, val: IChoice[K]): void {
			transaction(() => {
				store.commit('panels/setChoiceProperty', {
					id: object.value.id,
					panelId: object.value.panelId,
					choiceIdx: currentIdx.value,
					key,
					value: val,
				});
			});
		},
	});
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
