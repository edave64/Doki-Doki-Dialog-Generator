<template>
	<div
		:class="{ part: true, active: part?.active }"
		:style="style"
		tabindex="0"
		@click="emit('click')"
		@contextmenu="quickClick"
		@keydown.enter.prevent="emit('click')"
		@keydown.space.prevent="quickClick"
	></div>
</template>

<script lang="ts" setup>
import { getAAssetUrl, getBuildInAssetUrl } from '@/asset-manager';
import type { IAssetSwitch } from '@/store/content';
import { safeAsync } from '@/util/errors';
import type { DeepReadonly } from 'ts-essentials';
import { computed, type PropType, ref } from 'vue';

export interface IPartButtonImage {
	images: IPartImage[];
	size: DeepReadonly<[number, number]>;
	offset: DeepReadonly<[number, number]>;
	active: boolean;
}

export interface IPartImage {
	asset: IAssetSwitch | string;
	offset: DeepReadonly<[number, number]>;
}

const props = defineProps({
	part: {
		required: true,
		type: Object as PropType<DeepReadonly<IPartButtonImage>>,
	},
	value: {
		required: true,
	},
	size: {
		type: Number,
		default: 150,
	},
});
const emit = defineEmits<{
	click: [];
	'quick-click': [];
}>();

const spriteSize = 960;
const lookups = ref([] as string[]);

const scaleX = computed((): number => {
	return props.size / props.part!.size[0];
});
const scaleY = computed((): number => {
	return props.size / props.part!.size[1];
});
const backgroundSize = computed((): string => {
	return `${Math.floor(spriteSize * scaleX.value)}px ${Math.floor(spriteSize * scaleY.value)}px`;
});
const background = computed(() => {
	let ret = '';
	const size = backgroundSize.value;
	const globalOffset = props.part!.offset ?? [0, 0];
	// The indexing in this loop is reversed, since the images are in order of painting, like dddgs render commands,
	// where the last object in the list is drawn last, and thus above all others.
	// Css handles this in reverse, where prior layers are draw above the later ones.
	const max = props.part!.images.length - 1;
	for (let i = 0; i <= max; ++i) {
		const image = props.part!.images[max - i];
		const lookup = lookups.value[max - i];
		if (!lookup) continue;
		if (i > 0) ret += ', ';
		const localOffset = image.offset ?? [0, 0];
		const pos =
			`${Math.floor((globalOffset[0] - localOffset[0]) * -scaleX.value)}px ` +
			`${Math.floor((globalOffset[1] - localOffset[1]) * -scaleY.value)}px`;
		ret += `url('${lookup.replace("'", "\\'")}') ${pos} / ${size}`;
	}
	return ret;
});
const style = computed((): { [id: string]: string } => {
	return {
		height: props.size + 'px',
		width: props.size + 'px',
		background: background.value,
	};
});

function quickClick(e: Event) {
	e.preventDefault();
	emit('quick-click');
}
//#region Init
async function init() {
	lookups.value = await Promise.all(
		props.part!.images.map((image) => {
			if (typeof image.asset === 'string') {
				return getBuildInAssetUrl(image.asset, false);
			} else {
				return getAAssetUrl(image.asset, false);
			}
		})
	);
}

safeAsync('Initialization of parts button', init);
//#endregion Init
</script>

<style lang="scss" scoped>
.part {
	margin-top: 4px;
	text-shadow: 0 0 2px black;
	color: white;
	box-shadow: inset 0 0 1px 3px var(--modal-backdrop);
	text-align: center;
	user-select: none;
	vertical-align: middle;

	&.active {
		box-shadow: inset 0 0 1px 3px var(--modal-backdrop-light);
		background-color: var(--modal-backdrop-light) !important;
	}
}

.partList:not(.vertical) .part {
	display: inline-block;
}

.partList.vertical .part {
	display: block;
}
</style>
