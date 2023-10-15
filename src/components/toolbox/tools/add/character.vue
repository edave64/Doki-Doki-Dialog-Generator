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
import { defineComponent } from 'vue';
import { ICreateCharacterAction } from '@/store/objectTypes/characters';
import { IAssetSwitch } from '@/store/content';
import { Character } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import DButton from '@/components/ui/d-button.vue';
import environment from '@/environments/environment';
import { DeepReadonly } from 'ts-essentials';
import { transaction } from '@/plugins/vuex-history';

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
