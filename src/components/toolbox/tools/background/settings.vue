<template>
	<d-fieldset
		:class="{ 'bg-settings': true, vertical: vertical }"
		title="Settings:"
	>
		<template v-if="isColor">
			<label for="bg_color">Color:</label>
			<button
				id="bg_color"
				class="color-button"
				:style="{ background: color }"
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
					<button class="small-button" @click="seekVariant(-1)">&lt;</button>
				</td>
				<td style="text-align: center">Variant</td>
				<td class="arrow-col">
					<button class="small-button" @click="seekVariant(1)">&gt;</button>
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
			<tr>
				<td colspan="3">
					<button
						id="image_options_button"
						@click="$emit('open-image-options')"
					>
						Image options
					</button>
				</td>
			</tr>
		</table>
	</d-fieldset>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import { Background } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAssetSwitch } from '@/store/content';
import {
	ISetColorMutation,
	ISetFlipMutation,
	ISeekVariantAction,
	ISetScalingMutation,
	IPanel,
} from '@/store/panels';
import { defineComponent } from 'vue';
import { DeepReadonly } from 'ts-essentials';

export default defineComponent({
	components: { Toggle, DFieldset },
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
		color: {
			get(): string {
				return this.background.color;
			},
			set(color: string): void {
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setBackgroundColor', {
						color,
						panelId: this.$store.state.panels.currentPanel,
					} as ISetColorMutation);
				});
			},
		},
		flipped: {
			get(): boolean {
				return this.background.flipped;
			},
			set(flipped: boolean) {
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setBackgroundFlipped', {
						flipped,
						panelId: this.$store.state.panels.currentPanel,
					} as ISetFlipMutation);
				});
			},
		},
		scaling: {
			get(): string {
				return this.background.scaling.toString();
			},

			set(scaling: string) {
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setBackgroundScaling', {
						scaling: parseInt(scaling, 10),
						panelId: this.$store.state.panels.currentPanel,
					} as ISetScalingMutation);
				});
			},
		},
		currentBackgroundId(): string {
			return this.background.current;
		},
		background(): DeepReadonly<IPanel['background']> {
			const currentPanel = this.$store.state.panels.currentPanel;
			return this.$store.state.panels.panels[currentPanel].background;
		},
		bgData(): DeepReadonly<Background<IAssetSwitch>> | null {
			return (
				this.$store.state.content.current.backgrounds.find(
					(background) => background.id === this.currentBackgroundId
				) || null
			);
		},
		isColor(): boolean {
			return this.currentBackgroundId === 'buildin.static-color';
		},
		isVariant(): boolean {
			return !!this.bgData;
		},
		hasVariants(): boolean {
			return this.bgData ? this.bgData.variants.length > 1 : false;
		},
	},
	methods: {
		seekVariant(delta: 1 | -1) {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/seekBackgroundVariant', {
					delta,
					panelId: this.$store.state.panels.currentPanel,
				} as ISeekVariantAction);
			});
		},
	},
});
</script>

<style lang="scss" scoped>
.bg-settings:not(.vertical) {
	@include height-100();
}

.small-button {
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
