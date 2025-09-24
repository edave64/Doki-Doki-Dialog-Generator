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
				@click="emit('change-color')"
			/>
		</template>
		<table v-if="isVariant">
			<tbody>
				<tr>
					<td colspan="3">
						<toggle-box v-model="flipped" label="Flipped?" />
					</td>
				</tr>
				<tr v-if="hasVariants">
					<td class="arrow-col">
						<button class="small-button" @click="seekVariant(-1)">
							&lt;
						</button>
					</td>
					<td style="text-align: center">Variant</td>
					<td class="arrow-col">
						<button class="small-button" @click="seekVariant(1)">
							&gt;
						</button>
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
							class="v-w100"
							@click="emit('open-image-options')"
						>
							Image options
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</d-fieldset>
</template>

<script lang="ts" setup>
import DFieldset from '@/components/ui/d-fieldset.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import { useVertical, useViewport } from '@/hooks/use-viewport';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import type { IAssetSwitch } from '@/store/content';
import type {
	ISeekVariantAction,
	ISetColorMutation,
	ISetFlipMutation,
	ISetScalingMutation,
} from '@/store/panels';
import type { Background } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import type { DeepReadonly } from 'ts-essentials';
import { computed } from 'vue';

const emit = defineEmits<{
	'open-image-options': [];
	'change-color': [];
}>();

const store = useStore();

const viewport = useViewport();
const vertical = useVertical();
const background = computed(() => {
	const currentPanel = viewport.value.currentPanel;
	return store.state.panels.panels[currentPanel].background;
});
const flipped = computed({
	get(): boolean {
		return background.value.flipped;
	},
	set(flipped: boolean) {
		transaction(() => {
			store.commit('panels/setBackgroundFlipped', {
				flipped,
				panelId: viewport.value.currentPanel,
			} as ISetFlipMutation);
		});
	},
});
const scaling = computed({
	get(): string {
		return background.value.scaling.toString();
	},

	set(scaling: string) {
		transaction(() => {
			store.commit('panels/setBackgroundScaling', {
				scaling: parseInt(scaling, 10),
				panelId: viewport.value.currentPanel,
			} as ISetScalingMutation);
		});
	},
});
const currentBackgroundId = computed(() => background.value.current);
const bgData = computed((): DeepReadonly<Background<IAssetSwitch>> | null => {
	return (
		store.state.content.current.backgrounds.find(
			(background) => background.id === currentBackgroundId.value
		) || null
	);
});
//#region Static color
const isColor = computed(
	() => currentBackgroundId.value === 'buildin.static-color'
);
const color = computed({
	get(): string {
		return background.value.color;
	},
	set(color: string): void {
		transaction(() => {
			store.commit('panels/setBackgroundColor', {
				color,
				panelId: viewport.value.currentPanel,
			} as ISetColorMutation);
		});
	},
});
//#endregion Static color
//#region Variants
const isVariant = computed(() => !!bgData.value);
const hasVariants = computed(() =>
	bgData.value ? bgData.value.variants.length > 1 : false
);

function seekVariant(delta: 1 | -1) {
	transaction(async () => {
		await store.dispatch('panels/seekBackgroundVariant', {
			delta,
			panelId: viewport.value.currentPanel,
		} as ISeekVariantAction);
	});
}
//#endregion Variants
</script>

<style lang="scss" scoped>
@use '@/styles/fixes.scss';

.bg-settings:not(.vertical) {
	@include fixes.height-100();
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
