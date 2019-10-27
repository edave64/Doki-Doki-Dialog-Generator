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
		return 162 / this.part.size[0];
	}

	private get scaleY(): number {
		return 162 / this.part.size[1];
	}

	private get backgroundSize(): string {
		return `${(960 * this.scaleX) | 0}px ${(960 * this.scaleY) | 0}px`;
	}

	private get backgroundPosition(): string {
		return (
			`${(this.part.offset[0] * -this.scaleX) | 0}px ` +
			`${(this.part.offset[1] * -this.scaleY) | 0}px`
		);
	}

	private get style(): { [id: string]: string } {
		const lq = environment.allowLQ ? '.lq' : '';
		if (this.lookup instanceof HTMLImageElement) {
			if (this.lookup2 instanceof HTMLImageElement) {
				if (this.lookup3 instanceof HTMLImageElement) {
					return {
						backgroundImage: `url(${this.lookup.src}), url(${this.lookup2.src}), url(${this.lookup3.src})`,
						backgroundPosition: this.backgroundPosition,
						backgroundSize: this.backgroundSize,
					};
				}
				return {
					backgroundImage: `url(${this.lookup.src}), url(${this.lookup2.src})`,
					backgroundPosition: this.backgroundPosition,
					backgroundSize: this.backgroundSize,
				};
			}
			return {
				backgroundImage: `url(${this.lookup.src})`,
				backgroundPosition: this.backgroundPosition,
				backgroundSize: this.backgroundSize,
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
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
	height: 162px;
	width: 162px;
	text-align: center;
	user-select: none;

	&.active {
		box-shadow: inset 0 0 1px 3px rgba(255, 255, 255, 0.5);
	}
}
</style>