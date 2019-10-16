<template>
	<fieldset v-if="value === colorBackground">
		<legend>Settings:</legend>
		<label for="bg_color">Color:</label>
		<input id="bg_color" type="color" v-model="value.color" @input="invalidateRender()" />
	</fieldset>
	<fieldset v-else>
		<legend>Settings:</legend>
		<table>
			<tr>
				<td colspan="3">
					<toggle v-model="value.flip" label="Flipped?" @input="invalidateRender()" />
				</td>
			</tr>
			<tr v-if="isVariant">
				<td>
					<button @click="value.seekVariant(-1, nsfw);invalidateRender()">&lt;</button>
				</td>
				<td>Variant</td>
				<td>
					<button @click="value.seekVariant(1, nsfw);invalidateRender()">&gt;</button>
				</td>
			</tr>
		</table>
	</fieldset>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IBackground, color, Background } from '@/models/background';
import { VariantBackground } from '@/models/variant-background';
import { isWebPSupported } from '@/asset-manager';
import Toggle from '@/components/toggle.vue';
import { State } from 'vuex-class-decorator';
import eventBus, {
	InvalidateRenderEvent,
} from '../../../../eventbus/event-bus';

@Component({
	components: { Toggle },
})
export default class BackgroundSettings extends Vue {
	@Prop({ required: true }) private readonly value!: IBackground;
	@State('nsfw', { namespace: 'ui' }) private readonly nsfw!: boolean;

	private get isVariant() {
		return (
			this.value instanceof VariantBackground &&
			this.value.hasVariants(this.nsfw)
		);
	}

	private get colorBackground() {
		return color;
	}

	private invalidateRender() {
		eventBus.fire(new InvalidateRenderEvent());
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	min-height: 135px;
}
</style>