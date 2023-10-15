<!--
	A tool that is shown when a poem object is selected.
-->
<template>
	<object-tool
		:object="object"
		:title="object.subType === 'poem' ? 'Poem' : 'Console'"
		:textHandler="textHandler"
		:colorHandler="colorHandler"
	>
		<div id="poem_text">
			<label for="poem_text">Text:</label>
			<textarea v-model="text" @keydown.stop />
			<button @click="textEditor = true">Formatting</button>
		</div>
		<toggle label="Auto line wrap?" v-model="autoWrap" />
		<template v-if="object.subType === 'poem'">
			<select v-model="poemBackground" @keydown.stop>
				<option
					v-for="(background, idx) of backgrounds"
					:value="idx"
					:key="idx"
				>
					{{ background.name }}
				</option>
			</select>
			<select v-model="poemStyle" @keydown.stop>
				<option v-for="(style, idx) of poemTextStyles" :value="idx" :key="idx">
					{{ style.name }}
				</option>
			</select>
		</template>
		<template v-else>
			<button
				id="console_color"
				class="color-button"
				:style="{ background: object.consoleColor }"
				@click="colorSelect = 'base'"
			>
				Color
			</button>
		</template>
	</object-tool>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import { IPanel } from '@/store/panels';
import { DeepReadonly, UnreachableCaseError } from 'ts-essentials';
import { PanelMixin } from './panel-mixin';
import {
	IPoem,
	ISetTextBoxProperty,
	PoemSimpleProperties,
} from '@/store/objectTypes/poem';
import {
	poemBackgrounds,
	poemTextStyles,
	IPoemTextStyle,
} from '@/constants/game_modes/ddlc/poem';
import { defineComponent } from 'vue';
import { genericSimpleSetter } from '@/util/simpleSettable';
import ObjectTool, { Handler } from './object-tool.vue';
import { transaction } from '@/plugins/vuex-history';

const setableP = genericSimpleSetter<IPoem, PoemSimpleProperties>(
	'panels/setPoemProperty'
);

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		ObjectTool,
	},
	data: () => ({
		textEditor: false,
		colorSelect: '' as '' | 'base',
	}),
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		backgrounds(): Array<{ name: string; file: string }> {
			return poemBackgrounds;
		},
		poemTextStyles(): IPoemTextStyle[] {
			return poemTextStyles;
		},
		object(): IPoem {
			const obj = this.currentPanel.objects[this.$store.state.ui.selection!];
			if (obj.type !== 'poem') return undefined!;
			return obj as IPoem;
		},
		textHandler(): Handler | undefined {
			if (!this.textEditor) return undefined;
			return {
				title: 'Text',
				get: () => {
					return this.text;
				},
				set: (text: string) => {
					this.text = text;
				},
				leave: () => {
					this.textEditor = false;
				},
			};
		},
		colorHandler(): Handler | undefined {
			if (!this.colorSelect) return undefined;
			return {
				title: 'Color',
				get: () => {
					switch (this.colorSelect) {
						case '':
							return '#000000';
						case 'base':
							return this.object.consoleColor;
						default:
							throw new UnreachableCaseError(this.colorSelect);
					}
				},
				set: (color: string) => {
					transaction(() => {
						const panelId = this.currentPanel.id;
						const id = this.object.id;
						if (color === undefined) return;
						this.$store.commit('panels/setPoemProperty', {
							key: 'consoleColor',
							panelId,
							id,
							value: color,
						} as ISetTextBoxProperty<'consoleColor'>);
					});
				},
				leave: () => {
					this.colorSelect = '';
				},
			};
		},
		text: setableP('text'),
		autoWrap: setableP('autoWrap'),
		poemStyle: setableP('font'),
		poemBackground: setableP('background'),
	},
});
</script>

<style lang="scss" scoped>
.panel {
	&.vertical {
		#poem_text {
			width: 173px;

			textarea {
				width: 100%;
			}
		}

		fieldset.buttons {
			width: 100%;
		}
	}
	&:not(.vertical) {
		textarea {
			display: block;
			height: 114px;
		}
	}
}
</style>
@/store/object-types/poem @/util/simple-settable
