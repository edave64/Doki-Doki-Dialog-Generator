<template>
	<div class="panel">
		<image-options
			v-if="imageOptionsOpen"
			type="object"
			title="Custom Sprite"
			:id="object.id"
			@leave="imageOptionsOpen = false"
		/>
		<template v-else>
			<h1>Custom Sprite</h1>
			<position-and-size :obj="object" />
			<layers :object="object" />
			<toggle v-model="flip" label="Flip?" />
			<button @click="imageOptionsOpen = true">Image options</button>
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
import { ISprite } from '@/store/objectTypes/sprite';
import { PanelMixin } from './panelMixin';
import { defineComponent } from 'vue';
import { genericSetable } from '@/util/simpleSettable';

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Delete,
		ImageOptions,
	},
	data: () => ({
		imageOptionsOpen: false,
	}),
	computed: {
		object(): ISprite {
			const obj = this.$store.state.objects.objects[
				this.$store.state.ui.selection!
			];
			if (obj.type !== 'sprite') return undefined!;
			return obj as ISprite;
		},
		flip: genericSetable<ISprite>()('flip', 'objects/setFlip'),
	},
});
</script>
