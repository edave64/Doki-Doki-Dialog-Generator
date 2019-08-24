<template>
	<div :class="{ panel: true, vertical }" v-if="isWebPSupported !== undefined">
		<h1>Background</h1>
		<div
			v-for="background of backgrounds"
			:class="{background: true, active: background === value}"
			:key="background.name"
			:title="background.name"
			:style="{backgroundImage: 'url(' + assetPath(background.path) + ')'}"
			@click="$emit('input', background)"
		>{{background.name}}</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported, backgrounds } from '../../asset-manager';
import { Background } from '../../models/background';

interface IDoki {
	id: string;
	name: string;
}

@Component({
	components: {},
})
export default class BackgroundsPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Background, required: true })
	private readonly value!: Background;

	private isWebPSupported: boolean | null = null;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get backgrounds(): Background[] {
		return backgrounds;
	}

	private assetPath(doki: string) {
		return `/assets/${doki.toLowerCase()}.lq.${
			this.isWebPSupported ? 'webp' : 'png'
		}`;
	}

	private onClick(e: MouseEvent): void {
		const girlSel = this.$el as HTMLDivElement;
		const cx = e.clientX - girlSel.offsetLeft;
		const girl =
			cx < 123 ? 'sayori' : cx < 247 ? 'yuri' : cx < 370 ? 'monika' : 'natsuki';
		this.$emit('chosen', girl);
	}
}
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

.panel {
	.background {
		margin-top: 4px;
		background-size: cover;
		text-shadow: 0 0 2px black;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 0 8px #000000;
		height: 48px;
		min-height: 48px;
		text-align: center;
	}

	&:not(.vertical) {
		.background {
			width: 12rem;
		}
	}

	&.vertical {
		.doki {
			text-align: center;
		}
	}
}
</style>