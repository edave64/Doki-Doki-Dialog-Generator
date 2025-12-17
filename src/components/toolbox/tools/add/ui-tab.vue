<template>
	<button class="v-w100" @click="addTextBox">Textbox</button>
	<button class="v-w100 v-bt0" @click="addPoem">Poem</button>
	<button class="v-w100 v-bt0" @click="addDialog">Notification</button>
	<button class="v-w100 v-bt0" @click="addChoice">Choice</button>
	<button class="v-w100 v-bt0" @click="addConsole">Console</button>
</template>

<script lang="ts" setup>
import { transaction } from '@/history-engine/transaction';
import { useViewport } from '@/hooks/use-viewport';
import Choice from '@/store/object-types/choices';
import Notification from '@/store/object-types/notification';
import Poem from '@/store/object-types/poem';
import Textbox from '@/store/object-types/textbox';
import { state } from '@/store/root';
import { computed } from 'vue';

const viewport = useViewport();
const panel = computed(() => state.panels.panels[viewport.value.currentPanel]);
async function addTextBox() {
	transaction(() => {
		Textbox.create(panel.value);
	});
}
async function addChoice() {
	transaction(() => {
		Choice.create(panel.value);
	});
}
async function addDialog() {
	transaction(() => {
		Notification.create(panel.value);
	});
}
async function addPoem() {
	transaction(() => {
		Poem.createPoem(panel.value);
	});
}
async function addConsole() {
	transaction(() => {
		Poem.createConsole(panel.value);
	});
}
</script>

<style lang="scss" scoped></style>
