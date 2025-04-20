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
		@click="emit('show-dialog', 'type: Characters')"
	>
		Search in content packs
	</d-button>
</template>

<script lang="ts" setup>
import DButton from '@/components/ui/d-button.vue';
import environment from '@/environments/environment';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import type { IAssetSwitch } from '@/store/content';
import type { ICreateCharacterAction } from '@/store/object-types/characters';
import type { Character } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { computed } from 'vue';

const store = useStore();
const emit = defineEmits<{
	'show-dialog': [search: string];
}>();

const characters = computed(() => {
	return store.state.content.current.characters;
});

function assetPath(character: Character<IAssetSwitch>) {
	return character.chibi
		? environment.supports.lq
			? character.chibi.lq
			: character.chibi.hq
		: '';
}

function onChosen(id: string) {
	transaction(async () => {
		await store.dispatch('panels/createCharacters', {
			characterType: id,
			panelId: store.state.panels.currentPanel,
		} as ICreateCharacterAction);
	});
}
</script>

<style lang="scss" scoped>
.character img {
	max-height: 72px;
	max-width: 72px;
}
</style>
