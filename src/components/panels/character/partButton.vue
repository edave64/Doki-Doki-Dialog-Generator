<template>
	<div
		:class="{part: true, active: false/*background === value*/}"
		:style="style"
		@click="$emit('click')"
	></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IBackground, color, Background } from '../../../models/background';
import { VariantBackground } from '../../../models/variant-background';
import {
	isWebPSupported,
	getAsset,
	INsfwAbleImg,
} from '../../../asset-manager';
import environment from '../../../environments/environment';
import { ErrorAsset } from '../../../models/error-asset';

export interface IPartButtonImage {
	image1: string;
	image2?: string;
	image3?: string;
	size: [number, number];
	offset: [number, number];
}

@Component({
	components: {},
})
export default class PartButton extends Vue {
	@Prop({ required: true }) private readonly part!: IPartButtonImage;
	@Prop({ required: true }) private readonly value!: number;
	@Prop({ default: 150, type: Number })
	private readonly size!: number;

	private lookup: HTMLImageElement | ErrorAsset | null = null;
	private lookup2: HTMLImageElement | ErrorAsset | null = null;
	private lookup3: HTMLImageElement | ErrorAsset | null = null;
	private loaded = false;

	private async created() {
		this.lookup = await getAsset(this.part.image1, false);
		this.lookup2 = this.part.image2
			? await getAsset(this.part.image2, false)
			: null;
	}

	private get scaleX(): number {
		return this.size / this.part.size[0];
	}

	private get scaleY(): number {
		return this.size / this.part.size[1];
	}

	private get backgroundSize(): string {
		return `${Math.floor(960 * this.scaleX)}px ${Math.floor(
			960 * this.scaleY
		)}px`;
	}

	private get backgroundPosition(): string {
		return (
			`${Math.floor(this.part.offset[0] * -this.scaleX)}px ` +
			`${Math.floor(this.part.offset[1] * -this.scaleY)}px`
		);
	}

	private get style(): { [id: string]: string } {
		const baseStyle = {
			height: this.size + 'px',
			width: this.size + 'px',
			backgroundPosition: this.backgroundPosition,
			backgroundSize: this.backgroundSize,
		};
		const lq = environment.allowLQ ? '.lq' : '';
		if (this.lookup instanceof HTMLImageElement) {
			if (this.lookup2 instanceof HTMLImageElement) {
				if (this.lookup3 instanceof HTMLImageElement) {
					return {
						backgroundImage: `url(${this.lookup.src}), url(${this.lookup2.src}), url(${this.lookup3.src})`,
						...baseStyle,
					};
				}
				return {
					backgroundImage: `url(${this.lookup.src}), url(${this.lookup2.src})`,
					...baseStyle,
				};
			}
			return {
				backgroundImage: `url(${this.lookup.src})`,
				...baseStyle,
			};
		}
		return {};
	}
}
</script>

<style lang="scss" scoped>
.part {
	margin-top: 4px;
	text-shadow: 0 0 2px black;
	color: white;
	box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
	text-align: center;
	user-select: none;
	vertical-align: middle;

	&.active {
		box-shadow: inset 0 0 1px 3px rgba(255, 255, 255, 0.5);
	}
}

.partList:not(.vertical) .part {
	display: inline-block;
}

.partList.vertical .part {
	display: block;
}
</style>