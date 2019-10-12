<template>
	<div
		:class="{background: true, active: background === value}"
		:title="background.name"
		:style="style"
		@click="$emit('input', background)"
	>{{background.name}}</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IBackground, color, Background } from '@/models/background';
import { VariantBackground } from '@/models/variant-background';
import { isWebPSupported } from '@/asset-manager';

@Component({
	components: {},
})
export default class BackgroundButton extends Vue {
	@Prop({ required: true }) private readonly background!: IBackground;
	@Prop({ required: true }) private readonly value!: IBackground;
	@Prop({ required: true }) private readonly customPathLookup!: {
		[name: string]: string;
	};

	private isWebPSupported: boolean | null = null;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get style(): { [id: string]: string } {
		if (this.background === color) {
			return { backgroundColor: color.color };
		}
		if (this.background instanceof Background) {
			if (this.background.custom) {
				return {
					backgroundImage: `url(${
						this.customPathLookup[this.background.path]
					})`,
				};
			}
			if (this.isWebPSupported === undefined) return {};
			return {
				backgroundImage: `url(${process.env.BASE_URL}/assets/${
					this.background.path
				}.lq.${this.isWebPSupported ? 'webp' : 'png'})`.replace(/\/+/, '/'),
			};
		}
		if (this.background instanceof VariantBackground) {
			if (this.isWebPSupported === undefined) return {};
			return {
				backgroundImage: `url(${process.env.BASE_URL}/assets/${
					this.background.path
				}.lq.${this.isWebPSupported ? 'webp' : 'png'})`.replace(/\/+/, '/'),
			};
		}
		return {};
	}
}
</script>

<style lang="scss" scoped>
.background {
	margin-top: 4px;
	background-size: cover;
	text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
		1px 1px 0 #000;
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
	height: 48px;
	min-height: 48px;
	text-align: center;
	user-select: none;

	&.active {
		box-shadow: inset 0 0 1px 3px rgba(255, 255, 255, 0.5);
	}
}
</style>