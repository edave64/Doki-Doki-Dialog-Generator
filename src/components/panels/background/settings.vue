<template>
	<fieldset v-if="value === colorBackground">
		<legend>Settings:</legend>
		<label for="bg_color">Color:</label>
		<input id="bg_color" type="color" v-model="value.color" @input="$emit('invalidate-render')" />
	</fieldset>
	<fieldset v-else>
		<legend>Settings:</legend>
		<table>
			<tr v-if="isVariant">
				<td>
					<button @click="--value.variant;$emit('invalidate-render')">&lt;</button>
				</td>
				<td>Variant</td>
				<td>
					<button @click="++value.variant;$emit('invalidate-render')">&gt;</button>
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

@Component({
	components: { Toggle },
})
export default class BackgroundSettings extends Vue {
	@Prop({ required: true }) private readonly value!: IBackground;

	private get isVariant() {
		return this.value instanceof VariantBackground;
	}

	private get colorBackground() {
		return color;
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
	min-height: 135px;
}
</style>