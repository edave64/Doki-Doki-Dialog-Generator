<template>
	<object-tool :object="object" title="Notification" :textHandler="textHandler">
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

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import { IPanel } from '@/store/panels';
import { DeepReadonly } from 'ts-essentials';
import ObjectTool, { Handler } from './object-tool.vue';
import { PanelMixin } from './panelMixin';
import {
	INotification,
	NotificationSimpleProperties,
} from '@/store/objectTypes/notification';
import { defineComponent } from 'vue';
import { genericSimpleSetter } from '@/util/simpleSettable';

const setableN = genericSimpleSetter<
	INotification,
	NotificationSimpleProperties
>('panels/setNotificationProperty');

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
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},
		object(): INotification {
			const obj = this.currentPanel.objects[this.$store.state.ui.selection!];
			if (obj.type !== 'notification') return undefined!;
			return obj as INotification;
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
		text: setableN('text'),
		autoWrap: setableN('autoWrap'),
		renderBackdrop: setableN('backdrop'),
	},
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
