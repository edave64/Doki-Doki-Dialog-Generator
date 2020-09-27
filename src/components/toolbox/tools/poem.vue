<template>
	<object-tool
		:object="object"
		:title="object.subType === 'poem' ? 'Poem' : 'Console'"
		:textHandler="textHandler"
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
					>{{ background.name }}</option
				>
			</select>
			<select v-model="poemStyle" @keydown.stop>
				<option
					v-for="(style, idx) of poemTextStyles"
					:value="idx"
					:key="idx"
					>{{ style.name }}</option
				>
			</select>
		</template>
	</object-tool>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import { PanelMixin } from './panelMixin';
import { IPoem } from '@/store/objectTypes/poem';
import {
	poemBackgrounds,
	poemTextStyles,
	IPoemTextStyle,
} from '@/constants/poem';
import { defineComponent } from 'vue';
import { genericSetable } from '@/util/simpleSettable';
import ObjectTool, { Handler } from './object-tool.vue';

const setable = genericSetable<IPoem>();

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		ObjectTool,
	},
	data: () => ({
		textEditor: false,
	}),
	computed: {
		backgrounds(): Array<{ name: string; file: string }> {
			return poemBackgrounds;
		},
		poemTextStyles(): IPoemTextStyle[] {
			return poemTextStyles;
		},
		object(): IPoem {
			const obj = this.$store.state.objects.objects[
				this.$store.state.ui.selection!
			];
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
		text: setable('text', 'objects/setPoemText'),
		autoWrap: setable('autoWrap', 'objects/setAutoWrapping'),
		poemStyle: setable('font', 'objects/setPoemFont'),
		poemBackground: setable('background', 'objects/setPoemBackground'),
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
