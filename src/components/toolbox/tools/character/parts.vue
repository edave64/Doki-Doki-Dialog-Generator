<template>
	<d-flow no-wraping @keydown="onKeydown">
		<button @click="emit('leave')" class="h-h100">Back</button>
		<d-flow direction="vertical" class="parts-fnc-btns">
			<d-button
				icon="extension"
				class="h-bl0 v-w100 v-bt0"
				@click="
					emit(
						'show-dialog',
						`type: ${packSearchType} character: ${charData.label}`
					)
				"
			>
				Search in content packs
			</d-button>
			<d-button
				icon="extension"
				class="h-bl0 h-bt0 v-w100 v-bt0"
				@click="
					emit('show-expression-dialog', { character: character.characterType })
				"
				v-if="part === 'head'"
			>
				Create new expressions
			</d-button>
		</d-flow>
		<part-button
			v-for="(part, index) of parts"
			:key="index"
			:value="index"
			:part="part"
			@click="
				choose(index);
				emit('leave');
			"
			@quick-click="choose(index)"
		/>
		<d-fieldset
			v-for="styleComponent of styleComponents"
			:key="styleComponent.name"
			:title="styleComponent.label"
			class="h-h100"
		>
			<d-flow noWraping>
				<part-button
					v-for="(button, id) of styleComponent.buttons"
					:size="130"
					:key="id"
					:value="id"
					:part="button"
					@click="choose_component(styleComponent.name, id)"
				/>
			</d-flow>
		</d-fieldset>
	</d-flow>
</template>

<script lang="ts" setup>
import { isWebPSupported as queryWebPSupport } from '@/asset-manager';
import DButton from '@/components/ui/d-button.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import type { IAssetSwitch } from '@/store/content';
import {
	getData,
	getPose,
	type ICharacter,
	type ISetPartAction,
	type ISetPosePositionMutation,
	type ISetStyleAction,
} from '@/store/object-types/characters';
import { safeAsync } from '@/util/errors';
import { type Pose } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { type DeepReadonly } from 'ts-essentials';
import { computed, type PropType, ref, watch } from 'vue';
import PartButton, {
	type IPartButtonImage,
	type IPartImage,
} from './part-button.vue';

interface IPartStyleGroup {
	label: string;
	name: string;
	buttons: { [id: string]: IPartButtonImage };
}

const props = defineProps({
	character: {
		type: Object as PropType<DeepReadonly<ICharacter>>,
		required: true,
	},
	part: {
		required: true,
		type: String as PropType<string | 'pose' | 'style'>,
	},
});
const store = useStore();
const emit = defineEmits(['leave', 'show-dialog', 'show-expression-dialog']);

const isWebPSupported = ref(null as boolean | null);
// [styleComponentKey, styleComponentValue]
const stylePriorities = ref([] as Array<[string, string]>);

const packSearchType = computed(() => {
	switch (props.part) {
		case 'head':
			return 'Expressions';
		case 'style':
			return 'Styles';
		default:
			return 'Poses';
	}
});

const charData = computed(() => getData(store, props.character));
const styleComponents = computed(() => {
	if (props.part !== 'style') return [];
	const styleComponents =
		charData.value.styleGroups[props.character.styleGroupId];
	return styleComponents.styleComponents.map((component) => {
		const buttons: IPartStyleGroup['buttons'] = {};
		for (const key in component.variants) {
			// eslint-disable-next-line no-prototype-builtins
			if (!component.variants.hasOwnProperty(key)) continue;
			const variant = component.variants[key];
			buttons[key] = {
				size: styleComponents.styles[0].poses[0].size,
				offset: [0, 0],
				images: [{ offset: [0, 0], asset: variant }],
				active: false,
			};
		}
		return { label: component.label, name: component.id, buttons };
	});
});
const parts = computed((): { [id: string]: DeepReadonly<IPartButtonImage> } => {
	const ret: { [id: string]: DeepReadonly<IPartButtonImage> } = {};
	let collection: DeepReadonly<IAssetSwitch[][]>;
	let offset: DeepReadonly<IPartButtonImage['offset']>;
	let size: DeepReadonly<IPartButtonImage['size']>;
	const data = charData.value;
	const currentPose = getPose(data, props.character);
	switch (props.part) {
		case 'head': {
			const activeHeadTypeIdx = props.character.posePositions.headType || 0;
			const activeHeadIdx = props.character.posePositions.head || 0;
			for (
				let headKeyIdx = 0;
				headKeyIdx < currentPose.compatibleHeads.length;
				++headKeyIdx
			) {
				const headKey = currentPose.compatibleHeads[headKeyIdx];
				const heads = data.heads[headKey];
				for (let headIdx = 0; headIdx < heads.variants.length; ++headIdx) {
					const headImages = heads.variants[headIdx];
					ret[`${headKeyIdx}_${headIdx}`] = {
						size: heads.previewSize,
						offset: heads.previewOffset,
						images: headImages.map(
							(image): IPartImage => ({ asset: image, offset: [0, 0] })
						),
						active:
							activeHeadIdx === headIdx && activeHeadTypeIdx === headKeyIdx,
					};
				}
			}
			return ret;
		}
		case 'pose':
			// eslint-disable-next-line no-case-declarations
			const currentStyle =
				data.styleGroups[props.character.styleGroupId].styles[
					props.character.styleId
				];
			for (let poseIdx = 0; poseIdx < currentStyle.poses.length; ++poseIdx) {
				const pose = currentStyle.poses[poseIdx];
				ret[poseIdx] = generatePosePreview(pose);
				(ret[poseIdx] as any).active = poseIdx === props.character.poseId;
			}
			return ret;
		case 'style':
			for (let styleIdx = 0; styleIdx < data.styleGroups.length; ++styleIdx) {
				const styleGroup = data.styleGroups[styleIdx];
				ret[styleGroup.id] = generatePosePreview(styleGroup.styles[0].poses[0]);
				(ret[styleGroup.id] as any).active =
					styleIdx === props.character.styleGroupId;
			}
			return ret;

		default:
			collection = currentPose.positions[props.part];
			size = currentPose.previewSize;
			offset = currentPose.previewOffset;
			break;
	}
	for (let partIdx = 0; partIdx < collection.length; ++partIdx) {
		const part = collection[partIdx];
		ret[partIdx] = {
			images: part.map((partImage: IAssetSwitch) => ({
				offset: [0, 0],
				asset: partImage,
			})),
			size,
			offset,
			active: partIdx === (props.character.posePositions[props.part] || 0),
		};
	}
	return ret;
});

function updateStyleData(): void {
	const baseStyle =
		charData.value.styleGroups[props.character.styleGroupId].styles[
			props.character.styleId
		];
	stylePriorities.value = Object.keys(baseStyle.components).map((key) => [
		key,
		baseStyle.components[key],
	]);
}

function generatePosePreview(
	pose: DeepReadonly<Pose<IAssetSwitch>>
): DeepReadonly<IPartButtonImage> {
	const data = charData.value;
	let images: Array<IPartImage> = [];

	for (const command of pose.renderCommands) {
		switch (command.type) {
			case 'pose-part':
				// eslint-disable-next-line no-case-declarations
				const part = pose.positions[command.part];
				if (part == null || part.length === 0) break;
				images = images.concat(
					part[0].map((x) => ({ asset: x, offset: command.offset }))
				);
				break;
			case 'head': {
				const heads = data.heads[pose.compatibleHeads[0]];
				if (pose.compatibleHeads.length === 0) break;
				const head = heads.variants[0];
				images = images.concat(
					head.map((x) => ({
						asset: x,
						offset: command.offset,
					}))
				);
				break;
			}
			case 'image':
				images = images.concat(
					command.images.map((x) => ({ asset: x, offset: command.offset }))
				);
				break;
		}
	}

	return {
		images,
		size: pose.previewSize,
		offset: pose.previewOffset,
		active: false,
	};
}

function updatePose(styleGroupId?: number) {
	if (styleGroupId == undefined) styleGroupId = props.character.styleGroupId;

	const data = charData.value;
	const styleGroups = data.styleGroups[styleGroupId];
	let selection = styleGroups.styles;
	for (const priority of stylePriorities.value) {
		const subSelect = selection.filter((style) => {
			return style.components[priority[0]] === priority[1];
		});
		if (subSelect.length > 0) selection = subSelect;
	}
	transaction(async () => {
		await store.dispatch('panels/setCharStyle', {
			id: props.character.id,
			panelId: props.character.panelId,
			styleGroupId,
			styleId: styleGroups.styles.indexOf(selection[0]),
		} as ISetStyleAction);
	});
}

function choose(index: string | number) {
	if (props.part === 'style') {
		updatePose(
			charData.value.styleGroups.findIndex((group) => group.id === index)
		);
	} else if (props.part === 'head') {
		const [headTypeIdx, headIdx] = ('' + index)
			.split('_', 2)
			.map((part) => parseInt(part, 10));
		store.commit('panels/setPosePosition', {
			id: props.character.id,
			panelId: props.character.panelId,
			posePositions: {
				headType: headTypeIdx,
				head: headIdx,
			},
		} as ISetPosePositionMutation);
	} else {
		setPart(props.part, parseInt('' + index, 10));
	}
}

function choose_component(component: string, id: string | number) {
	const prioIdx = stylePriorities.value.findIndex(
		(stylePriority) => stylePriority[0] === component
	);
	stylePriorities.value.splice(prioIdx, 1);
	stylePriorities.value.unshift([component, '' + id]);
	updatePose();
}

function onKeydown(e: KeyboardEvent): void {
	if (e.key === 'Backspace' || e.key === 'Escape') {
		emit('leave');
		e.preventDefault();
		e.stopPropagation();
	}
}

function setPart(part: ISetPartAction['part'], index: number): void {
	transaction(async () => {
		await store.dispatch('panels/setPart', {
			id: props.character.id,
			panelId: props.character.panelId,
			part,
			val: index,
		} as ISetPartAction);
	});
}

safeAsync('Initializing parts data', async () => {
	isWebPSupported.value = await queryWebPSupport();
});
watch(() => props.character, updateStyleData, { immediate: true });
</script>

<style lang="scss"></style>

<style lang="scss" scoped>
.horizontal {
	.parts-fnc-btns {
		width: 130px;
		justify-content: center;
	}
}
.icon-button {
	vertical-align: middle;
	width: 100px;
}
</style>
