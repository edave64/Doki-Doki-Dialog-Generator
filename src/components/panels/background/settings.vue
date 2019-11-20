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
			<template v-if="scaleable">
				<tr>
					<td colspan="3">
						<label for="bgScaling">Scale:</label>
					</td>
				</tr>
				<tr>
					<td colspan="3">
						<select id="bgScaling" v-model="value.scale" @input="$emit('invalidate-render')">
							<option value>None</option>
							<option value="stretch">Stretch</option>
							<option value="cover">Cover</option>
						</select>
					</td>
				</tr>
			</template>
			<tr v-if="installable">
				<td colspan="3">
					<button @click="install">Install</button>
				</td>
			</tr>
			<tr v-if="uninstallable">
				<td colspan="3">
					<button @click="uninstall">Uninstall</button>
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
import environment from '../../../environments/environment';

@Component({
	components: { Toggle },
})
export default class BackgroundSettings extends Vue {
	@Prop({ required: true }) private readonly value!: IBackground;
	@Prop({ required: true, type: Boolean }) private readonly nsfw!: boolean;

	private get isVariant() {
		return (
			this.value instanceof VariantBackground &&
			this.value.hasVariants(this.nsfw)
		);
	}

	private get colorBackground() {
		return color;
	}

	private get installable(): boolean {
		if (!(this.value instanceof Background)) return false;
		if (!this.value.custom) return false;
		if (this.value.installed) return false;
		return environment.isBackgroundInstallingSupported;
	}

	private get uninstallable(): boolean {
		if (!(this.value instanceof Background)) return false;
		if (!this.value.custom) return false;
		if (!this.value.installed) return false;
		return environment.isBackgroundInstallingSupported;
	}

	private get scaleable(): boolean {
		if (!(this.value instanceof Background)) return false;
		return this.value.custom;
	}

	private install() {
		environment.installBackground(this.value as Background);
	}

	private uninstall() {
		environment.uninstallBackground(this.value as Background);
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
	min-height: 135px;
}
</style>