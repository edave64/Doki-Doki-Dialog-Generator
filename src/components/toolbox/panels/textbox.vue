<template>
	<div class="panel">
		<h1>Textbox</h1>
		<color v-if="colorSelect !== ''" :title="colorName" v-model="color" @leave="colorSelect = ''" />
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
						</select>
					</td>
				</tr>
				<tr>
					<td>
						<label for="current_talking">Person talking:</label>
					</td>
					<td>
						<select id="current_talking" v-model="talkingDefaults" @keydown.stop>
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
					</td>
				</tr>
			</table>
			<toggle label="Controls visible?" v-model="showControls" />
			<toggle label="Able to skip?" v-model="allowSkipping" />
			<toggle label="Continue arrow?" v-model="showContinueArrow" />
			<toggle label="Auto quoting?" v-model="autoQuoting" />
			<div id="dialog_text_wrapper">
				<label for="dialog_text">Dialog:</label>
				<textarea v-model="dialog" id="dialog_text" @keydown.stop />
			</div>
			<position-and-size :obj="textbox" />
			<button @click="splitTextbox">Split textbox</button>
			<layers :obj="textbox" />
			<opacity :obj="textbox" />
			<toggle v-model="flip" label="Flip?" />

			<fieldset v-if="textBoxStyle === 'custom'">
				<legend>Customization:</legend>
				<table>
					<tr>
						<td>
							<label for="textbox_color">Color:</label>
						</td>
						<td>
							<button
								id="textbox_color"
								class="color-button"
								:style="{background: textbox.customColor}"
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
								style="width: 48px"
								v-model.number="customNameboxWidth"
							/>
						</td>
					</tr>
					<tr>
						<td colspan="2">
							<toggle id="derive_custom_colors" v-model="deriveCustomColors" label="Derive other colors" />
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
									:style="{background: textbox.customControlsColor}"
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
									:style="{background: textbox.customNameboxColor}"
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
									:style="{background: textbox.customNameboxStroke}"
									@click="colorSelect = 'nameboxStroke'"
								/>
							</td>
						</tr>
					</template>
				</table>
			</fieldset>
			<delete :obj="textbox" />
		</template>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Mixins } from 'vue-property-decorator';
import {
	ITextBox,
	ISetTextBoxControlsVisibleMutation,
	ISetTextBoxControlsSkipMutation,
	ISetTextBoxControlsContinueMutation,
	ISetTextBoxTextMutation,
	ISetTextBoxStyleAction,
	ISetTextBoxCustomColorMutation,
	ISetTextBoxTalkingDefaultMutation,
	ISetTextBoxTalkingOtherMutation,
	ISetTextBoxCustomControlsColorMutation,
	ISetTextBoxNameboxColorMutation,
	ISetTextBoxNameboxWidthMutation,
	ISetTextBoxNameboxStrokeMutation,
	ISetTextBoxDeriveCustomColorMutation,
	ISplitTextbox,
	ISetTextBoxAutoQuotingMutation,
} from '@/store/objectTypes/textbox';
import Toggle from '@/components/toggle.vue';
import { State } from 'vuex-class-decorator';
import { IHistorySupport } from '@/plugins/vuex-history';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Opacity from '@/components/toolbox/commonsFieldsets/opacity.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import { ISetObjectFlipMutation } from '@/store/objects';
import { PanelMixin } from './panelMixin';
import { Store } from 'vuex';
import { IRootState } from '../../../store';
import Color from '../subpanels/color.vue';

@Component({
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Opacity,
		Delete,
		Color,
	},
})
export default class TextPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;

	private readonly colorSelect:
		| ''
		| 'base'
		| 'controls'
		| 'namebox'
		| 'nameboxStroke' = '';

	private get textbox(): ITextBox {
		const obj = this.$store.state.objects.objects[
			this.$store.state.ui.selection!
		];
		if (obj.type !== 'textBox') return undefined!;
		return obj as ITextBox;
	}

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private splitTextbox(): void {
		this.history.transaction(() => {
			this.$store.dispatch('objects/splitTextbox', {
				id: this.textbox.id,
			} as ISplitTextbox);
		});
	}

	private get talkingDefaults(): ISetTextBoxTalkingDefaultMutation['talkingDefault'] {
		return this.textbox.talkingDefault;
	}

	private set talkingDefaults(
		talkingDefault: ISetTextBoxTalkingDefaultMutation['talkingDefault']
	) {
		this.history.transaction(() => {
			this.$store.commit('objects/setTalkingDefault', {
				id: this.textbox.id,
				talkingDefault,
			} as ISetTextBoxTalkingDefaultMutation);
		});
	}

	private get talkingOther(): string {
		return this.textbox.talkingOther;
	}

	private set talkingOther(talkingOther: string) {
		this.history.transaction(() => {
			this.$store.commit('objects/setTalkingOther', {
				id: this.textbox.id,
				talkingOther,
			} as ISetTextBoxTalkingOtherMutation);
		});
	}

	private get showControls(): boolean {
		return this.textbox.controls;
	}

	private set showControls(controls: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setControlsVisible', {
				id: this.textbox.id,
				controls,
			} as ISetTextBoxControlsVisibleMutation);
		});
	}

	private get allowSkipping(): boolean {
		return this.textbox.controls;
	}

	private set allowSkipping(skip: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setSkipable', {
				id: this.textbox.id,
				skip,
			} as ISetTextBoxControlsSkipMutation);
		});
	}

	private get autoQuoting(): boolean {
		return this.textbox.autoQuoting;
	}

	private set autoQuoting(autoQuoting: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setAutoQuoting', {
				id: this.textbox.id,
				autoQuoting,
			} as ISetTextBoxAutoQuotingMutation);
		});
	}

	private get showContinueArrow(): boolean {
		return this.textbox.continue;
	}

	private set showContinueArrow(value: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setContinueArrow', {
				id: this.textbox.id,
				continue: value,
			} as ISetTextBoxControlsContinueMutation);
		});
	}

	private get dialog(): string {
		return this.textbox.text;
	}

	private set dialog(text: string) {
		this.history.transaction(() => {
			this.$store.commit('objects/setText', {
				id: this.textbox.id,
				text,
			} as ISetTextBoxTextMutation);
		});
	}

	private get flip(): boolean {
		return this.textbox.flip;
	}

	private set flip(flip: boolean) {
		this.history.transaction(() => {
			this.$store.commit('objects/setFlip', {
				id: this.textbox.id,
				flip,
			} as ISetObjectFlipMutation);
		});
	}

	private get textBoxStyle(): ITextBox['style'] {
		return this.textbox.style;
	}

	private set textBoxStyle(style: ITextBox['style']) {
		this.$store.dispatch('objects/setStyle', {
			id: this.textbox.id,
			style,
		} as ISetTextBoxStyleAction);
	}

	private get deriveCustomColors(): boolean {
		return this.textbox.deriveCustomColors;
	}

	private set deriveCustomColors(deriveCustomColors: boolean) {
		this.$store.commit('objects/setDeriveCustomColors', {
			id: this.textbox.id,
			deriveCustomColors,
		} as ISetTextBoxDeriveCustomColorMutation);
	}

	private get customControlsColor(): string {
		return this.textbox.customControlsColor;
	}

	private get customNameboxWidth(): number {
		return this.textbox.customNameboxWidth;
	}

	private set customNameboxWidth(customNameboxWidth: number) {
		this.$store.commit('objects/setNameboxWidth', {
			id: this.textbox.id,
			customNameboxWidth,
		} as ISetTextBoxNameboxWidthMutation);
	}

	private get colorName(): string {
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
		}
	}

	private get color(): string {
		switch (this.colorSelect) {
			case '':
				return '#000000';
			case 'base':
				return this.textbox.customColor;
			case 'controls':
				return this.textbox.customControlsColor;
			case 'namebox':
				return this.textbox.customNameboxColor;
			case 'nameboxStroke':
				return this.textbox.customNameboxStroke;
		}
	}

	private set color(color: string) {
		switch (this.colorSelect) {
			case '':
				return;
			case 'base':
				this.$store.commit('objects/setCustomColor', {
					id: this.textbox.id,
					color,
				} as ISetTextBoxCustomColorMutation);
			case 'controls':
				this.$store.commit('objects/setControlsColor', {
					id: this.textbox.id,
					customControlsColor: color,
				} as ISetTextBoxCustomControlsColorMutation);
			case 'namebox':
				this.$store.commit('objects/setNameboxColor', {
					id: this.textbox.id,
					customNameboxColor: color,
				} as ISetTextBoxNameboxColorMutation);
			case 'nameboxStroke':
				this.$store.commit('objects/setNameboxStroke', {
					id: this.textbox.id,
					customNameboxStroke: color,
				} as ISetTextBoxNameboxStrokeMutation);
		}
	}
}
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
		height: 140px;
	}

	&:not(.vertical) {
		table.upper-combos {
			width: 256px;

			input,
			select {
				width: 100px;
			}
		}
	}
}

:not(.vertical) fieldset {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-content: flex-start;
	overflow: auto;
}

.btn_link {
	appearance: button;
	text-align: center;
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
