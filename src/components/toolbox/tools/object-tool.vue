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
			:panel-id="object.panelId"
			:id="object.id"
			@leave="imageOptionsOpen = false"
		/>
		<slot v-else-if="showAltPanel" name="alt-panel" />
		<template v-else>
			<slot />
			<position-and-size :obj="object" />
			<layers :object="object" />
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
import Layers from '@/components/toolbox/commons-fieldsets/layers.vue';
import PositionAndSize from '@/components/toolbox/commons-fieldsets/position-and-size.vue';
import Color from '@/components/toolbox/subtools/color/color.vue';
import ImageOptions from '@/components/toolbox/subtools/image-options/image-options.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import getConstants from '@/constants';
import eventBus, { FailureEvent } from '@/eventbus/event-bus';
import { transaction } from '@/plugins/vuex-history';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import { SceneRenderer } from '@/renderables/scene-renderer';
import { useStore } from '@/store';
import { allowScaleModification } from '@/store/migrations/v2-5';
import type {
	ICopyObjectToClipboardAction,
	IObject,
	ISetLabelMutation,
	ISetLinkMutation,
	ISetNameboxWidthMutation,
	ISetObjectScaleMutation,
	ISetObjectSkewMutation,
	ISetRatioAction,
	ISetTextBoxColor,
} from '@/store/objects';
import { decomposeMatrix } from '@/util/math';
import { genericSetterMerged } from '@/util/simple-settable';
import { computed, type PropType, ref } from 'vue';
import TextEditor from '../subtools/text/text.vue';

const store = useStore();
const root = ref(null! as HTMLElement);
const props = defineProps({
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
});
const setable = <K extends keyof IObject>(prop: K, message: string) =>
	genericSetterMerged(
		store,
		computed(() => props.object),
		message,
		false,
		prop
	);
setupPanelMixin(root);

const transformLink = computed({
	get(): IObject['id'] | '' {
		return props.object.linkedTo ?? '';
	},
	set(value: IObject['id'] | '') {
		const obj = props.object;
		const link = value === '' ? null : value;
		const currentSceneRenderer: SceneRenderer =
			getMainSceneRenderer(store)!;
		const objRender = currentSceneRenderer?.getLastRenderObject(obj.id);
		const linkRender =
			link === null
				? currentSceneRenderer?.getLastRenderObject(obj.linkedTo!)
				: currentSceneRenderer?.getLastRenderObject(link);
		try {
			if (!objRender || !linkRender) {
				store.commit('panels/setLink', {
					panelId: currentPanel.value.id,
					id: obj.id,
					link,
					x: obj.x,
					y: obj.y,
					scaleX: obj.scaleX,
					scaleY: obj.scaleY,
					skewX: obj.skewX,
					skewY: obj.skewY,
					rotation: obj.rotation,
				} as ISetLinkMutation);
			} else if (link == null) {
				store.commit('panels/setLink', {
					panelId: currentPanel.value.id,
					id: obj.id,
					link,
					...decomposeMatrix(objRender.preparedTransform),
				} as ISetLinkMutation);
			} else {
				const inverse = linkRender.preparedTransform.inverse();
				const newTransform = inverse.multiply(
					objRender.preparedTransform
				);
				console.log(objRender.preparedTransform);
				console.log(
					linkRender.preparedTransform.multiply(newTransform)
				);
				console.log(newTransform);
				store.commit('panels/setLink', {
					panelId: currentPanel.value.id,
					id: obj.id,
					link,
					...decomposeMatrix(newTransform!),
				} as ISetLinkMutation);
			}
		} catch (e) {
			if (e instanceof Error) {
				eventBus.fire(new FailureEvent(e.message));
			} else {
				eventBus.fire(new FailureEvent('' + e));
			}
		}
	},
});
const imageOptionsOpen = ref(false);
const modalNameInput = ref('');
const showRename = ref(false);
const localColorHandler = ref(null as Handler | null);

const flip = setable('flip', 'panels/setFlip');
const rotation = setable('rotation', 'panels/setRotation');
const enlargeWhenTalking = setable(
	'enlargeWhenTalking',
	'panels/setEnlargeWhenTalking'
);

const allowZoom = computed(() => {
	return allowScaleModification(props.object);
});

const currentPanel = computed(() => {
	return store.state['panels'].panels[props.object.panelId];
});

const linkObjectList = computed((): [IObject['id'], string][] => {
	const panel = currentPanel.value;

	const ret: [IObject['id'], string][] = [];

	for (const id of [...panel.order, ...panel.onTopOrder]) {
		const obj = panel.objects[id];
		if (obj.label === null || obj === props.object) continue;
		ret.push([id, obj.label!]);
	}
	return ret;
});

// Don't think about it. Don't question it.
const easterEgg = location.search.includes('alex');

const preserveRatio = computed({
	get(): boolean {
		return props.object.preserveRatio;
	},
	set(preserveRatio: boolean) {
		transaction(async () => {
			await store.dispatch('panels/setPreserveRatio', {
				id: props.object.id,
				panelId: props.object.panelId,
				preserveRatio,
			} as ISetRatioAction);
		});
	},
});

const nameboxWidth = computed({
	get(): number | '' {
		const val = props.object.nameboxWidth;
		if (val === null) return '';
		return val;
	},
	set(value: number | '') {
		const val =
			typeof value === 'string' && value.trim() === ''
				? null
				: parseInt(value + '');
		transaction(() => {
			store.commit('panels/setObjectNameboxWidth', {
				id: props.object.id,
				panelId: props.object.panelId,
				nameboxWidth: val,
			} as ISetNameboxWidthMutation);
		});
	},
});

const scaleX = computed({
	get(): number {
		return props.object.scaleX * 100;
	},
	set(zoom: number): void {
		transaction(() => {
			store.commit('panels/setObjectScale', {
				id: props.object.id,
				panelId: props.object.panelId,
				scaleX: zoom / 100,
				scaleY: props.object.preserveRatio
					? (zoom / 100) * props.object.ratio
					: props.object.scaleY,
			} as ISetObjectScaleMutation);
		});
	},
});

const scaleY = computed({
	get(): number {
		return props.object.scaleY * 100;
	},
	set(zoom: number): void {
		transaction(() => {
			store.commit('panels/setObjectScale', {
				id: props.object.id,
				panelId: props.object.panelId,
				scaleX: props.object.preserveRatio
					? zoom / 100 / props.object.ratio
					: props.object.scaleX,
				scaleY: zoom / 100,
			} as ISetObjectScaleMutation);
		});
	},
});

const skewX = computed({
	get(): number {
		return props.object.skewX;
	},
	set(skew: number): void {
		transaction(() => {
			store.commit('panels/setObjectSkew', {
				id: props.object.id,
				panelId: props.object.panelId,
				skewX: skew,
				skewY: props.object.skewY,
			} as ISetObjectSkewMutation);
		});
	},
});

const skewY = computed({
	get(): number {
		return props.object.skewY;
	},
	set(skew: number): void {
		transaction(() => {
			store.commit('panels/setObjectSkew', {
				id: props.object.id,
				panelId: props.object.panelId,
				skewX: props.object.skewX,
				skewY: skew,
			} as ISetObjectSkewMutation);
		});
	},
});

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
			store.commit('panels/setTextboxColor', {
				panelId: props.object.panelId,
				id: props.object.id,
				textboxColor: val
					? getConstants().TextBoxCustom.textboxDefaultColor
					: null,
			} as ICopyObjectToClipboardAction);
		});
	},
});

function copy() {
	transaction(async () => {
		await store.dispatch('panels/copyObjectToClipboard', {
			panelId: props.object.panelId,
			id: props.object.id,
		} as ICopyObjectToClipboardAction);
	});
}

function enableNameEdit() {
	modalNameInput.value = props.object.label ?? '';
	showRename.value = true;
}

function renameOption(option: 'Apply' | 'Cancel') {
	showRename.value = false;
	if (option === 'Apply') {
		transaction(() => {
			store.commit('panels/setLabel', {
				panelId: props.object.panelId,
				id: props.object.id,
				label: modalNameInput.value,
			} as ISetLabelMutation);
		});
	}
}

function selectTextboxColor() {
	localColorHandler.value = {
		title: 'Textbox color',
		get: () => props.object.textboxColor,
		set: (color: string) => {
			transaction(() => {
				store.commit('panels/setTextboxColor', {
					panelId: props.object.panelId,
					id: props.object.id,
					textboxColor: color,
				} as ISetTextBoxColor);
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
