<template>
	<div class="panel">
		<h1>Notification</h1>
		<text-editor
			v-if="textEditor"
			title="Notification Text"
			v-model="text"
			@leave="textEditor = false"
		/>
		<image-options
			v-else-if="imageOptionsOpen"
			type="object"
			title="Notification"
			:id="object.id"
			@leave="imageOptionsOpen = false"
		/>
		<template v-else>
			<div id="notification_text">
				<label for="notification_text">Text:</label>
				<textarea v-model="text" id="notification_text" @keydown.stop />
				<button @click="textEditor = true">Formatting</button>
			</div>
			<position-and-size :obj="object" />
			<toggle label="Auto line wrap?" v-model="autoWrap" />
			<layers :object="object" />
			<toggle v-model="flip" label="Flip?" />
			<toggle v-model="renderBackdrop" label="Show backdrop?" />
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
import { PanelMixin } from './panelMixin';
import TextEditor from '../subtools/text/text.vue';
import { INotification } from '../../../store/objectTypes/notification';
import { defineComponent } from 'vue';
import { genericSetable } from '@/util/simpleSettable';

const setable = genericSetable<INotification>();

export default defineComponent({
	mixins: [PanelMixin],
	components: {
		Toggle,
		PositionAndSize,
		Layers,
		Delete,
		TextEditor,
		ImageOptions,
	},
	data: () => ({
		imageOptionsOpen: false,
		textEditor: false,
	}),
	computed: {
		object(): INotification {
			const obj = this.$store.state.objects.objects[
				this.$store.state.ui.selection!
			];
			if (obj.type !== 'notification') return undefined!;
			return obj as INotification;
		},
		flip: setable('flip', 'objects/setFlip'),
		autoWrap: setable('autoWrap', 'objects/setAutoWrapping'),
		text: setable('text', 'objects/setNotificationText'),
		renderBackdrop: setable('backdrop', 'objects/setNotificationBackdrop'),
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
