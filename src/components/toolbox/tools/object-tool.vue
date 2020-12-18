<template>
	<div class="panel">
		<h1>{{ title }}</h1>
		<text-editor
			v-if="textHandler"
			:title="textHandler.title"
			:modelValue="textHandler.get()"
			@update:modelValue="textHandler.set($event)"
			@leave="textHandler.leave()"
		/>
		<color
			v-else-if="colorHandler"
			:title="colorHandler.title"
			:modelValue="colorHandler.get()"
			@update:modelValue="colorHandler.set($event)"
			@leave="colorHandler.leave()"
		/>
		<image-options
			v-else-if="imageOptionsOpen"
			type="object"
			:id="object.id"
			@leave="imageOptionsOpen = false"
		/>
		<slot v-else-if="showAltPanel" name="alt-panel" />
		<template v-else>
			<slot />
			<position-and-size :obj="object" />
			<layers :object="object" />
			<toggle v-model="flip" label="Flip?" />
			<div class="roation-besides">
				<label for="rotation">Rotation: °</label>
				<input id="rotation" type="number" v-model="rotation" @keydown.stop />
			</div>
			<slot name="options" />
			<button @click="imageOptionsOpen = true">Image options</button>
			<button @click="copy">Copy</button>
			<delete :obj="object" />
		</template>
	</div>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import PositionAndSize from '@/components/toolbox/commonsFieldsets/positionAndSize.vue';
import Layers from '@/components/toolbox/commonsFieldsets/layers.vue';
import Delete from '@/components/toolbox/commonsFieldsets/delete.vue';
import ImageOptions from '@/components/toolbox/subtools/image-options/image-options.vue';
import Color from '@/components/toolbox/subtools/color/color.vue';
import { PanelMixin } from './panelMixin';
import TextEditor from '../subtools/text/text.vue';
import { IPoem } from '@/store/objectTypes/poem';
import { defineComponent, PropType } from 'vue';
import { genericSetable } from '@/util/simpleSettable';
import { ICopyObjectToClipboardAction, IObject } from '@/store/objects';

const setable = genericSetable<IPoem>();

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Delete,
		TextEditor,
		ImageOptions,
		Color,
	},
	props: {
		object: {
			type: Object as PropType<IObject>,
			required: true,
		},
		title: String,
		textHandler: {
			type: Object as PropType<Handler>,
		},
		colorHandler: {
			type: Object as PropType<Handler>,
		},
		showAltPanel: Boolean,
	},
	data: () => ({
		imageOptionsOpen: false,
	}),
	computed: {
		flip: setable('flip', 'objects/setFlip'),
		rotation: setable('rotation', 'objects/setRotation'),
	},
	methods: {
		copy() {
			this.vuexHistory.transaction(async () => {
				this.$store.dispatch('objects/copyObjectToClipboard', {
					id: this.object.id,
				} as ICopyObjectToClipboardAction);
			});
		},
	},
});

export interface Handler {
	title: string;
	get: () => string;
	set: (value: string) => void;
	leave: () => void;
}
</script>

<style lang="scss" scoped>
.roation-besides {
	display: flex;
	align-items: baseline;

	label {
		flex-grow: 1;
	}

	#rotation {
		width: 48px;
	}
}
</style>
