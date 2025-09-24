<template>
	<button class="v-w100" @click="addTextBox">Textbox</button>
	<button class="v-w100 v-bt0" @click="addPoem">Poem</button>
	<button class="v-w100 v-bt0" @click="addDialog">Notification</button>
	<button class="v-w100 v-bt0" @click="addChoice">Choice</button>
	<button class="v-w100 v-bt0" @click="addConsole">Console</button>
</template>

<script lang="ts" setup>
import { useViewport } from '@/hooks/use-viewport';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';

const store = useStore();
const viewport = useViewport();
async function addTextBox() {
	return await createUiElement('createTextBox');
}
async function addChoice() {
	return await createUiElement('createChoice');
}
async function addDialog() {
	return await createUiElement('createNotification');
}
async function addPoem() {
	return await createUiElement('createPoem');
}
async function addConsole() {
	return await createUiElement('createConsole');
}
async function createUiElement(messageName: string): Promise<void> {
	await transaction(async () => {
		await store.dispatch(`panels/${messageName}`, {
			panelId: viewport.value.currentPanel,
		});
	});
}
</script>

<style lang="scss" scoped></style>
