<template>
	<div
		:class="{ part: true, active: part?.active }"
		:style="style"
		tabindex="0"
		@click="$emit('click')"
		@contextmenu="quickClick"
		@keydown.enter.prevent="$emit('click')"
		@keydown.space.prevent="quickClick"
	></div>
</template>

<script lang="ts">
import { getAAssetUrl, getBuildInAssetUrl } from '@/asset-manager';
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
		lookups: [] as string[],
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
			const globalOffset = this.part!.offset ?? [0, 0];
			// The indexing in this loop is reversed, since the images are in order of painting, like dddgs render commands,
			// where the last object in the list is drawn last, and thus above all others.
			// Css handles this in reverse, where prior layers are draw above the later ones.
			const max = this.part!.images.length - 1;
			for (let i = 0; i <= max; ++i) {
				const image = this.part!.images[max - i];
				const lookup = this.lookups[max - i];
				if (!lookup) continue;
				if (i > 0) ret += ', ';
				const localOffset = image.offset ?? [0, 0];
				const pos =
					`${Math.floor(
						(globalOffset[0] - localOffset[0]) * -this.scaleX
					)}px ` +
					`${Math.floor((globalOffset[1] - localOffset[1]) * -this.scaleY)}px`;
				ret += `url('${lookup.replace("'", "\\'")}') ${pos} / ${size}`;
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
					return getBuildInAssetUrl(image.asset, false);
				} else {
					return getAAssetUrl(image.asset, false);
				}
			})
		);
	},
	methods: {
		quickClick(e: KeyboardEvent) {
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