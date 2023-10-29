<!--
	A tool that is shown when a textbox object is selected.
-->
<template>
	<object-tool
		ref="root"
		:object="object"
		title="Textbox"
		:textHandler="textHandler"
		:colorHandler="colorHandler"
	>
		<template v-slot:default>
			<table class="upper-combos">
				<tr>
					<td>
						<label for="text_style">Style:</label>
					</td>
					<td colspan="2">
						<select id="text_style" v-model="textBoxStyle" @keydown.stop>
							<option value="normal">Normal</option>
							<option value="corrupt">Corrupt</option>
							<option value="custom">Custom</option>
							<option value="custom_plus">Custom (Plus)</option>
							<option value="none">None</option>
						</select>
					</td>
				</tr>
				<tr>
					<td>
						<label for="current_talking">Person talking:</label>
					</td>
					<td>
						<select id="current_talking" v-model="talkingObjId" @keydown.stop>
							<option value="$null$">No-one</option>
							<option v-for="[id, label] in nameList" :key="id" :value="id">
								{{ label }}
							</option>
							<option value="$other$">Other</option>
						</select>
					</td>
					<td>
						<button
							title="Jump to talking character"
							@click="jumpToCharacter"
							:disabled="
								talkingObjId === '$null$' || talkingObjId === '$other$'
							"
						>
							>
						</button>
					</td>
				</tr>
				<tr>
					<td>
						<label for="custom_name">Other name:</label>
					</td>
					<td>
						<input id="custom_name" v-model="talkingOther" @keydown.stop />
					</td>
					<td>
						<button @click="textEditor = 'name'">...</button>
					</td>
				</tr>
			</table>

			<toggle label="Auto quoting?" v-model="autoQuoting" />
			<toggle label="Auto line wrap?" v-model="autoWrap" />
			<div id="dialog_text_wrapper" class="v-w100">
				<label for="dialog_text">Dialog:</label>
				<textarea
					class="v-w100"
					ref="textarea"
					v-model="dialog"
					id="dialog_text"
					@keydown.stop
				></textarea>
				<button class="w100 bt0" @click="textEditor = 'body'">
					Formatting
				</button>
			</div>
		</template>
		<template v-slot:options>
			<d-fieldset
				title="Customization:"
				:class="customizable ? 'customization-set' : ''"
			>
				<d-flow direction="vertical" maxSize="100%" no-wraping>
					<toggle label="Controls visible?" v-model="showControls" />
					<toggle label="Able to skip?" v-model="allowSkipping" />
					<toggle label="Continue arrow?" v-model="showContinueArrow" />
					<table v-if="customizable">
						<tr>
							<td>
								<label for="custom_namebox_width">Namebox width:</label>
							</td>
							<td>
								<input
									id="custom_namebox_width"
									type="number"
									style="width: 48px"
									:placeholder="nameboxWidthDefault + ''"
									v-model.number="customNameboxWidth"
									@keydown.stop
								/>
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<toggle v-model="overrideColor" label="Override color" />
							</td>
						</tr>
						<tr v-if="overrideColor">
							<td>
								<label for="textbox_color">Color:</label>
							</td>
							<td>
								<button
									id="textbox_color"
									class="color-button"
									:style="{ background: object.customColor }"
									@click="colorSelect = 'base'"
								/>
							</td>
						</tr>
						<tr v-if="overrideColor">
							<td colspan="2">
								<toggle
									id="derive_custom_colors"
									v-model="deriveCustomColors"
									label="Derive other colors"
								/>
							</td>
						</tr>
						<template v-if="overrideColor && !deriveCustomColors">
							<tr>
								<td>
									<label for="custom_controls_color">Controls Color:</label>
								</td>
								<td>
									<button
										id="custom_controls_color"
										class="color-button"
										:style="{ background: object.customControlsColor }"
										@click="colorSelect = 'controls'"
									/>
								</td>
							</tr>
							<tr>
								<td>
									<label for="custom_namebox_color">Namebox Color:</label>
								</td>
								<td>
									<button
										id="custom_namebox_color"
										class="color-button"
										:style="{ background: object.customNameboxColor }"
										@click="colorSelect = 'namebox'"
									/>
								</td>
							</tr>
							<tr>
								<td>
									<label for="custom_namebox_stroke"
										>Namebox text stroke:</label
									>
								</td>
								<td>
									<button
										id="custom_namebox_stroke"
										class="color-button"
										:style="{ background: object.customNameboxStroke }"
										@click="colorSelect = 'nameboxStroke'"
									/>
								</td>
							</tr>
						</template>
					</table>
				</d-flow>
			</d-fieldset>
			<button @click="resetPosition">Reset position</button>
			<button class="v-bt0" @click="splitTextbox">Split textbox</button>
		</template>
	</object-tool>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import getConstants from '@/constants';
import { transaction } from '@/plugins/vuex-history';
import {
	IResetTextboxBounds,
	ISetTextBoxTalkingObjMutation,
	ISplitTextbox,
	ITextBox,
	textboxProperty,
	TextBoxSimpleProperties,
} from '@/store/object-types/textbox';
import { IObject } from '@/store/objects';
import { IPanel } from '@/store/panels';
import {
	genericSetterSplit,
	genericSetterMerged,
} from '@/util/simple-settable';
import { DeepReadonly, UnreachableCaseError } from 'ts-essentials';
import { computed, ref, watch } from 'vue';
import ObjectTool, { Handler } from './object-tool.vue';
import { Store, useStore } from 'vuex';
import { IRootState } from '@/store';

const store = useStore() as Store<IRootState>;
const root = ref(null! as HTMLElement);
const textarea = ref(null! as HTMLTextAreaElement);
const { vertical } = setupPanelMixin(root);
const textEditor = ref('' as '' | 'name' | 'body');
const colorSelect = ref(
	'' as '' | 'base' | 'controls' | 'namebox' | 'nameboxStroke'
);

watch(
	() => vertical.value,
	() => {
		textarea.value.style.height = '';
		textarea.value.style.width = '';
	}
);

const currentPanel = computed((): DeepReadonly<IPanel> => {
	return store.state.panels.panels[store.state.panels.currentPanel];
});
const customizable = computed((): boolean => {
	return textBoxStyle.value.startsWith('custom');
});
const nameboxWidthDefault = computed((): number => {
	return getConstants().TextBox.NameboxWidth;
});
const object = computed((): ITextBox => {
	const obj = currentPanel.value.objects[store.state.ui.selection!];
	if (obj.type !== 'textBox') return undefined!;
	return obj as ITextBox;
});
const tbSetable = <K extends TextBoxSimpleProperties>(k: K) =>
	genericSetterSplit<ITextBox, K>(
		store,
		object,
		'panels/setTextBoxProperty',
		false,
		k
	);
const textHandler = computed((): Handler | undefined => {
	if (!textEditor.value) return undefined;
	return {
		title: textEditorName.value,
		get(): string {
			if (textEditor.value === 'name') return object.value.talkingOther;
			if (textEditor.value === 'body') return dialog.value;
			return '';
		},
		set(text: string) {
			if (textEditor.value === 'name') talkingOther.value = text;
			else if (textEditor.value === 'body') dialog.value = text;
		},
		leave() {
			textEditor.value = '';
		},
	};
});
const colorHandler = computed((): Handler | undefined => {
	if (!colorSelect.value) return undefined;
	return {
		title: colorName.value,
		get: () => {
			switch (colorSelect.value) {
				case '':
					return '#000000';
				case 'base':
					return object.value.customColor;
				case 'controls':
					return object.value.customControlsColor;
				case 'namebox':
					return object.value.customNameboxColor;
				case 'nameboxStroke':
					return object.value.customNameboxStroke;
				default:
					throw new UnreachableCaseError(colorSelect.value);
			}
		},
		set: (color: string) => {
			transaction(() => {
				const panelId = currentPanel.value.id;
				const id = object.value.id;
				let colorKey = {
					base: 'customColor',
					controls: 'customControlsColor',
					namebox: 'customNameboxColor',
					nameboxStroke: 'customNameboxStroke',
					'': undefined,
				}[colorSelect.value] as TextBoxSimpleProperties | undefined;
				if (color === undefined) return;
				store.commit(
					'panels/setTextBoxProperty',
					textboxProperty(panelId, id, colorKey!, color)
				);
			});
		},
		leave: () => {
			colorSelect.value = '';
		},
	};
});
const talkingObjId = computed({
	get(): '$null$' | '$other$' | IObject['id'] {
		return object.value.talkingObjId ?? '$null$';
	},
	set(val: '$null$' | '$other$' | IObject['id']): void {
		transaction(() => {
			store.commit('panels/setTalkingObject', {
				id: object.value.id,
				panelId: object.value.panelId,
				talkingObjId: val === '$null$' ? null : val,
			} as ISetTextBoxTalkingObjMutation);
		});
	},
});
const talkingOther = genericSetterMerged(
	store,
	object,
	'panels/setTalkingOther',
	false,
	'talkingOther'
);
const textBoxStyle = genericSetterMerged(
	store,
	object,
	'panels/setStyle',
	true,
	'style'
);
const showControls = tbSetable('controls');
const allowSkipping = tbSetable('skip');
const autoQuoting = tbSetable('autoQuoting');
const autoWrap = tbSetable('autoWrap');
const showContinueArrow = tbSetable('continue');
const dialog = tbSetable('text');
const overrideColor = tbSetable('overrideColor');
const deriveCustomColors = tbSetable('deriveCustomColors');
const customNameboxWidth = tbSetable('customNameboxWidth');
const nameList = computed((): [IObject['id'], string][] => {
	const panel = currentPanel.value;

	const ret: [IObject['id'], string][] = [];

	for (const id of [...panel.order, ...panel.onTopOrder]) {
		const obj = panel.objects[id];
		if (obj.label === null) continue;
		ret.push([id, obj.label!]);
	}
	return ret;
});
const textEditorName = computed((): string => {
	if (textEditor.value === 'name') return 'Name';
	if (textEditor.value === 'body') return 'Dialog';
	return '';
});
const colorName = computed((): string => {
	switch (colorSelect.value) {
		case '':
			return '';
		case 'base':
			return 'Base color';
		case 'controls':
			return 'Controls color';
		case 'namebox':
			return 'Namebox color';
		case 'nameboxStroke':
			return 'Namebox text stroke';
		default:
			throw new UnreachableCaseError(colorSelect.value);
	}
});

function splitTextbox(): void {
	transaction(async () => {
		await store.dispatch('panels/splitTextbox', {
			id: object.value.id,
			panelId: object.value.panelId,
		} as ISplitTextbox);
	});
}
function resetPosition(): void {
	transaction(async () => {
		await store.dispatch('panels/resetTextboxBounds', {
			id: object.value.id,
			panelId: object.value.panelId,
		} as IResetTextboxBounds);
	});
}
function jumpToCharacter(): void {
	transaction(() => {
		store.commit('ui/setSelection', talkingObjId.value);
	});
}
//#region
</script>
<style lang="scss" scoped>
.panel {
	table {
		td:first-child {
			width: 0;
		}

		input,
		select {
			width: 100%;
		}
		button {
			width: 25px;
		}
	}

	&:not(.vertical) {
		table.upper-combos {
			width: 200px;
		}

		.customization-set {
			@include height-100();
		}
	}
}

textarea {
	display: block;
	min-height: 128px;
}

.color-button {
	height: 24px;
	width: 48px;
	vertical-align: middle;
}
</style>
