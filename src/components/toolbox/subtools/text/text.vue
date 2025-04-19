<!--
	An advanced text-entry that helps with formatting.
-->
<template>
	<color v-if="colorSelector" v-model="selectedColor" @leave="applyColor" />
	<div v-else :class="{ 'text-subpanel': true, vertical }">
		<h2>{{ title }}</h2>
		<div class="column ok-col">
			<button @click="emit('leave')">OK</button>
		</div>
		<div class="column">
			<textarea
				class="v-w100"
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
				style="letter-spacing: 5px; padding-right: 0"
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
			<select v-model="selectedAlignment" class="style-button">
				<option value>Alignment</option>
				<option value="left" style="text-align: left">Left</option>
				<option value="right" style="text-align: right">Right</option>
				<option value="center" style="text-align: center">Center</option>
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

<script lang="ts" setup>
import getConstants from '@/constants';
import { TextRenderer } from '@/renderer/text-renderer/text-renderer';
import { useStore } from '@/store';
import { computed, nextTick, ref, watch } from 'vue';
import Color from '../color/color.vue';

defineOptions({
	inheritAttrs: false,
});
defineProps({
	modelValue: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		default: '',
	},
});
const store = useStore();
const emit = defineEmits(['update:modelValue', 'leave']);
const textArea = ref(null! as HTMLTextAreaElement);
const colorSelector = ref('' as '' | 'text' | 'outline');
const selectedFont = ref('');
const selectedColor = ref('#000000');
const selectedAlignment = ref('');
const rememberedStart = ref(0);
const rememberedEnd = ref(0);
const error = ref('');

const vertical = computed(() => store.state.ui.vertical);

watch(
	() => vertical.value,
	() => {
		const ta = textArea.value;
		if (ta != null) {
			ta.style.height = '';
			ta.style.width = '';
		}
	}
);

watch(
	() => selectedFont.value,
	() => {
		if (selectedFont.value === '') return;
		insertCommand('font', selectedFont.value);
		selectedFont.value = '';
	}
);

watch(
	() => selectedAlignment.value,
	() => {
		if (selectedAlignment.value === '') return;
		insertText(`{align=${selectedAlignment.value}}`);
		selectedAlignment.value = '';
	}
);

function onValueChanged() {
	const constants = getConstants();
	const val = textArea.value.value;
	try {
		// tslint:disable-next-line: no-unused-expression
		new TextRenderer(val, constants.TextBox.NameboxTextStyle);
		error.value = '';
	} catch (e) {
		error.value = (e as Error).message;
	}
	emit('update:modelValue', val);
}

function selectColor(colorSelector_: '' | 'text' | 'outline') {
	const el = textArea.value;
	colorSelector.value = colorSelector_;
	rememberedStart.value = el.selectionStart;
	rememberedEnd.value = el.selectionEnd;
}

function applyColor() {
	const color = selectedColor.value;
	const colorSelector_ = colorSelector.value;
	const apply = () => {
		const el = textArea.value;
		if (el == null) {
			nextTick(apply);
			return;
		}
		el.selectionStart = rememberedStart.value;
		el.selectionEnd = rememberedEnd.value;
		insertCommand(colorSelector_ === 'text' ? 'color' : 'outlinecolor', color);
	};
	nextTick(apply);
	selectedColor.value = '#000000';
	colorSelector.value = '';
}

function insertText(text: string) {
	const el = textArea.value;
	const val = el.value;
	const selStart = el.selectionStart;
	const selEnd = el.selectionEnd;
	el.value = val.slice(0, selStart) + text + val.slice(selEnd);
	el.selectionStart = el.selectionEnd = selStart + text.length;
	el.focus();
	onValueChanged();
}

function insertCommand(command: string, arg?: string | number) {
	const el = textArea.value;
	const val = el.value;
	const selStart = el.selectionStart;
	const selEnd = el.selectionEnd;
	const selectedText = val.slice(selStart, selEnd);
	const before = val.slice(0, selStart);
	const after = val.slice(selEnd);
	let commandOpen = command;
	if (arg != null) {
		commandOpen += '=' + arg;
	}
	el.value = `${before}{${commandOpen}}${selectedText}{/${command}}${after}`;
	el.selectionStart = selStart + commandOpen.length + 2;
	el.selectionEnd = el.selectionStart + selectedText.length;
	el.focus();
	onValueChanged();
}
</script>

<style lang="scss" scoped>
button {
	line-height: 100%;
}

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
	text-shadow:
		0 6px 0.3px #000,
		1px 6px 0.3px #000,
		2px 5px 0.3px #000,
		3px 5px 0.3px #000,
		4px 4px 0.3px #000,
		5px 3px 0.3px #000,
		5px 2px 0.3px #000,
		7px 1px 0.3px #000,
		6px 0 0.3px #000,
		6px -1px 0.3px #000,
		5px -2px 0.3px #000,
		5px -3px 0.3px #000,
		4px -4px 0.3px #000,
		3px -5px 0.3px #000,
		2px -5px 0.3px #000,
		1px -6px 0.3px #000,
		0 -6px 0.3px #000,
		-1px -6px 0.3px #000,
		-2px -5px 0.3px #000,
		-3px -5px 0.3px #000,
		-4px -4px 0.3px #000,
		-5px -3px 0.3px #000,
		-5px -2px 0.3px #000,
		-6px -1px 0.3px #000,
		-6px 0 0.3px #000,
		-6px 1px 0.3px #000,
		-5px 2px 0.3px #000,
		-5px 3px 0.3px #000,
		-4px 4px 0.3px #000,
		-3px 5px 0.3px #000,
		-2px 5px 0.3px #000,
		-1px 6px 0.3px #000,
		0 6px 0 #000,
		1px 6px 0 #000,
		2px 5px 0 #000,
		3px 5px 0 #000,
		4px 4px 0 #000,
		5px 3px 0 #000,
		5px 2px 0 #000,
		7px 1px 0 #000,
		6px 0 0 #000,
		6px -1px 0 #000,
		5px -2px 0 #000,
		5px -3px 0 #000,
		4px -4px 0 #000,
		3px -5px 0 #000,
		2px -5px 0 #000,
		1px -6px 0 #000,
		0 -6px 0 #000,
		-1px -6px 0 #000,
		-2px -5px 0 #000,
		-3px -5px 0 #000,
		-4px -4px 0 #000,
		-5px -3px 0 #000,
		-5px -2px 0 #000,
		-6px -1px 0 #000,
		-6px 0 0 #000,
		-6px 1px 0 #000,
		-5px 2px 0 #000,
		-5px 3px 0 #000,
		-4px 4px 0 #000,
		-3px 5px 0 #000,
		-2px 5px 0 #000,
		-1px 6px 0 #000,
		0 5px 0 #000,
		1px 5px 0 #000,
		2px 4px 0 #000,
		3px 4px 0 #000,
		4px 3px 0 #000,
		4px 2px 0 #000,
		5px 1px 0 #000,
		5px 0 0 #000,
		5px -1px 0 #000,
		4px -2px 0 #000,
		4px -3px 0 #000,
		3px -4px 0 #000,
		2px -4px 0 #000,
		1px -5px 0 #000,
		0 -5px 0 #000,
		-1px -5px 0 #000,
		-2px -4px 0 #000,
		-3px -4px 0 #000,
		-4px -3px 0 #000,
		-4px -2px 0 #000,
		-5px -1px 0 #000,
		-5px 0 0 #000,
		-5px 1px 0 #000,
		-4px 2px 0 #000,
		-4px 3px 0 #000,
		-3px 4px 0 #000,
		-2px 4px 0 #000,
		-1px 5px 0 #000,
		0 4px 0 #000,
		1px 4px 0 #000,
		2px 3px 0 #000,
		3px 3px 0 #000,
		3px 2px 0 #000,
		4px 1px 0 #000,
		4px 0 0 #000,
		4px -1px 0 #000,
		3px -2px 0 #000,
		3px -3px 0 #000,
		2px -3px 0 #000,
		1px -4px 0 #000,
		0 -4px 0 #000,
		-1px -4px 0 #000,
		-2px -3px 0 #000,
		-3px -3px 0 #000,
		-3px -2px 0 #000,
		-4px -1px 0 #000,
		-4px 0 0 #000,
		-4px 1px 0 #000,
		-3px 2px 0 #000,
		-3px 3px 0 #000,
		-2px 3px 0 #000,
		-1px 4px 0 #000,
		0 3px 0 #000,
		1px 3px 0 #000,
		2px 2px 0 #000,
		3px 1px 0 #000,
		3px 0 0 #000,
		1px -3px 0 #000,
		2px -2px 0 #000,
		3px -1px 0 #000,
		0 -3px 0 #000,
		-1px -3px 0 #000,
		-2px -2px 0 #000,
		-3px -1px 0 #000,
		-3px 0 0 #000,
		-1px 3px 0 #000,
		-2px 2px 0 #000,
		-3px 1px 0 #000,
		0 2px 0 #000,
		1px 2px 0 #000,
		2px 1px 0 #000,
		2px 0 0 #000,
		1px -2px 0 #000,
		2px -1px 0 #000,
		0 -2px 0 #000,
		-1px -2px 0 #000,
		-2px -1px 0 #000,
		-2px 0 0 #000,
		-1px 2px 0 #000,
		-2px 1px 0 #000,
		0 1px 0 #000,
		1px 1px 0 #000,
		1px 0 0 #000,
		1px -1px 0 #000,
		0 -1px 0 #000,
		-1px -1px 0 #000,
		-1px 0 0 #000,
		-1px 1px 0 #000;
}
</style>
