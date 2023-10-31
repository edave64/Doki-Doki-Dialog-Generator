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
			<toggle v-model="renderBackdrop" label="Show backdrop?" />
		</template>
	</object-tool>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import Toggle from '@/components/toggle.vue';
import {
	INotification,
	NotificationSimpleProperties,
} from '@/store/object-types/notification';
import { genericSetterSplit } from '@/util/simple-settable';
import { computed, ref } from 'vue';
import ObjectTool, { Handler } from './object-tool.vue';
import { useStore } from '@/store';

const store = useStore();
const root = ref(null! as HTMLElement);

setupPanelMixin(root);

const currentPanel = computed(() => {
	return store.state.panels.panels[store.state.panels.currentPanel];
});
const object = computed((): INotification => {
	const obj = currentPanel.value.objects[store.state.ui.selection!];
	if (obj.type !== 'notification') return undefined!;
	return obj as INotification;
});
const setableN = <K extends NotificationSimpleProperties>(key: K) =>
	genericSetterSplit(
		store,
		object,
		'panels/setNotificationProperty',
		false,
		key
	);
const text = setableN('text');
const renderBackdrop = setableN('backdrop');

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
