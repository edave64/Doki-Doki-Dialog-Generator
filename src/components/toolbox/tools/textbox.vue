<template>
	<div class="panel">
		<h1>Textbox</h1>
		<color
			v-if="colorSelect !== ''"
			:title="colorName"
			v-model="color"
			@leave="colorSelect = ''"
		/>
		<text-editor
			v-else-if="textEditor !== ''"
			:title="textEditorName"
			v-model="textEditorText"
			@leave="textEditor = ''"
		/>
		<template v-else>
			<table class="upper-combos">
				<tr>
					<td>
						<label for="text_style">Style:</label>
					</td>
					<td>
						<select id="text_style" v-model="textBoxStyle" @keydown.stop>
							<option value="normal">Normal</option>
							<option value="corrupt">Corrupt</option>
							<option value="custom">Custom</option>
							<option value="none">None</option>
						</select>
					</td>
				</tr>
				<tr>
					<td>
						<label for="current_talking">Person talking:</label>
					</td>
					<td>
						<select
							id="current_talking"
							v-model="talkingDefaults"
							@keydown.stop
						>
							<option value="No-one">No-one</option>
							<option value="Sayori">Sayori</option>
							<option value="Yuri">Yuri</option>
							<option value="Natsuki">Natsuki</option>
							<option value="Monika">Monika</option>
							<option value="FeMC">FeMC</option>
							<option value="MC">MC</option>
							<option value="Chad">Chad</option>
							<option value="Amy">Amy</option>
							<option value="Other">Other</option>
						</select>
					</td>
				</tr>
				<tr>
					<td>
						<label for="custom_name">Other name:</label>
					</td>
					<td>
						<input id="custom_name" v-model="talkingOther" @keydown.stop />
						<button @click="textEditor = 'name'">...</button>
					</td>
				</tr>
			</table>

			<toggle label="Auto quoting?" v-model="autoQuoting" />
			<toggle label="Auto line wrap?" v-model="autoWrap" />
			<div id="dialog_text_wrapper">
				<label for="dialog_text">Dialog:</label>
				<textarea v-model="dialog" id="dialog_text" @keydown.stop />
				<button @click="textEditor = 'body'">Formatting</button>
			</div>
			<position-and-size :obj="object" />
			<button @click="resetPosition">Reset position</button>
			<button @click="splitTextbox">Split textbox</button>
			<layers :object="object" />
			<toggle v-model="flip" label="Flip?" />

			<d-fieldset title="Customization:">
				<toggle label="Controls visible?" v-model="showControls" />
				<toggle label="Able to skip?" v-model="allowSkipping" />
				<toggle label="Continue arrow?" v-model="showContinueArrow" />
				<table v-if="textBoxStyle === 'custom'">
					<tr>
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
					<tr>
						<td>
							<label for="custom_namebox_width">Namebox width:</label>
						</td>
						<td>
							<input
								id="custom_namebox_width"
								type="number"
								style="width: 48px;"
								v-model.number="customNameboxWidth"
								@keydown.stop
							/>
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<toggle
								id="derive_custom_colors"
								v-model="deriveCustomColors"
								label="Derive other colors"
							/>
						</td>
					</tr>
					<template v-if="!deriveCustomColors">
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
								<label for="custom_namebox_stroke">Namebox text stroke:</label>
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
			</d-fieldset>
			<delete :obj="object" />
		</template>
	</div>
</template>

<script lang="ts">
import {
	ITextBox,
	ISetTextBoxCustomColorMutation,
	ISetTextBoxCustomControlsColorMutation,
	ISetTextBoxNameboxColorMutation,
	ISetTextBoxNameboxStrokeMutation,
	ISplitTextbox,
	IResetTextboxBounds,
} from '@/store/objectTypes/textbox';
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import Color from '../subtools/color/color.vue';
import TextEditor from '../subtools/text/text.vue';
import { defineComponent } from 'vue';
import { exhaust } from '@/util/exhaust';
import { PanelMixin } from './panelMixin';
import { genericSetable } from '@/util/simpleSettable';

const setable = genericSetable<ITextBox>();

export default defineComponent({
	components: {
		Toggle,
		DFieldset,
		PositionAndSize,
		Layers,
		Delete,
		Color,
		TextEditor,
	},
	mixins: [PanelMixin],
	data: () => ({
		textEditor: '' as '' | 'name' | 'body',
		colorSelect: '' as '' | 'base' | 'controls' | 'namebox' | 'nameboxStroke',
	}),
	computed: {
		object(): ITextBox {
			const obj = this.$store.state.objects.objects[
				this.$store.state.ui.selection!
			];
			if (obj.type !== 'textBox') return undefined!;
			return obj as ITextBox;
		},
		textEditorText: {
			get(): string {
				if (this.textEditor === 'name') return this.object.talkingOther;
				if (this.textEditor === 'body') return this.dialog;
				return '';
			},
			set(value: string) {
				if (this.textEditor === 'name') this.talkingOther = value;
				else if (this.textEditor === 'body') this.dialog = value;
			},
		},
		talkingDefaults: setable('talkingDefault', 'objects/setTalkingDefault'),
		talkingOther: setable('talkingOther', 'objects/setTalkingOther'),
		showControls: setable('controls', 'objects/setControlsVisible'),
		allowSkipping: setable('skip', 'objects/setSkipable'),
		autoQuoting: setable('autoQuoting', 'objects/setAutoQuoting'),
		autoWrap: setable('autoWrap', 'objects/setAutoWrapping'),
		showContinueArrow: setable('continue', 'objects/setContinueArrow'),
		dialog: setable('text', 'objects/setText'),
		flip: setable('flip', 'objects/setFlip'),
		textBoxStyle: setable('style', 'objects/setStyle'),
		deriveCustomColors: setable(
			'deriveCustomColors',
			'objects/setDeriveCustomColors'
		),
		customNameboxWidth: setable(
			'customNameboxWidth',
			'objects/setNameboxWidth'
		),
		color: {
			get(): string {
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
						exhaust(this.colorSelect);
						return '';
				}
			},
			set(color: string) {
				this.vuexHistory.transaction(() => {
					switch (this.colorSelect) {
						case '':
							return;
						case 'base':
							this.$store.commit('objects/setCustomColor', {
								id: this.object.id,
								color,
							} as ISetTextBoxCustomColorMutation);
							return;
						case 'controls':
							this.$store.commit('objects/setControlsColor', {
								id: this.object.id,
								customControlsColor: color,
							} as ISetTextBoxCustomControlsColorMutation);
							return;
						case 'namebox':
							this.$store.commit('objects/setNameboxColor', {
								id: this.object.id,
								customNameboxColor: color,
							} as ISetTextBoxNameboxColorMutation);
							return;
						case 'nameboxStroke':
							this.$store.commit('objects/setNameboxStroke', {
								id: this.object.id,
								customNameboxStroke: color,
							} as ISetTextBoxNameboxStrokeMutation);
							return;
					}
				});
			},
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
					exhaust(this.colorSelect);
					return '';
			}
		},
	},
	methods: {
		splitTextbox(): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('objects/splitTextbox', {
					id: this.object.id,
				} as ISplitTextbox);
			});
		},
		resetPosition(): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('objects/resetTextboxBounds', {
					id: this.object.id,
				} as IResetTextboxBounds);
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
		fieldset {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-content: flex-start;
			max-height: 100%;
			overflow: auto;
		}
	}
}

p {
	max-width: 148px;
}

.color-button {
	height: 24px;
	width: 48px;
	vertical-align: middle;
}
</style>
