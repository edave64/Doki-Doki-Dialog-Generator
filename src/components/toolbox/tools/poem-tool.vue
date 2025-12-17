<!--
	A tool that is shown when a poem/console object is selected.
-->
<template>
	<object-tool
		ref="root"
		:object="object"
		:title="object.subtype === 'poem' ? 'Poem' : 'Console'"
		:textHandler="textHandler"
		:colorHandler="colorHandler"
	>
		<div id="poem_text" class="v-w100">
			<label for="poem_text">Text:</label>
			<textarea
				class="v-w100"
				ref="textarea"
				v-model="text"
				@keydown.stop
			/>
			<button class="w100 bt0" @click="textEditor = true">
				Formatting
			</button>
		</div>
		<toggle-box label="Auto line wrap?" v-model="autoWrap" />
		<toggle-box
			label="Allow overflow?"
			v-model="overflow"
			title="When text is too long, it is shown outside the container. Uses more memory"
		/>
		<template v-if="object.subtype === 'poem'">
			<select v-model="poemBackground" @keydown.stop>
				<option
					v-for="(background, idx) of poemBackgrounds"
					:value="idx"
					:key="idx"
				>
					{{ background.name }}
				</option>
			</select>
			<select v-model="poemStyle" @keydown.stop>
				<option
					v-for="(style, idx) of poemTextStyles"
					:value="idx"
					:key="idx"
				>
					{{ style.name }}
				</option>
			</select>
		</template>
		<template v-else>
			<table>
				<tbody>
					<tr>
						<td style="width: 0">Color:</td>
						<td class="v-w100">
							<button
								id="console_color"
								class="w100"
								:style="{ background: object.consoleColor }"
								style="min-width: 64px"
								@click="colorSelect = 'base'"
							></button>
						</td>
					</tr>
				</tbody>
			</table>
		</template>
	</object-tool>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import ToggleBox from '@/components/ui/d-toggle.vue';
import getConstants from '@/constants';
import {
	poemBackgrounds,
	poemTextStyles,
} from '@/constants/game_modes/ddlc/poem';
import { transaction } from '@/history-engine/transaction';
import { state } from '@/store/root';
import type { Viewport } from '@/store/viewports';
import { propWithTransaction } from '@/util/simple-settable';
import { UnreachableCaseError } from 'ts-essentials';
import { computed, inject, ref, watch, type Ref } from 'vue';
import ObjectTool, { type Handler } from './object-tool.vue';

const root = ref(null! as HTMLElement);
const textarea = ref(null! as HTMLTextAreaElement);
const { vertical } = setupPanelMixin(root);
const textEditor = ref(false);
const colorSelect = ref('' as '' | 'base');

watch(
	() => vertical.value,
	() => {
		textarea.value.style.height = '';
		textarea.value.style.width = '';
	}
);

const viewport = inject<Ref<Viewport>>('viewport')!;

const currentPanel = computed(
	() => state.panels.panels[viewport.value.currentPanel]
);
const object = computed(() => {
	const obj = currentPanel.value.objects[viewport.value.selection!];
	if (obj.type !== 'poem') return undefined!;
	return obj;
});

const textHandler = computed((): Handler | undefined => {
	if (!textEditor.value) return undefined;
	return {
		title: 'Text',
		get: () => {
			return text.value;
		},
		set: (val: string) => {
			text.value = val;
		},
		leave: () => {
			textEditor.value = false;
		},
	};
});
const colorHandler = computed((): Handler | undefined => {
	if (!colorSelect.value) return undefined;
	return {
		title: 'Color',
		get: () => {
			switch (colorSelect.value) {
				case '':
					return '#000000';
				case 'base':
					const constants = getConstants().Poem;
					return (
						object.value.consoleColor ??
						constants.consoleBackgroundColor
					);
				default:
					throw new UnreachableCaseError(colorSelect.value);
			}
		},
		set: (color: string) => {
			transaction(() => {
				if (color === undefined) return;
				object.value.consoleColor = color;
			});
		},
		leave: () => {
			colorSelect.value = '';
		},
	};
});
const text = propWithTransaction(object, 'text');
const autoWrap = propWithTransaction(object, 'autoWrap');
const poemStyle = propWithTransaction(object, 'font');
const overflow = propWithTransaction(object, 'overflow');
const poemBackground = propWithTransaction(object, 'background');
</script>

<style lang="scss" scoped>
.panel {
	&.vertical {
		fieldset.buttons {
			width: 100%;
		}
	}
}

textarea {
	display: block;
	min-height: 128px;
}
</style>
