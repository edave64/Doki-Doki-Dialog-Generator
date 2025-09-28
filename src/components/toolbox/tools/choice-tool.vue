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
				<tbody>
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
				</tbody>
			</table>
		</d-fieldset>
		<button @click="addChoice">Add</button>
		<button @click="removeChoice">Remove</button>
		<toggle-box label="Auto line wrap?" v-model="autoWrap" />
	</object-tool>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import { transaction } from '@/history-engine/transaction';
import type Choice from '@/store/object-types/choices';
import type { IChoice } from '@/store/object-types/choices';
import type { Panel } from '@/store/panels';
import { state } from '@/store/root';
import type { Viewport } from '@/store/viewport';
import { propWithTransaction } from '@/util/simple-settable';
import type { DeepReadonly } from 'ts-essentials';
import { computed, inject, type Ref, ref } from 'vue';
import ObjectTool, { type Handler } from './object-tool.vue';

const root = ref(null! as HTMLElement);

const viewport = inject<Ref<Viewport>>('viewport')!;

setupPanelMixin(root);
const currentPanel = computed((): DeepReadonly<Panel> => {
	return state.panels.panels[viewport.value.currentPanel];
});
const object = computed((): Choice => {
	const obj = currentPanel.value.objects[viewport.value.selection!];
	if (obj.type !== 'choice') return undefined!;
	return obj as Choice;
});

const currentIdx = ref(0);
const textEditor = ref(false);

const autoWrap = propWithTransaction(object, 'autoWrap');
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
		object.value.addChoice('');
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
		object.value.removeChoice(currentIdx.value);
	});
}

function simpleButtonSettable<K extends keyof IChoice>(key: K) {
	return computed({
		get(): IChoice[K] {
			return object.value.choices[currentIdx.value][key];
		},
		set(val: IChoice[K]): void {
			transaction(() => {
				object.value.setChoiceProperty(currentIdx.value, key, val);
			});
		},
	});
}
</script>

<style lang="scss" scoped>
@use '@/styles/fixes.scss';

.choiceBtn {
	overflow: hidden;
	width: 100%;
	height: 24px;
	max-width: 100%;
	text-overflow: ellipsis;
	padding: 2px;

	&.active {
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
		@include fixes.height-100();
		width: 161px;
	}
}
</style>
