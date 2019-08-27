<template>
	<div :class="{ panel: true, vertical }" v-if="isWebPSupported !== undefined">
		<h1>Add doki</h1>
		<div
			class="doki"
			v-for="doki of dokis"
			:key="doki.id"
			:title="doki.name"
			@click="$emit('chosen', doki.id.toLowerCase())"
		>
			<img :src="assetPath(doki)" :alt="doki.name" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported, IDoki, dokiOrder } from '../../asset-manager';

@Component({
	components: {},
})
export default class AddPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;

	private isWebPSupported: boolean | null = null;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get dokis(): Array<IDoki<any>> {
		return dokiOrder;
	}

	private assetPath(doki: IDoki<any>) {
		return `${process.env.BASE_URL}/assets/chibis/${doki.internalId}.lq.${
			this.isWebPSupported ? 'webp' : 'png'
		}`.replace(/\/+/, '/');
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