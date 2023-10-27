<template>
	<button class="v-w100" @click="addTextBox">Textbox</button>
	<button class="v-w100" @click="addPoem">Poem</button>
	<button class="v-w100" @click="addDialog">Notification</button>
	<button class="v-w100" @click="addChoice">Choice</button>
	<button class="v-w100" @click="addConsole">Console</button>
</template>

<script lang="ts">
import { transaction } from '@/plugins/vuex-history';
import { defineComponent } from 'vue';

export default defineComponent({
	methods: {
		async addTextBox() {
			return await this.createUiElement('createTextBox');
		},
		async addChoice() {
			return await this.createUiElement('createChoice');
		},
		async addDialog() {
			return await this.createUiElement('createNotification');
		},
		async addPoem() {
			return await this.createUiElement('createPoem');
		},
		async addConsole() {
			return await this.createUiElement('createConsole');
		},
		async createUiElement(messageName: string): Promise<void> {
			await transaction(async () => {
				await this.$store.dispatch(`panels/${messageName}`, {
					panelId: this.$store.state.panels.currentPanel,
				});
			});
		},
	},
});
</script>

<style lang="scss" scoped></style>
