<!--
	A tool that is shown when a notification object is selected.
-->
<template>
	<object-tool
		ref="root"
		:object="object"
		title="Notification"
		:textHandler="textHandler"
	>
		<template v-slot:default>
			<div id="notification_text_wrapper">
				<label for="notification_text">Text:</label>
				<textarea v-model="text" id="notification_text" @keydown.stop />
				<button @click="textEditor = true">Formatting</button>
			</div>
		</template>
		<template v-slot:options>
			<toggle-box v-model="renderBackdrop" label="Show backdrop?" />
		</template>
	</object-tool>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import ToggleBox from '@/components/ui/d-toggle.vue';
import type Notification from '@/store/object-types/notification';
import { state } from '@/store/root';
import type { Viewport } from '@/store/viewport';
import { propWithTransaction } from '@/util/simple-settable';
import { computed, inject, ref, type Ref } from 'vue';
import ObjectTool, { type Handler } from './object-tool.vue';

const root = ref(null! as HTMLElement);

setupPanelMixin(root);

const viewport = inject<Ref<Viewport>>('viewport')!;

const currentPanel = computed(() => {
	return state.panels.panels[viewport.value.currentPanel];
});
const object = computed((): Notification => {
	const obj = currentPanel.value.objects[viewport.value.selection!];
	if (obj.type !== 'notification') return undefined!;
	return obj as Notification;
});

const text = propWithTransaction(object, 'text');
const renderBackdrop = propWithTransaction(object, 'backdrop');

const textEditor = ref(false);

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
</script>

<style lang="scss" scoped>
.current_button {
	input {
		width: 145px;
	}
}

.panel {
	&.vertical {
		#notification_text_wrapper {
			width: 173px;

			textarea {
				width: 100%;
			}
		}

		fieldset.buttons {
			width: 100%;
		}
	}

	textarea {
		display: block;
		height: 114px;
	}
}
</style>
