<!--
	A tool that is shown when a character object is selected.
-->
<template>
	<object-tool
		ref="root"
		:object="object"
		:title="label"
		:showAltPanel="!!panelForParts"
	>
		<template v-slot:alt-panel>
			<part-selection
				v-if="panelForParts"
				:character="object"
				:part="panelForParts"
				@leave="panelForParts = null"
				@show-dialog="emit('show-dialog', $event)"
				@show-expression-dialog="emit('show-expression-dialog', $event)"
			/>
		</template>
		<template v-slot:default>
			<template v-if="missingHead">
				<p class="warning">
					MISSING Head sprite! Click below to re-upload
					<span style="word-wrap: break-word"
						>"{{ missingHead }}"</span
					>.
				</p>
				<button @click="reuploadHead()">Re-Upload</button>
				<input
					type="file"
					ref="missingHeadUpload"
					@change="onMissingHeadFileUpload"
				/>
			</template>
			<d-fieldset
				v-if="hasMultiplePoses || parts.length > 0 || hasMultipleStyles"
				class="pose-list"
				title="Pose:"
			>
				<table class="button-tbl">
					<tbody>
						<tr v-if="hasMultipleStyles">
							<td class="arrow-col">
								<button @click="seekStyle(-1)">&lt;</button>
							</td>
							<td>
								<button
									class="middle-button"
									@click="panelForParts = 'style'"
								>
									Style
								</button>
							</td>
							<td class="arrow-col">
								<button @click="seekStyle(1)">&gt;</button>
							</td>
						</tr>
						<tr v-if="hasMultiplePoses">
							<td class="arrow-col">
								<button @click="seekPose(-1)">&lt;</button>
							</td>
							<td>
								<button
									class="middle-button"
									@click="panelForParts = 'pose'"
								>
									Pose
								</button>
							</td>
							<td class="arrow-col">
								<button @click="seekPose(1)">&gt;</button>
							</td>
						</tr>
						<tr v-for="part of parts" :key="part">
							<td class="arrow-col">
								<button @click="seekPart(part, -1)">
									&lt;
								</button>
							</td>
							<td>
								<button
									class="middle-button"
									@click="panelForParts = part"
								>
									{{ captialize(part) }}
								</button>
							</td>
							<td class="arrow-col">
								<button @click="seekPart(part, 1)">&gt;</button>
							</td>
						</tr>
					</tbody>
				</table>
			</d-fieldset>
		</template>
		<template v-slot:transform>
			<toggle-box v-model="closeUp" label="Close up?" />
		</template>
	</object-tool>
</template>

<script lang="ts" setup>
import { getAAssetUrl } from '@/asset-manager';
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import DFieldset from '@/components/ui/d-fieldset.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import type { Viewport } from '@/newStore/viewport';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import {
	getData,
	getHeads,
	getParts,
	type ICharacter,
	type ISeekPoseAction,
	type ISeekPosePartAction,
	type ISeekStyleAction,
} from '@/store/object-types/characters';
import { genericSetterMerged } from '@/util/simple-settable';
import { computed, inject, ref, watch, type Ref } from 'vue';
import PartSelection from './character/part-selection.vue';
import ObjectTool from './object-tool.vue';

const emit = defineEmits<{
	'show-dialog': [searchString: string];
	'show-expression-dialog': [
		config: {
			character: string;
		},
	];
}>();

const store = useStore();

const root = ref(null! as HTMLElement);
const missingHeadUpload = ref(null! as HTMLInputElement);
setupPanelMixin(root);

const panelForParts = ref(null as string | null);
const viewport = inject<Ref<Viewport>>('viewport')!;

const currentPanel = computed(
	() => store.state.panels.panels[viewport.value.currentPanel]
);

const selection = computed(() => viewport.value.selection!);
const object = computed(() => {
	const obj = currentPanel.value.objects[selection.value];
	if (obj.type !== 'character') return undefined!;
	return obj as ICharacter;
});
const closeUp = genericSetterMerged(
	store,
	object,
	'panels/setClose',
	false,
	'close'
);
const missingHead = computed(() => {
	const obj = object.value;

	const heads = getHeads(charData.value, obj);
	if (!heads) return null;
	for (const asset of heads.variants) {
		const url = getAAssetUrl(asset[0], false);
		if (url.startsWith('uploads:')) return url.substring(8);
	}
	return null;
});
const charData = computed(() => getData(store, object.value));
const label = computed(() => charData.value.label ?? '');
const parts = computed(() => getParts(charData.value, object.value));
const hasMultipleStyles = computed(
	() =>
		charData.value.styleGroups[object.value.styleGroupId].styles.length >
			1 || charData.value.styleGroups.length > 1
);
const hasMultiplePoses = computed(() => {
	const styleGroup = charData.value.styleGroups[object.value.styleGroupId];
	const style = styleGroup.styles[object.value.styleId];
	return style.poses.length > 1;
});

function reuploadHead() {
	missingHeadUpload.value.click();
}

async function onMissingHeadFileUpload() {
	const uploadInput = missingHeadUpload.value;
	if (!uploadInput.files) return;
	if (uploadInput.files.length !== 1) {
		console.error('More than one file uploaded!');
		return;
	}

	const file = uploadInput.files[0];
	await transaction(async () => {
		const url = URL.createObjectURL(file);
		await store.dispatch('uploadUrls/add', {
			name: missingHead.value,
			url,
		});
	});
}

function seekPose(delta: number): void {
	transaction(async () => {
		await store.dispatch('panels/seekPose', {
			id: object.value.id,
			panelId: object.value.panelId,
			delta,
		} as ISeekPoseAction);
	});
}

function seekStyle(delta: number): void {
	transaction(async () => {
		await store.dispatch('panels/seekStyle', {
			id: object.value.id,
			panelId: object.value.panelId,
			delta,
		} as ISeekStyleAction);
	});
}

function seekPart(part: string, delta: number): void {
	transaction(async () => {
		await store.dispatch('panels/seekPart', {
			id: object.value.id,
			panelId: object.value.panelId,
			delta,
			part,
		} as ISeekPosePartAction);
	});
}

function captialize(str: string) {
	return str.charAt(0).toUpperCase() + str.substring(1);
}

watch(
	() => selection.value,
	() => {
		panelForParts.value = null;
	}
);
</script>

<style lang="scss" scoped>
.panel:not(.vertical) {
	.pose-list {
		height: 100%;
	}
	:deep(fieldset) {
		max-height: 100%;
		height: 100%;
		overflow: auto;
	}
}

.panel.vertical {
	fieldset {
		input {
			width: 60px;
		}
	}
}

.middle-button {
	width: 100%;
}

.arrow-col {
	width: 24px;

	button {
		width: 24px;
	}
}
input[type='file'] {
	display: none;
}

.button-tbl {
	margin: 2px;
	width: calc(100% - 4px);
}
</style>
