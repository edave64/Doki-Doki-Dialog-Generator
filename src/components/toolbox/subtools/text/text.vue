<!--suppress CssNoGenericFontName -->
<template>
	<color v-if="colorSelector" v-model="selectedColor" @leave="applyColor" />
	<div v-else :class="{ 'text-subpanel': true, vertical }">
		<h2>{{ title }}</h2>
		<div class="column ok-col">
			<button @click="$emit('leave')">OK</button>
		</div>
		<div class="column">
			<textarea
				ref="textArea"
				:value="modelValue"
				@input="onValueChanged"
				@keydown.stop
				@keypress.stop
			/>
		</div>
		<div class="column error-col" v-if="error">{{ error }}</div>
		<div class="column">
			<button @click="insertText('\\\\')" class="style-button">Insert \</button>
			<button @click="insertText('\\{')" class="style-button">Insert {</button>
			<button @click="insertText('\\}')" class="style-button">Insert }</button>
		</div>
		<p class="hint-col">Apply style to selected text:</p>
		<div class="column">
			<button
				@click="insertCommand('b')"
				class="style-button"
				style="font-weight: bold"
			>
				Bold
			</button>
			<button
				@click="insertCommand('i')"
				class="style-button"
				style="font-style: italic"
			>
				Italics
			</button>
			<button @click="insertCommand('plain')" class="style-button">
				Plain
			</button>
			<button
				@click="insertCommand('edited')"
				class="style-button edited-style"
			>
				Edited
			</button>
			<button
				@click="insertCommand('k', 2)"
				class="style-button"
				style="letter-spacing: 5px"
			>
				Kerning
			</button>
		</div>
		<div class="column">
			<button @click="insertCommand('alpha', 0.5)" class="style-button">
				Alpha
			</button>
		</div>
		<div class="column">
			<button
				@click="insertCommand('size', 12)"
				class="style-button"
				style="font-size: 20px"
			>
				Font size
			</button>
			<select v-model="selectedFont" class="style-button">
				<option value>Font</option>
				<option value="aller" style="font-family: aller">
					Aller (Textbox)
				</option>
				<option value="riffic" style="font-family: riffic">
					Riffic (Bold text)
				</option>
				<option value="hashtag" style="font-family: hashtag">
					Hashtag (Sayori)
				</option>
				<option value="ammy_handwriting" style="font-family: ammy_handwriting">
					Ammy's Handwriting (Natsuki)
				</option>
				<option value="journal" style="font-family: journal">
					Journal (Monika)
				</option>
				<option value="jp_hand_slanted" style="font-family: jp_hand_slanted">
					JP Hand Slanted (Yuri)
				</option>
				<option
					value="damagrafik_script"
					style="font-family: damagrafik_script"
				>
					Damagrafik (Yuri, Act 2)
				</option>
				<option value="as_i_lay_dying" style="font-family: as_i_lay_dying">
					As I Lay Dying (Yuri, Act Unused)
				</option>
				<option value="halogen" style="font-family: halogen">
					Halogen (MC)
				</option>
			</select>
			<button @click="selectColor('text')" class="style-button">
				Text color
			</button>
			<button @click="selectColor('outline')" class="style-button">
				Outline color
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import Color from '../color/color.vue';
import { TextRenderer } from '@/renderer/textRenderer/textRenderer';
import { defineComponent } from 'vue';
import getConstants from '@/constants';

export default defineComponent({
	inheritAttrs: false,
	components: { Color },
	props: {
		modelValue: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			default: '',
		},
	},
	data: () => ({
		colorSelector: '' as '' | 'text' | 'outline',
		selectedFont: '',
		selectedColor: '#000000',
		rememberedStart: 0,
		rememberedEnd: 0,
		error: '',
	}),
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
	},
	watch: {
		selectedFont() {
			if (this.selectedFont === '') return;
			this.insertCommand('font', this.selectedFont);
			this.selectedFont = '';
		},
	},
	methods: {
		onValueChanged() {
			const constants = getConstants();
			const val = (this.$refs.textArea as HTMLTextAreaElement).value;
			try {
				// tslint:disable-next-line: no-unused-expression
				new TextRenderer(val, constants.TextBox.NameboxTextStyle);
				this.error = '';
			} catch (e) {
				this.error = (e as Error).message;
			}
			this.$emit('update:modelValue', val);
		},
		selectColor(colorSelector: '' | 'text' | 'outline') {
			const el = this.$refs.textArea as HTMLTextAreaElement;
			this.colorSelector = colorSelector;
			this.rememberedStart = el.selectionStart;
			this.rememberedEnd = el.selectionEnd;
		},
		applyColor() {
			const color = this.selectedColor;
			const colorSelector = this.colorSelector;
			const apply = () => {
				const el = this.$refs.textArea as HTMLTextAreaElement;
				if (!el) {
					this.$nextTick(apply);
					return;
				}
				el.selectionStart = this.rememberedStart;
				el.selectionEnd = this.rememberedEnd;
				this.insertCommand(
					colorSelector === 'text' ? 'color' : 'outlinecolor',
					color
				);
			};
			this.$nextTick(apply);
			this.selectedColor = '#000000';
			this.colorSelector = '';
		},
		insertText(text: string) {
			const el = this.$refs.textArea as HTMLTextAreaElement;
			const val = el.value;
			const selStart = el.selectionStart;
			const selEnd = el.selectionEnd;
			el.value = val.slice(0, selStart) + text + val.slice(selEnd);
			el.selectionStart = el.selectionEnd = selStart + text.length;
			el.focus();
			this.onValueChanged();
		},
		insertCommand(command: string, arg?: any) {
			const el = this.$refs.textArea as HTMLTextAreaElement;
			const val = el.value;
			const selStart = el.selectionStart;
			const selEnd = el.selectionEnd;
			const selectedText = val.slice(selStart, selEnd);
			const before = val.slice(0, selStart);
			const after = val.slice(selEnd);
			let commandOpen = command;
			if (arg) {
				commandOpen += '=' + arg;
			}
			el.value = `${before}{${commandOpen}}${selectedText}{/${command}}${after}`;
			el.selectionStart = selStart + commandOpen.length + 2;
			el.selectionEnd = el.selectionStart + selectedText.length;
			el.focus();
			this.onValueChanged();
		},
	},
});
</script>

<style lang="scss" scoped>
.text-subpanel {
	display: flex;
	flex-wrap: wrap;
	//flex-flow: nowrap;

	h2 {
		font-size: 20px;
		//noinspection CssOverwrittenProperties
		color: $default-text;
		//noinspection CssOverwrittenProperties
		color: var(--text);
		font-family: riffic, sans-serif;
		text-align: center;
	}

	&.vertical {
		flex-direction: row;
		width: 100%;

		.column {
			width: 100%;

			button,
			select {
				width: 100%;
			}
		}

		textarea {
			height: 128px;
		}
	}

	.error-col {
		color: #880000;
	}

	&:not(.vertical) {
		flex-direction: column;
		@include height-100();

		h2 {
			writing-mode: vertical-rl;
			height: inherit;
			width: min-content;
		}

		.column {
			display: flex;
			@include height-100();
			flex-direction: column;
			flex-wrap: wrap;

			textarea {
				@include height-100();
			}
		}

		.hint-col {
			width: 64px;
			margin: 4px;
		}

		.error-col {
			height: 100%;
			width: 168px;
		}

		.ok-col {
			width: 32px;

			button {
				@include height-100();
			}
		}
	}
}

.hex-selector {
	display: table;

	label {
		text-align: right;
		width: 100px;
	}

	input {
		margin-left: 7px;
	}

	&.vertical {
		> * {
			display: table-row;
		}
	}

	&:not(.vertical) {
		> * {
			display: table-cell;
			vertical-align: middle;
		}
	}
}

#color-swatches {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-evenly;

	&.vertical {
		margin-top: 4px;
		width: 100%;
		flex-direction: row;
	}

	&:not(.vertical) {
		margin-left: 4px;
		height: 100%;
		flex-direction: column;
	}

	.swatch {
		height: 42px;
		width: 42px;
		margin: 1px;
		border-color: black;
	}
}

.style-button {
	padding: 4px;
}

.edited-style {
	color: white;
	text-shadow: 0 6px 0.3px #000, 1px 6px 0.3px #000, 2px 5px 0.3px #000,
		3px 5px 0.3px #000, 4px 4px 0.3px #000, 5px 3px 0.3px #000,
		5px 2px 0.3px #000, 7px 1px 0.3px #000, 6px 0 0.3px #000,
		6px -1px 0.3px #000, 5px -2px 0.3px #000, 5px -3px 0.3px #000,
		4px -4px 0.3px #000, 3px -5px 0.3px #000, 2px -5px 0.3px #000,
		1px -6px 0.3px #000, 0 -6px 0.3px #000, -1px -6px 0.3px #000,
		-2px -5px 0.3px #000, -3px -5px 0.3px #000, -4px -4px 0.3px #000,
		-5px -3px 0.3px #000, -5px -2px 0.3px #000, -6px -1px 0.3px #000,
		-6px 0 0.3px #000, -6px 1px 0.3px #000, -5px 2px 0.3px #000,
		-5px 3px 0.3px #000, -4px 4px 0.3px #000, -3px 5px 0.3px #000,
		-2px 5px 0.3px #000, -1px 6px 0.3px #000, 0 6px 0 #000, 1px 6px 0 #000,
		2px 5px 0 #000, 3px 5px 0 #000, 4px 4px 0 #000, 5px 3px 0 #000,
		5px 2px 0 #000, 7px 1px 0 #000, 6px 0 0 #000, 6px -1px 0 #000,
		5px -2px 0 #000, 5px -3px 0 #000, 4px -4px 0 #000, 3px -5px 0 #000,
		2px -5px 0 #000, 1px -6px 0 #000, 0 -6px 0 #000, -1px -6px 0 #000,
		-2px -5px 0 #000, -3px -5px 0 #000, -4px -4px 0 #000, -5px -3px 0 #000,
		-5px -2px 0 #000, -6px -1px 0 #000, -6px 0 0 #000, -6px 1px 0 #000,
		-5px 2px 0 #000, -5px 3px 0 #000, -4px 4px 0 #000, -3px 5px 0 #000,
		-2px 5px 0 #000, -1px 6px 0 #000, 0 5px 0 #000, 1px 5px 0 #000,
		2px 4px 0 #000, 3px 4px 0 #000, 4px 3px 0 #000, 4px 2px 0 #000,
		5px 1px 0 #000, 5px 0 0 #000, 5px -1px 0 #000, 4px -2px 0 #000,
		4px -3px 0 #000, 3px -4px 0 #000, 2px -4px 0 #000, 1px -5px 0 #000,
		0 -5px 0 #000, -1px -5px 0 #000, -2px -4px 0 #000, -3px -4px 0 #000,
		-4px -3px 0 #000, -4px -2px 0 #000, -5px -1px 0 #000, -5px 0 0 #000,
		-5px 1px 0 #000, -4px 2px 0 #000, -4px 3px 0 #000, -3px 4px 0 #000,
		-2px 4px 0 #000, -1px 5px 0 #000, 0 4px 0 #000, 1px 4px 0 #000,
		2px 3px 0 #000, 3px 3px 0 #000, 3px 2px 0 #000, 4px 1px 0 #000, 4px 0 0 #000,
		4px -1px 0 #000, 3px -2px 0 #000, 3px -3px 0 #000, 2px -3px 0 #000,
		1px -4px 0 #000, 0 -4px 0 #000, -1px -4px 0 #000, -2px -3px 0 #000,
		-3px -3px 0 #000, -3px -2px 0 #000, -4px -1px 0 #000, -4px 0 0 #000,
		-4px 1px 0 #000, -3px 2px 0 #000, -3px 3px 0 #000, -2px 3px 0 #000,
		-1px 4px 0 #000, 0 3px 0 #000, 1px 3px 0 #000, 2px 2px 0 #000,
		3px 1px 0 #000, 3px 0 0 #000, 1px -3px 0 #000, 2px -2px 0 #000,
		3px -1px 0 #000, 0 -3px 0 #000, -1px -3px 0 #000, -2px -2px 0 #000,
		-3px -1px 0 #000, -3px 0 0 #000, -1px 3px 0 #000, -2px 2px 0 #000,
		-3px 1px 0 #000, 0 2px 0 #000, 1px 2px 0 #000, 2px 1px 0 #000, 2px 0 0 #000,
		1px -2px 0 #000, 2px -1px 0 #000, 0 -2px 0 #000, -1px -2px 0 #000,
		-2px -1px 0 #000, -2px 0 0 #000, -1px 2px 0 #000, -2px 1px 0 #000,
		0 1px 0 #000, 1px 1px 0 #000, 1px 0 0 #000, 1px -1px 0 #000, 0 -1px 0 #000,
		-1px -1px 0 #000, -1px 0 0 #000, -1px 1px 0 #000;
}
</style>
