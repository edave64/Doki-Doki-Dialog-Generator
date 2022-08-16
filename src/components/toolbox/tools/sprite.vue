<template>
	<object-tool :object="object" title="Custom Sprite" />
</template>

<script lang="ts">
import ObjectTool from '@/components/toolbox/tools/object-tool.vue';
import { ISprite } from '@/store/objectTypes/sprite';
import { IPanel } from '@/store/panels';
import { DeepReadonly } from 'ts-essentials';
import { PanelMixin } from './panelMixin';
import { defineComponent } from 'vue';

export default defineComponent({
	mixins: [PanelMixin],
	components: { ObjectTool },
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		object(): ISprite {
			const obj = this.currentPanel.objects[this.$store.state.ui.selection!];
			if (obj.type !== 'sprite') return undefined!;
			return obj as ISprite;
		},
	},
});
</script>
