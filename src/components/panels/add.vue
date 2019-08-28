<template>
	<div :class="{ panel: true, vertical }" v-if="isWebPSupported !== undefined">
		<h1>Add character</h1>
		<div
			class="character"
			v-for="character of characters"
			:key="character.id"
			:title="character.name"
			@click="$emit('chosen', character.id.toLowerCase())"
		>
			<img :src="assetPath(character)" :alt="character.name" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
	isWebPSupported,
	ICharacter,
	characterOrder,
} from '../../asset-manager';

@Component({
	components: {},
})
export default class AddPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;

	private isWebPSupported: boolean | null = null;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get characters(): Array<ICharacter<any>> {
		return characterOrder;
	}

	private assetPath(character: ICharacter<any>) {
		return `${process.env.BASE_URL}/assets/chibis/${character.internalId}.lq.${
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
		.character {
			text-align: center;
		}
	}
}
</style>