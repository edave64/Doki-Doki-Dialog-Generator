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
import { transaction } from '@/history-engine/transaction';
import { useViewport } from '@/hooks/use-viewport';
import type { IAssetSwitch } from '@/store/content';
import CharacterStore from '@/store/object-types/character';
import { state } from '@/store/root';
import type { Character } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { computed } from 'vue';

const emit = defineEmits<{
	'show-dialog': [search: string];
}>();

const viewport = useViewport();
const characters = computed(() => {
	return state.content.current.characters;
});

const panel = computed(() => state.panels.panels[viewport.value.currentPanel]);

function assetPath(character: Character<IAssetSwitch>) {
	return character.chibi
		? environment.supports.lq
			? character.chibi.lq
			: character.chibi.hq
		: '';
}

function onChosen(id: string) {
	transaction(async () => {
		CharacterStore.create(panel.value, id);
	});
}
</script>

<style lang="scss" scoped>
.character img {
	max-height: 72px;
	max-width: 72px;
}
</style>
