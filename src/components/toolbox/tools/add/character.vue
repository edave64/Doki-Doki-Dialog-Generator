<template>
	<div
		class="character"
		tabindex="0"
		v-for="character of characters"
		:key="character.id"
		:title="character.label"
		@click.left="onChosen(character.id)"
		@keypress.enter.prevent.stop="onChosen(character.id)"
		@keypress.space.prevent.stop="onChosen(character.id)"
	>
		<img :src="assetPath(character)" :alt="character.label" />
	</div>
	<d-button
		class="custom-sprite"
		icon="extension"
		@click="$emit('show-dialog', 'type: Characters')"
	>
		Search in content packs
	</d-button>
</template>

<script lang="ts">
import DButton from '@/components/ui/d-button.vue';
import environment from '@/environments/environment';
import { transaction } from '@/plugins/vuex-history';
import { IAssetSwitch } from '@/store/content';
import { ICreateCharacterAction } from '@/store/object-types/characters';
import { Character } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent } from 'vue';

export default defineComponent({
	emits: ['show-dialog'],
	components: { DButton },
	computed: {
		characters(): DeepReadonly<Array<Character<IAssetSwitch>>> {
			return this.$store.state.content.current.characters;
		},
	},
	methods: {
		assetPath(character: Character<IAssetSwitch>) {
			return character.chibi
				? environment.supports.lq
					? character.chibi.lq
					: character.chibi.hq
				: '';
		},
		onChosen(id: string) {
			transaction(async () => {
				await this.$store.dispatch('panels/createCharacters', {
					characterType: id,
					panelId: this.$store.state.panels.currentPanel,
				} as ICreateCharacterAction);
			});
		},
	},
});
</script>

<style lang="scss" scoped>
.character img {
	max-height: 72px;
	max-width: 72px;
}
</style>
@/store/object-types/characters
