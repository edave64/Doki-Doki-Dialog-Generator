<template>
	<fieldset v-if="value === colorBackground">
		<legend>Settings:</legend>
		<label for="bg_color">Color:</label>
		<input id="bg_color" type="color" v-model="value.color" @input="$emit('invalidate-render')" />
	</fieldset>
	<fieldset v-else>
		<legend>Settings:</legend>
		<table>
			<tr>
				<td colspan="3">
					<toggle v-model="value.flip" label="Flipped?" @input="$emit('invalidate-render')" />
				</td>
			</tr>
			<tr v-if="isVariant">
				<td>
					<button @click="value.seekVariant(-1, nsfw);$emit('invalidate-render')">&lt;</button>
				</td>
				<td>Variant</td>
				<td>
					<button @click="value.seekVariant(1, nsfw);$emit('invalidate-render')">&gt;</button>
				</td>
			</tr>
		</table>
	</fieldset>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IBackground, color, Background } from '../../../models/background';
import { VariantBackground } from '../../../models/variant-background';
import { isWebPSupported } from '../../../asset-manager';
import Toggle from '../../Toggle.vue';
import { State } from 'vuex-class-decorator';

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
}
</script>

<style lang="scss" scoped>
fieldset {
	min-height: 135px;
}
</style>