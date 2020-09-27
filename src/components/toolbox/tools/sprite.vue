<template>
	<object-tool :object="object" title="Custom Sprite" />
</template>

<script lang="ts">
import ObjectTool from '@/components/toolbox/tools/object-tool.vue';
import { ISprite } from '@/store/objectTypes/sprite';
import { PanelMixin } from './panelMixin';
import { defineComponent } from 'vue';

export default defineComponent({
	mixins: [PanelMixin],
	components: { ObjectTool },
	computed: {
		object(): ISprite {
			const obj = this.$store.state.objects.objects[
				this.$store.state.ui.selection!
			];
			if (obj.type !== 'sprite') return undefined!;
			return obj as ISprite;
		},
	},
});
</script>
