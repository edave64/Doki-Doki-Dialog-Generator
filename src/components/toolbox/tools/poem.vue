<template>
	<div class="panel">
		<h1>{{ object.subType === 'poem' ? 'Poem' : 'Console' }}</h1>
		<text-editor
			v-if="textEditor"
			title="Poem Text"
			v-model="text"
			@leave="textEditor = false"
		/>
		<template v-else>
			<div id="notification_text">
				<label for="notification_text">Text:</label>
				<textarea v-model="text" id="notification_text" @keydown.stop />
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
			<position-and-size :obj="object" />
			<layers :object="object" />
			<toggle v-model="flip" label="Flip?" />
			<delete :obj="object" />
		</template>
	</div>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import { PanelMixin } from './panelMixin';
import TextEditor from '../subtools/text/text.vue';
import { IPoem } from '@/store/objectTypes/poem';
import {
	poemBackgrounds,
	poemTextStyles,
	IPoemTextStyle,
} from '@/constants/poem';
import { defineComponent } from 'vue';
import { genericSetable } from '@/util/simpleSettable';

const setable = genericSetable<IPoem>();

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Delete,
		TextEditor,
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
		flip: setable('flip', 'objects/setFlip'),
		text: setable('text', 'objects/setPoemText'),
		autoWrap: setable('autoWrap', 'objects/setAutoWrapping'),
		poemStyle: setable('font', 'objects/setPoemFont'),
		poemBackground: setable('background', 'objects/setPoemBackground'),
	},
});
</script>

<style lang="scss" scoped>
fieldset {
	> .list {
		* {
			overflow: hidden;
			width: 100%;
			height: 24px;
			text-overflow: ellipsis;
			padding: 2px;

			&.active {
				background-color: #ffbde1;
			}
		}
	}
}

.current_button {
	input {
		width: 145px;
	}
}

.panel {
	&.vertical {
		#notification_text {
			width: 173px;

			textarea {
				width: 100%;
			}
		}

		fieldset.buttons {
			width: 100%;

			> .list {
				max-height: 200px;
				width: 172px;

				* {
					width: 100%;
					text-overflow: ellipsis;
					padding: 2px;
				}
			}
		}
	}

	textarea {
		display: block;
		height: 114px;
	}
}

.panel:not(.vertical) {
	.list {
		max-height: 140px;
		max-width: 172px;
	}
}
</style>
