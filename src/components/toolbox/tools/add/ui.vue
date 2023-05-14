<template>
	<button @click="addTextBox">Textbox</button>
	<button @click="addPoem">Poem</button>
	<button @click="addDialog">Notification</button>
	<button @click="addChoice">Choice</button>
	<button @click="addConsole">Console</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DButton from '@/components/ui/d-button.vue';
import { transaction } from '@/plugins/vuex-history';

export default defineComponent({
	components: { DButton },
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
			transaction(async () => {
				await this.$store.dispatch(`panels/${messageName}`, {
					panelId: this.$store.state.panels.currentPanel,
				});
			});
		},
	},
});
</script>

<style lang="scss" scoped></style>
