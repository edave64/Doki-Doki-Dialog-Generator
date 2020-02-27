<template>
	<fieldset>
		<legend>Settings:</legend>
		<template v-if="isColor">
			<label for="bg_color">Color:</label>
			<button
				id="bg_color"
				class="color-button"
				:style="{background: color}"
				@click="$emit('change-color')"
			/>
		</template>
		<table v-if="isVariant">
			<tr>
				<td colspan="3">
					<toggle v-model="flipped" label="Flipped?" />
				</td>
			</tr>
			<tr v-if="hasVariants">
				<td class="arrow-col">
					<button @click="seekVariant(-1)">&lt;</button>
				</td>
				<td style="text-align:center">Variant</td>
				<td class="arrow-col">
					<button @click="seekVariant(1)">&gt;</button>
				</td>
			</tr>
			<tr>
				<td colspan="3">
					<select v-model="scaling" @keydown.stop>
						<option value="0">None</option>
						<option value="1">Stretch</option>
						<option value="2">Cover</option>
					</select>
				</td>
			</tr>
		</table>
	</fieldset>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { isWebPSupported } from '@/asset-manager';
import Toggle from '@/components/toggle.vue';
import { State } from 'vuex-class-decorator';
import { Background } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { IAsset } from '@/store/content';
import { IHistorySupport } from '@/plugins/vuex-history';
import {
	ISetColorMutation,
	ISetFlipMutation,
	ISeekVariantAction,
	ScalingModes,
	ISetScalingMutation,
	IPanel,
} from '@/store/panels';

@Component({
	components: { Toggle },
})
export default class BackgroundSettings extends Vue {
	public $store!: Store<IRootState>;
	private get currentBackgroundId(): string {
		return this.background.current;
	}

	private vuexHistory!: IHistorySupport;

	private get background(): Readonly<IPanel['background']> {
		const currentPanel = this.$store.state.panels.currentPanel;
		return this.$store.state.panels.panels[currentPanel].background;
	}

	private get bgData(): Background<IAsset> | null {
		return (
			this.$store.state.content.current.backgrounds.find(
				background => background.id === this.currentBackgroundId
			) || null
		);
	}

	private get isColor(): boolean {
		return this.currentBackgroundId === 'buildin.static-color';
	}

	private get color(): string {
		return this.background.color;
	}

	private set color(color: string) {
		this.vuexHistory.transaction(() => {
			this.$store.commit('panels/setBackgroundColor', {
				color,
				panelId: this.$store.state.panels.currentPanel,
			} as ISetColorMutation);
		});
	}

	private get flipped(): boolean {
		return this.background.flipped;
	}

	private set flipped(flipped: boolean) {
		this.vuexHistory.transaction(() => {
			this.$store.commit('panels/setBackgroundFlipped', {
				flipped,
				panelId: this.$store.state.panels.currentPanel,
			} as ISetFlipMutation);
		});
	}

	private get scaling(): string {
		return this.background.scaling.toString();
	}

	private set scaling(scaling: string) {
		this.vuexHistory.transaction(() => {
			this.$store.commit('panels/setBackgroundScaling', {
				scaling: parseInt(scaling, 10),
				panelId: this.$store.state.panels.currentPanel,
			} as ISetScalingMutation);
		});
	}

	private get isVariant() {
		return !!this.bgData;
	}

	private get hasVariants() {
		return this.bgData ? this.bgData.variants.length > 1 : false;
	}

	private seekVariant(delta: 1 | -1) {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('panels/seekBackgroundVariant', {
				delta,
				panelId: this.$store.state.panels.currentPanel,
			} as ISeekVariantAction);
		});
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	min-height: 135px;
}

button {
	width: 24px;
}

select {
	width: 100%;
}

table {
	width: 100%;
}

.arrow-col {
	width: 24px;

	button {
		width: 24px;
	}
}

.color-button {
	height: 24px;
	width: 48px;
	vertical-align: middle;
}
</style>