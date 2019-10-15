<template>
	<div :class="{ panel: true }">
		<h1>Textbox</h1>
		<div>
			<label for="text_style">Style:</label>
			<br />
			<select id="text_style" v-model="textBoxStyle" @keydown.stop>
				<option value="normal">Normal</option>
				<option value="corrupt">Corrupt</option>
				<option value="custom">Custom</option>
			</select>
		</div>
		<div>
			<label for="current_talking">Person talking:</label>
			<br />
			<select id="current_talking" v-model="talkingDefaults" @keydown.stop>
				<option value="None">No-one</option>
				<option value="Sayori">Sayori</option>
				<option value="Yuri">Yuri</option>
				<option value="Natsuki">Natsuki</option>
				<option value="Monika">Monika</option>
				<option value="FeMC">FeMC</option>
				<option value="MC">MC</option>
				<option value="Amy">Amy</option>
				<option value="Other">Other</option>
			</select>
		</div>
		<div>
			<label for="custom_name">Other name:</label>
			<br />
			<input id="custom_name" v-model="talking" @keydown.stop />
		</div>
		<toggle label="Controls visible?" v-model="showControls" />
		<toggle label="Able to skip?" v-model="allowSkipping" />
		<toggle label="Continue arrow?" v-model="showContinueArrow" />
		<div id="dialog_text_wrapper">
			<label for="dialog_text">Dialog:</label>
			<textarea v-model="dialog" id="dialog_text" @keydown.stop />
		</div>
		<p>
			Formatting:
			<br />[In brackets] for editied style text
		</p>
		<position-and-size :obj="textbox" />
		<layers :obj="textbox" />
		<opacity :obj="textbox" />
		<toggle v-model="flip" label="Flip?" />

		<fieldset>
			<legend>Customization:</legend>
			<label for="textbox_color">Color:</label>
			<input id="textbox_color" type="color" v-model="textboxColor" />
		</fieldset>
		<delete :obj="textbox" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
	ITextBox,
	ISetTextBoxTalkingMutation,
	ISetTextBoxControlsVisibleMutation,
	ISetTextBoxControlsSkipMutation,
	ISetTextBoxControlsContinueMutation,
	ISetTextBoxTextMutation,
	ISetTextBoxStyleAction,
	ISetTextBoxCustomColorMutation,
} from '@/store/objectTypes/textbox';
import Toggle from '@/components/toggle.vue';
import { State } from 'vuex-class-decorator';
import { IHistorySupport } from '@/plugins/vuex-history';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Opacity from '@/components/toolbox/commonsFieldsets/opacity.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import { ISetObjectFlipMutation } from '@/store/objects';

@Component({
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Opacity,
		Delete,
	},
})
export default class TextPanel extends Vue {
	@Prop({ required: true }) private readonly textbox!: ITextBox;

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get talkingDefaults(): string {
		switch (this.talking) {
			case null:
				return 'None';
			case 'Sayori':
			case 'Yuri':
			case 'Natsuki':
			case 'Monika':
			case 'FeMC':
			case 'MC':
			case 'Amy':
				return this.talking;
			default:
				return 'Other';
		}
	}

	private set talkingDefaults(value: string) {
		if (value === 'None') {
			this.talking = null;
		} else if (value === 'Other') {
			this.talking = '';
		} else {
			this.talking = value;
		}
	}

	private get talking(): string | null {
		return this.textbox.talking;
	}

	private set talking(talking: string | null) {
		this.history.transaction(() => {
			this.$store.commit('objects/setTalking', {
				id: this.textbox.id,
				talking,
			} as ISetTextBoxTalkingMutation);
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

	private get textboxColor(): string {
		return this.textbox.customColor;
	}

	private set textboxColor(color: string) {
		this.$store.commit('objects/setCustomColor', {
			id: this.textbox.id,
			color,
		} as ISetTextBoxCustomColorMutation);
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
	}

	&:not(.vertical) {
		#dialog_text_wrapper {
			height: 181px;
			display: table;

			* {
				display: table-row;
			}
		}
	}
}

textarea {
	min-height: 148px;
}

.btn_link {
	appearance: button;
	text-align: center;
}

p {
	max-width: 148px;
}
</style>