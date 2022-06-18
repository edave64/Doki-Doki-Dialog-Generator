<template>
	<div
		:class="{ part: true, active: part?.active }"
		:style="style"
		@click="$emit('click')"
		@contextmenu="quickClick"
	></div>
</template>

<script lang="ts">
import { getAAsset, getAsset } from '@/asset-manager';
import { IAsset } from '@/render-utils/assets/asset';
import { ImageAsset } from '@/render-utils/assets/image-asset';
import { IAssetSwitch } from '@/store/content';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent, Prop } from 'vue';

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

const spriteSize = 960;

export default defineComponent({
	props: {
		part: {
			required: true,
		} as Prop<DeepReadonly<IPartButtonImage>>,
		value: {
			required: true,
		},
		size: {
			type: Number,
			default: 150,
		},
	},
	data: () => ({
		lookups: [] as Array<IAsset | null>,
		loaded: false,
	}),
	computed: {
		scaleX(): number {
			return this.size / this.part!.size[0];
		},
		scaleY(): number {
			return this.size / this.part!.size[1];
		},
		backgroundSize(): string {
			return `${Math.floor(spriteSize * this.scaleX)}px ${Math.floor(
				spriteSize * this.scaleY
			)}px`;
		},
		backgroundPosition(): string {
			return (
				`${Math.floor(this.part!.offset[0] * -this.scaleX)}px ` +
				`${Math.floor(this.part!.offset[1] * -this.scaleY)}px`
			);
		},
		background() {
			let ret = '';
			const size = this.backgroundSize;
			const globalOffset = this.part!.offset || [0, 0];
			for (let i = 0; i < this.part!.images.length; ++i) {
				const image = this.part!.images[i];
				const lookup = this.lookups[i];
				if (!(lookup instanceof ImageAsset)) continue;
				if (i > 0) ret += ', ';
				const localOffset = image.offset || [0, 0];
				const pos =
					`${Math.floor(
						(globalOffset[0] - localOffset[0]) * -this.scaleX
					)}px ` +
					`${Math.floor((globalOffset[1] - localOffset[1]) * -this.scaleY)}px`;
				ret += `url('${lookup.html.src.replace("'", "\\'")}') ${pos} / ${size}`;
			}
			return ret;
		},
		style(): { [id: string]: string } {
			return {
				height: this.size + 'px',
				width: this.size + 'px',
				background: this.background,
			};
		},
	},
	async created() {
		this.lookups = await Promise.all(
			this.part!.images.map((image) => {
				if (typeof image.asset === 'string') {
					return getAsset(image.asset, false);
				} else {
					return getAAsset(image.asset, false);
				}
			})
		);
	},
	methods: {
		quickClick(e: MouseEvent) {
			e.preventDefault();
			this.$emit('quick-click');
		},
	},
});
</script>

<style lang="scss" scoped>
.part {
	margin-top: 4px;
	text-shadow: 0 0 2px black;
	color: white;
	//noinspection CssOverwrittenProperties
	box-shadow: inset 0 0 1px 3px $default-modal-backdrop;
	//noinspection CssOverwrittenProperties
	box-shadow: inset 0 0 1px 3px var(--modal-backdrop);
	text-align: center;
	user-select: none;
	vertical-align: middle;

	&.active {
		//noinspection CssOverwrittenProperties
		box-shadow: inset 0 0 1px 3px $default-modal-backdrop-light;
		//noinspection CssOverwrittenProperties
		box-shadow: inset 0 0 1px 3px var(--modal-backdrop-light);
		background-color: $default-modal-backdrop-light !important;
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
