<template>
	<div class="panel">
		<h1
			:style="{ fontStyle: this.hasLabel ? 'italic' : 'normal' }"
			@click="enableNameEdit"
		>
			{{ heading }}
			<span class="icon material-icons">edit</span>
		</h1>
		<teleport to="#modal-messages">
			<modal-dialog
				:options="['Apply', 'Cancel']"
				no-base-size
				class="modal-rename"
				v-if="showRename"
				@option="renameOption"
				@leave="renameOption('Cancel')"
			>
				<p class="modal-text">
					Enter the new name
				</p>
				<p class="modal-text">
					<input v-model="modalNameInput" style="width: 100%" />
				</p>
			</modal-dialog>
		</teleport>
		<text-editor
			v-if="textHandler"
			:title="textHandler.title"
			:modelValue="textHandler.get()"
			@update:modelValue="textHandler.set($event)"
			@leave="textHandler.leave()"
		/>
		<color
			v-else-if="finalColorHandler"
			:title="finalColorHandler.title"
			:modelValue="finalColorHandler.get()"
			@update:modelValue="finalColorHandler.set($event)"
			@leave="finalColorHandler.leave()"
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
			<d-fieldset v-if="hasLabel" title="Textbox settings">
				<toggle
					label="Enlarge when talking"
					v-model="enlargeWhenTalking"
					v-if="object.type === 'character' || object.type === 'sprite'"
				/>
				<toggle
					label="Use custom textbox color"
					v-model="useCustomTextboxColor"
				/>
				<table>
					<tr v-if="useCustomTextboxColor">
						<td>
							<label for="textbox_color">Color:</label>
						</td>
						<td>
							<button
								id="textbox_color"
								class="color-button"
								:style="{ background: object.textboxColor }"
								@click="selectTextboxColor"
							/>
						</td>
					</tr>
					<tr>
						<td>
							<label for="namebox_width">Namebox width:</label>
						</td>
						<td>
							<input
								id="namebox_width"
								type="number"
								:placeholder="defaultNameboxWidth"
								v-model.lazy="nameboxWidth"
							/>
						</td>
					</tr>
				</table>
			</d-fieldset>
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
import {
	ICopyObjectToClipboardAction,
	IObject,
	ISetLabelMutation,
	ISetNameboxWidthMutation,
	ISetTextBoxColor,
} from '@/store/objects';
import ModalDialog from '@/components/ModalDialog.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import { textboxDefaultColor } from '@/constants/textBoxCustom';
import { NameboxWidth } from '@/constants/textBox';

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
		ModalDialog,
		DFieldset,
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
		canEdit: true,
		modalNameInput: '',
		showRename: false,
		localColorHandler: null as Handler | null,
	}),
	computed: {
		flip: setable('flip', 'objects/setFlip'),
		rotation: setable('rotation', 'objects/setRotation'),
		enlargeWhenTalking: setable(
			'enlargeWhenTalking',
			'objects/setEnlargeWhenTalking'
		),
		nameboxWidth: {
			get(): string {
				const val = this.object.nameboxWidth;
				if (val === null) return '';
				return val + '';
			},
			set(value: string) {
				const val = value.trim() === '' ? null : parseInt(value);
				this.vuexHistory.transaction(async () => {
					this.$store.commit('objects/setObjectNameboxWidth', {
						id: this.object.id,
						nameboxWidth: val,
					} as ISetNameboxWidthMutation);
				});
			},
		},
		defaultNameboxWidth(): number {
			return NameboxWidth;
		},
		finalColorHandler(): Handler | null {
			return this.localColorHandler || this.colorHandler || null;
		},
		hasLabel(): boolean {
			return this.object.label !== null;
		},
		heading(): string {
			console.log('heading', this.object.label, this.title, 'Object');
			return this.object.label || this.title || 'Object';
		},
		useCustomTextboxColor: {
			get(): boolean {
				return this.object.textboxColor !== null;
			},
			set(val: boolean) {
				this.vuexHistory.transaction(async () => {
					this.$store.commit('objects/setTextboxColor', {
						id: this.object.id,
						textboxColor: val ? textboxDefaultColor : null,
					} as ICopyObjectToClipboardAction);
				});
			},
		},
	},
	methods: {
		copy() {
			this.vuexHistory.transaction(async () => {
				this.$store.dispatch('objects/copyObjectToClipboard', {
					id: this.object.id,
				} as ICopyObjectToClipboardAction);
			});
		},
		enableNameEdit() {
			this.modalNameInput = this.object.label || '';
			this.showRename = true;
		},
		renameOption(option: 'Apply' | 'Cancel') {
			this.showRename = false;
			if (option === 'Apply') {
				this.vuexHistory.transaction(async () => {
					this.$store.commit('objects/setLabel', {
						id: this.object.id,
						label: this.modalNameInput,
					} as ISetLabelMutation);
				});
			}
		},
		selectTextboxColor() {
			this.localColorHandler = {
				title: 'Textbox color',
				get: () => this.object.textboxColor,
				set: (color: string) => {
					this.vuexHistory.transaction(async () => {
						this.$store.commit('objects/setTextboxColor', {
							id: this.object.id,
							textboxColor: color,
						} as ISetTextBoxColor);
					});
				},
				leave: () => {
					this.localColorHandler = null;
				},
			} as Handler;
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

.color-button {
	height: 24px;
	width: 48px;
	vertical-align: middle;
}

#namebox_width {
	width: 5em;
}
</style>
<style lang="scss">
.modal-rename dialog {
	padding: 4px;
	p {
		font-family: aller;
		font-size: 24px;
	}
}
</style>
