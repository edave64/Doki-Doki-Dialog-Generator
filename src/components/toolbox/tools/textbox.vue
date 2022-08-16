<template>
	<object-tool
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
			<div id="dialog_text_wrapper">
				<label for="dialog_text">Dialog:</label>
				<textarea v-model="dialog" id="dialog_text" @keydown.stop></textarea>
				<button @click="textEditor = 'body'">Formatting</button>
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
									:placeholder="nameboxWidthDefault"
									v-model.number="customNameboxWidth"
									:disabled="overrideColor"
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
			<button @click="splitTextbox">Split textbox</button>
		</template>
	</object-tool>
</template>

<script lang="ts">
import {
	ITextBox,
	textboxProperty,
	ISplitTextbox,
	IResetTextboxBounds,
	ISetTextBoxTalkingObjMutation,
	TextBoxSimpleProperties,
} from '@/store/objectTypes/textbox';
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import { IPanel } from '@/store/panels';
import { defineComponent } from 'vue';
import { PanelMixin } from './panelMixin';
import { genericSetable, genericSimpleSetter } from '@/util/simpleSettable';
import ObjectTool, { Handler } from './object-tool.vue';
import getConstants from '@/constants';
import { DeepReadonly, UnreachableCaseError } from 'ts-essentials';

const setable = genericSetable<ITextBox>();
const tbSetable = genericSimpleSetter<ITextBox, TextBoxSimpleProperties>(
	'panels/setTextBoxProperty'
);

export default defineComponent({
	components: {
		Toggle,
		DFieldset,
		ObjectTool,
		DFlow,
	},
	mixins: [PanelMixin],
	data: () => ({
		textEditor: '' as '' | 'name' | 'body',
		colorSelect: '' as '' | 'base' | 'controls' | 'namebox' | 'nameboxStroke',
	}),
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		customizable(): boolean {
			return this.textBoxStyle.startsWith('custom');
		},
		nameboxWidthDefault(): number {
			return getConstants().TextBox.NameboxWidth;
		},
		object(): ITextBox {
			const obj = this.currentPanel.objects[this.$store.state.ui.selection!];
			if (obj.type !== 'textBox') return undefined!;
			return obj as ITextBox;
		},
		textHandler(): Handler | undefined {
			if (!this.textEditor) return undefined;
			return {
				title: this.textEditorName,
				get: () => {
					if (this.textEditor === 'name') return this.object.talkingOther;
					if (this.textEditor === 'body') return this.dialog;
					return '';
				},
				set: (text: string) => {
					if (this.textEditor === 'name') this.talkingOther = text;
					else if (this.textEditor === 'body') this.dialog = text;
				},
				leave: () => {
					this.textEditor = '';
				},
			};
		},
		colorHandler(): Handler | undefined {
			if (!this.colorSelect) return undefined;
			return {
				title: this.colorName,
				get: () => {
					switch (this.colorSelect) {
						case '':
							return '#000000';
						case 'base':
							return this.object.customColor;
						case 'controls':
							return this.object.customControlsColor;
						case 'namebox':
							return this.object.customNameboxColor;
						case 'nameboxStroke':
							return this.object.customNameboxStroke;
						default:
							throw new UnreachableCaseError(this.colorSelect);
					}
				},
				set: (color: string) => {
					this.vuexHistory.transaction(() => {
						const panelId = this.currentPanel.id;
						const id = this.object.id;
						let colorKey = {
							base: 'customColor',
							controls: 'customControlsColor',
							namebox: 'customNameboxColor',
							nameboxStroke: 'customNameboxStroke',
							'': undefined,
						}[this.colorSelect] as TextBoxSimpleProperties | undefined;
						if (color === undefined) return;
						this.$store.commit(
							'panels/setTextBoxProperty',
							textboxProperty(panelId, id, 'customNameboxStroke', colorKey!)
						);
					});
				},
				leave: () => {
					this.colorSelect = '';
				},
			};
		},
		talkingObjId: {
			get(): string {
				return this.object.talkingObjId || '$null$';
			},
			set(val: string): void {
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setTalkingObject', {
						id: this.object.id,
						panelId: this.object.panelId,
						talkingObjId: val === '$null$' ? null : val,
					} as ISetTextBoxTalkingObjMutation);
				});
			},
		},
		talkingOther: setable('talkingOther', 'panels/setTalkingOther'),
		textBoxStyle: setable('style', 'panels/setStyle', true),
		showControls: tbSetable('controls'),
		allowSkipping: tbSetable('skip'),
		autoQuoting: tbSetable('autoQuoting'),
		autoWrap: tbSetable('autoWrap'),
		showContinueArrow: tbSetable('continue'),
		dialog: tbSetable('text'),
		overrideColor: tbSetable('overrideColor'),
		deriveCustomColors: tbSetable('deriveCustomColors'),
		customNameboxWidth: tbSetable('customNameboxWidth'),
		nameList(): [string, string][] {
			const panel = this.currentPanel;

			const ret: [string, string][] = [];

			for (const id of [...panel.order, ...panel.onTopOrder]) {
				const obj = panel.objects[id];
				if (obj.label === null) continue;
				ret.push([id, obj.label!]);
			}
			return ret;
		},
		textEditorName(): string {
			if (this.textEditor === 'name') return 'Name';
			if (this.textEditor === 'body') return 'Dialog';
			return '';
		},
		customControlsColor(): string {
			return this.object.customControlsColor;
		},
		colorName(): string {
			switch (this.colorSelect) {
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
					throw new UnreachableCaseError(this.colorSelect);
			}
		},
	},
	methods: {
		splitTextbox(): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/splitTextbox', {
					id: this.object.id,
					panelId: this.object.panelId,
				} as ISplitTextbox);
			});
		},
		resetPosition(): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/resetTextboxBounds', {
					id: this.object.id,
					panelId: this.object.panelId,
				} as IResetTextboxBounds);
			});
		},
		jumpToCharacter(): void {
			this.vuexHistory.transaction(() => {
				this.$store.commit('ui/setSelection', this.talkingObjId);
			});
		},
	},
});
</script>
<style lang="scss" scoped>
.panel {
	&.vertical {
		#dialog_text_wrapper {
			width: 173px;

			textarea {
				width: 100%;
			}
		}

		table {
			width: 100%;

			input,
			select {
				width: 100px;
			}
		}
	}

	textarea {
		display: block;
		height: 114px;
	}

	&:not(.vertical) {
		table.upper-combos {
			width: 256px;

			select {
				width: 100px;
			}
			input {
				width: 75px;
			}
			button {
				width: 25px;
			}
		}

		.customization-set {
			@include height-100();
		}
	}
}

.color-button {
	height: 24px;
	width: 48px;
	vertical-align: middle;
}
</style>
