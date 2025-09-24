<!--
	A tool that is shown when a poem/console object is selected.
-->
<template>
	<object-tool
		ref="root"
		:object="object"
		:title="object.subType === 'poem' ? 'Poem' : 'Console'"
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
		<template v-if="object.subType === 'poem'">
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
import {
	poemBackgrounds,
	poemTextStyles,
} from '@/constants/game_modes/ddlc/poem';
import type { Viewport } from '@/newStore/viewport';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import type {
	IPoem,
	ISetTextBoxProperty,
	PoemSimpleProperties,
} from '@/store/object-types/poem';
import { genericSetterSplit } from '@/util/simple-settable';
import { UnreachableCaseError } from 'ts-essentials';
import { computed, inject, ref, watch, type Ref } from 'vue';
import ObjectTool, { type Handler } from './object-tool.vue';

const store = useStore();
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
	() => store.state.panels.panels[viewport.value.currentPanel]
);
const object = computed((): IPoem => {
	const obj = currentPanel.value.objects[viewport.value.selection!];
	if (obj.type !== 'poem') return undefined!;
	return obj as IPoem;
});

const setableP = <K extends PoemSimpleProperties>(k: K) =>
	genericSetterSplit<IPoem, K>(
		store,
		object,
		'panels/setPoemProperty',
		false,
		k
	);
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
					return object.value.consoleColor;
				default:
					throw new UnreachableCaseError(colorSelect.value);
			}
		},
		set: (color: string) => {
			transaction(() => {
				const panelId = currentPanel.value.id;
				const id = object.value.id;
				if (color === undefined) return;
				store.commit('panels/setPoemProperty', {
					key: 'consoleColor',
					panelId,
					id,
					value: color,
				} as ISetTextBoxProperty<'consoleColor'>);
			});
		},
		leave: () => {
			colorSelect.value = '';
		},
	};
});
const text = setableP('text');
const autoWrap = setableP('autoWrap');
const poemStyle = setableP('font');
const overflow = setableP('overflow');
const poemBackground = setableP('background');
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
