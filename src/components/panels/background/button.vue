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
import { IBackground, color, Background } from '../../../models/background';
import { VariantBackground } from '../../../models/variant-background';
import { isWebPSupported, getAsset } from '../../../asset-manager';
import environment from '../../../environments/environment';
import { ErrorAsset } from '../../../models/error-asset';

@Component({
	components: {},
})
export default class BackgroundButton extends Vue {
	@Prop({ required: true }) private readonly background!: IBackground;
	@Prop({ required: true }) private readonly value!: IBackground;
	@Prop({ required: true }) private readonly customPathLookup!: {
		[name: string]: string;
	};

	private lookup: HTMLImageElement | ErrorAsset | null = null;
	private loaded = false;

	private async created() {
		if (
			this.background instanceof Background ||
			this.background instanceof VariantBackground
		) {
			this.lookup = await getAsset(this.background.path, false);
		}
	}

	private get style(): { [id: string]: string } {
		const lq = environment.allowLQ ? '.lq' : '';
		if (this.background === color) {
			return { backgroundColor: color.color };
		}
		if (this.lookup instanceof HTMLImageElement) {
			return {
				backgroundImage: `url(${this.lookup.src})`,
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
	text-shadow: 0 0 2px black;
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