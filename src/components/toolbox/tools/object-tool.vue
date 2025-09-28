<template>
	<div class="panel" ref="root">
		<h1
			:style="{ fontStyle: hasLabel ? 'italic' : 'normal' }"
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
				<p class="modal-text">Enter the new name</p>
				<p class="modal-text">
					<input
						v-model="modalNameInput"
						style="width: 100%"
						@keydown.enter.prevent.stop="renameOption('Apply')"
					/>
				</p>
			</modal-dialog>
		</teleport>
		<text-formatting
			v-if="textHandler"
			:title="textHandler.title"
			:modelValue="textHandler.get()"
			@update:modelValue="textHandler.set($event)"
			@leave="textHandler.leave()"
		/>
		<color-picker
			v-else-if="finalColorHandler"
			:title="finalColorHandler.title"
			:modelValue="finalColorHandler.get()"
			@update:modelValue="finalColorHandler.set($event)"
			@leave="finalColorHandler.leave()"
		/>
		<image-options
			v-else-if="imageOptionsOpen"
			type="object"
			:panel-id="object.panelId"
			:id="object.id"
			@leave="imageOptionsOpen = false"
		/>
		<slot v-else-if="showAltPanel" name="alt-panel" />
		<template v-else>
			<slot />
			<position-and-size :obj="object" />
			<layer-btns :object="object" />
			<d-fieldset title="Transform" class="transforms">
				<toggle-box v-model="flip" label="Flip?" />
				<label for="linked_to" class="v-w100">Linked with:</label>
				<select
					id="linked_to"
					class="v-w100"
					v-model="transformLink"
					@keydown.stop
				>
					<option value="">None</option>
					<option
						v-for="[id, label] in linkObjectList"
						:key="id"
						:value="id"
					>
						{{ label }}
					</option>
				</select>
				<table class="input-table v-w100">
					<tbody>
						<tr>
							<td>
								<label for="rotation" class="v-w100"
									>Rotation:&nbsp;°</label
								>
							</td>
							<td>
								<input
									id="rotation"
									class="smol v-w100"
									type="number"
									v-model="rotation"
									@keydown.stop
								/>
							</td>
						</tr>
						<!-- A sprite that hasn't yet been reimported from an old version should not be resized -->
						<template v-if="allowZoom">
							<tr>
								<td>
									<label for="zoom" class="v-w100">{{
										easterEgg ? 'Zoom' : 'Scale X'
									}}</label>
								</td>
								<td>
									<input
										id="zoom"
										type="number"
										class="smol v-w100"
										step="1"
										min="0"
										v-model="scaleX"
										@keydown.stop
									/>
								</td>
							</tr>
							<tr v-if="!easterEgg">
								<td>
									<label for="zoom" class="v-w100"
										>Scale Y:
									</label>
								</td>
								<td>
									<input
										id="zoom"
										type="number"
										class="smol v-w100"
										step="1"
										min="0"
										v-model="scaleY"
										@keydown.stop
									/>
								</td>
							</tr>
						</template>
						<tr>
							<td>
								<label for="zoom" class="v-w100"
									>Skew X:
								</label>
							</td>
							<td>
								<input
									id="zoom"
									type="number"
									class="smol v-w100"
									step="1"
									v-model="skewX"
									@keydown.stop
								/>
							</td>
						</tr>
						<tr>
							<td>
								<label for="zoom" class="v-w100"
									>Skew Y:
								</label>
							</td>
							<td>
								<input
									id="zoom"
									type="number"
									class="smol v-w100"
									step="1"
									v-model="skewY"
									@keydown.stop
								/>
							</td>
						</tr>
						<tr>
							<td colspan="2" v-if="!easterEgg">
								<toggle-box
									v-model="preserveRatio"
									label="Lock scale ratio?"
								/>
							</td>
						</tr>
					</tbody>
				</table>
				<slot name="transform" />
			</d-fieldset>

			<slot name="options" />
			<d-fieldset v-if="hasLabel" title="Textbox settings">
				<toggle-box
					label="Enlarge when talking"
					v-model="enlargeWhenTalking"
					v-if="
						object.type === 'character' || object.type === 'sprite'
					"
				/>
				<toggle-box
					label="Own textbox color"
					v-model="useCustomTextboxColor"
				/>
				<table>
					<tbody>
						<tr v-if="useCustomTextboxColor">
							<td>
								<label for="textbox_color">Color:</label>
							</td>
							<td>
								<button
									id="textbox_color"
									class="color-button"
									:style="{
										background: object.textboxColor ?? '',
									}"
									@click="selectTextboxColor"
								/>
							</td>
						</tr>
						<tr>
							<td>
								<label for="namebox_width"
									>Namebox width:</label
								>
							</td>
							<td>
								<input
									id="namebox_width"
									type="number"
									:placeholder="defaultNameboxWidth + ''"
									v-model.lazy="nameboxWidth"
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</d-fieldset>
			<button @click="imageOptionsOpen = true">Image options</button>
			<button class="v-bt0" @click="copy">Copy</button>
			<delete-btn class="v-bt0" :obj="object" />
		</template>
	</div>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import ModalDialog from '@/components/modal-dialog.vue';
import DeleteBtn from '@/components/toolbox/commons-fieldsets/delete-btn.vue';
import LayerBtns from '@/components/toolbox/commons-fieldsets/layer-btns.vue';
import PositionAndSize from '@/components/toolbox/commons-fieldsets/position-and-size.vue';
import ColorPicker from '@/components/toolbox/subtools/color/color-picker.vue';
import ImageOptions from '@/components/toolbox/subtools/image-options/image-options.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import getConstants from '@/constants';
import { transaction } from '@/history-engine/transaction';
import { allowScaleModification } from '@/store/migrations/v2-5';
import type { GenObject } from '@/store/object-types/object';
import { state } from '@/store/root';
import { propWithTransaction } from '@/util/simple-settable';
import { computed, ref } from 'vue';
import TextFormatting from '../subtools/text/text-formatting.vue';

const props = withDefaults(
	defineProps<{
		object: GenObject;
		title: string;
		textHandler?: Handler;
		colorHandler?: Handler;
		showAltPanel?: boolean;
	}>(),
	{
		showAltPanel: false,
	}
);

const root = ref(null! as HTMLElement);

setupPanelMixin(root);

const object = computed(() => props.object);

const transformLink = propWithTransaction(object, 'linkedTo');

const imageOptionsOpen = ref(false);
const modalNameInput = ref('');
const showRename = ref(false);
const localColorHandler = ref(null as Handler | null);

const flip = propWithTransaction(object, 'flip');
const rotation = propWithTransaction(object, 'rotation');
const enlargeWhenTalking = propWithTransaction(object, 'enlargeWhenTalking');

const allowZoom = computed(() => {
	return allowScaleModification(props.object);
});

const currentPanel = computed(() => {
	return state.panels.panels[props.object.panelId];
});

const linkObjectList = computed((): [GenObject['id'], string][] => {
	const panel = currentPanel.value;

	const ret: [GenObject['id'], string][] = [];

	for (const id of [...panel.lowerOrder, ...panel.topOrder]) {
		const obj = panel.objects[id];
		if (obj.label === null || obj === props.object) continue;
		ret.push([id, obj.label!]);
	}
	return ret;
});

// Don't think about it. Don't question it.
const easterEgg = location.search.includes('alex');

const preserveRatio = propWithTransaction(object, 'preserveRatio');
const nameboxWidth = propWithTransaction(object, 'nameboxWidth');

const scaleX = computed({
	get(): number {
		return props.object.scaleX * 100;
	},
	set(zoom: number): void {
		transaction(() => {
			object.value.scaleX = zoom / 100;
		});
	},
});

const scaleY = computed({
	get(): number {
		return props.object.scaleY * 100;
	},
	set(zoom: number): void {
		transaction(() => {
			object.value.scaleY = zoom / 100;
		});
	},
});

const skewX = propWithTransaction(object, 'skewX');
const skewY = propWithTransaction(object, 'skewY');

const defaultNameboxWidth = computed(() => getConstants().TextBox.NameboxWidth);
const finalColorHandler = computed(
	() => localColorHandler.value || props.colorHandler || null
);
const hasLabel = computed(() => props.object.label !== null);
const heading = computed(() => props.object.label ?? props.title ?? 'Object');
const useCustomTextboxColor = computed({
	get(): boolean {
		return props.object.textboxColor !== null;
	},
	set(val: boolean) {
		transaction(() => {
			object.value.textboxColor = val
				? getConstants().TextBoxCustom.textboxDefaultColor
				: null;
		});
	},
});

function copy() {
	transaction(async () => {
		/*
		TODO: Implement copy
		await store.dispatch('panels/copyObjectToClipboard', {
			panelId: props.object.panelId,
			id: props.object.id,
		} as ICopyObjectToClipboardAction);
		 */
	});
}

function enableNameEdit() {
	modalNameInput.value = props.object.label ?? '';
	showRename.value = true;
}

function renameOption(option: string) {
	showRename.value = false;
	if (option === 'Apply') {
		transaction(() => {
			object.value.label = modalNameInput.value;
		});
	}
}

function selectTextboxColor() {
	localColorHandler.value = {
		title: 'Textbox color',
		get: () => props.object.textboxColor,
		set: (color: string) => {
			transaction(() => {
				object.value.textboxColor = color;
			});
		},
		leave: () => {
			localColorHandler.value = null;
		},
	} as Handler;
}

export interface Handler {
	title: string;
	get: () => string;
	set: (value: string) => void;
	leave: () => void;
}
</script>

<style lang="scss" scoped>
.panel:not(.vertical) {
	.transforms {
		height: 100%;
		:deep(fieldset) {
			max-height: 100%;
			height: 100%;
			overflow: auto;
		}
	}
}

.panel.vertical {
	.input-table {
		width: 100%;
	}
}

.input-table {
	input {
		width: 64px;
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
dialog.modal-rename {
	padding: 4px;

	p {
		font-family: aller, sans-serif;
		font-size: 24px;
	}
}
</style>
