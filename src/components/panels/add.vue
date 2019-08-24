<template>
	<div :class="{ panel: true, vertical }" v-if="isWebPSupported !== undefined">
		<h1>Add doki</h1>
		<div
			class="doki"
			v-for="doki of dokis"
			:key="doki"
			:title="doki"
			@click="$emit('chosen', doki.toLowerCase())"
		>
			<img :src="assetPath(doki)" :alt="doki" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported } from '../../asset-manager';

interface IDoki {
	id: string;
	name: string;
}

@Component({
	components: {},
})
export default class AddPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;

	private isWebPSupported: boolean | null = null;
	private dokis: string[] = ['Monika', 'Natsuki', 'Sayori', 'Yuri'];

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private assetPath(doki: string) {
		return `${process.env.BASE_URL}/assets/chibis/${doki.toLowerCase()}.lq.${
			this.isWebPSupported ? 'webp' : 'png'
		}`.replace(/\/+/, '/');
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
	&:not(.vertical) {
		justify-content: center;
	}

	&.vertical {
		.doki {
			text-align: center;
		}
	}
}
</style>