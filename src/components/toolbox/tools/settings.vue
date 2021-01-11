<template>
	<div class="panel">
		<h1>Settings</h1>
		<teleport to="#modal-messages">
			<modal-dialog
				:options="['Allow', 'Deny']"
				v-if="allowSavesModal"
				@leave="allowSaves('Deny')"
				@option="allowSaves"
				no-base-size
			>
				<div class="modal-scroll-area">
					<p>
						Do you want to allow DDDG to save settings on your device?
					</p>
					<p>
						By choosing to enable saving settings, DDDG can save data to your
						device, and nowhere else. However, your browser and any installed
						browser extensions might possibly read and send this data to other
						servers, e.g. to sync between devices. This is outside of our
						control. But in general, we recommend only using browsers and
						browser extensions that you trust with your personal data.
					</p>
					<p>
						You can revoke this permission at any time.
					</p>
					<p>
						Our usual <l to="wiki://Privacy Statement">privacy policy</l> still
						applies.
					</p>
				</div>
			</modal-dialog>
			<modal-dialog
				:options="['Deny', 'Cancle']"
				v-if="denySavesModal"
				@leave="denySaves('Cancle')"
				@option="denySaves"
				no-base-size
			>
				<div class="modal-scroll-area">
					<p>
						Do you want to deny DDDG from saving settings on your device?
					</p>
					<p>
						This will cause all your settings to reset when leaving the page.
					</p>
					<p>
						Our usual <l to="wiki://Privacy Statement">privacy policy</l> still
						applies.
					</p>
				</div>
			</modal-dialog>
		</teleport>
		<button v-if="waitOnSaveChange" disabled>
			Applying...
		</button>
		<button
			v-else-if="!savesAllowed && savesEnabledInEnv"
			@click="allowSavesModal = true"
		>
			Allow saving options
		</button>
		<button
			v-else-if="savesAllowed && savesEnabledInEnv"
			@click="denySavesModal = true"
		>
			Deny saving options
		</button>
		<toggle
			v-if="lqAllowed"
			label="Low quality preview?"
			title="Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render."
			v-model="lqRendering"
		/>
		<toggle label="NSFW Mode?" v-model="nsfw" />
		<toggle
			label="Enlarge talking objects? (Default value)"
			v-model="defaultCharacterTalkingZoom"
		/>
		<table>
			<tr>
				<td><label>Theme:</label></td>
				<td>
					<select v-model="theme">
						<option :value="null">System</option>
						<option :value="false">Light</option>
						<option :value="true">Dark</option>
					</select>
				</td>
			</tr>
		</table>
	</div>
</template>

<script lang="ts">
import Toggle from '@/components/toggle.vue';
import { PanelMixin } from './panelMixin';
import { IRemovePacksAction } from '@/store';
import environment from '@/environments/environment';
import { defineComponent } from 'vue';
import ModalDialog from '@/components/ModalDialog.vue';
import L from '@/components/ui/link.vue';

export default defineComponent({
	mixins: [PanelMixin],
	components: { Toggle, ModalDialog, L },
	data: () => ({
		allowSavesModal: false,
		denySavesModal: false,
		waitOnSaveChange: false,
	}),
	computed: {
		savesAllowed: {
			get(): boolean {
				return environment.savingEnabled;
			},
			set(allowed: boolean) {
				this.waitOnSaveChange = true;
				environment.savingEnabled = allowed;
				this.saveSettings();
			},
		},
		savesEnabledInEnv(): boolean {
			return environment.supports.optionalSaving;
		},
		lqAllowed(): boolean {
			return environment.supports.lq;
		},
		lqRendering: {
			get(): boolean {
				return this.$store.state.ui.lqRendering;
			},
			set(lqRendering: boolean) {
				this.vuexHistory.transaction(async () => {
					await this.$store.commit('ui/setLqRendering', lqRendering);
				});
				this.saveSettings();
			},
		},
		nsfw: {
			get(): boolean {
				return !!this.$store.state.ui.nsfw;
			},
			set(value: boolean) {
				this.vuexHistory.transaction(async () => {
					await this.$store.commit('ui/setNsfw', value);
					this.saveSettings();
				});
			},
		},
		defaultCharacterTalkingZoom: {
			get(): boolean {
				return !!this.$store.state.ui.defaultCharacterTalkingZoom;
			},
			set(value: boolean) {
				this.vuexHistory.transaction(async () => {
					await this.$store.commit('ui/setDefaultCharacterTalkingZoom', value);
					this.saveSettings();
				});
			},
		},
		theme: {
			get(): boolean | null {
				return this.$store.state.ui.useDarkTheme;
			},
			set(value: boolean | null) {
				this.vuexHistory.transaction(async () => {
					await this.$store.commit('ui/setDarkTheme', value);
					this.saveSettings();
				});
			},
		},
	},
	watch: {
		savesAllowed() {
			this.waitOnSaveChange = false;
		},
	},
	methods: {
		allowSaves(choice: 'Allow' | 'Deny') {
			this.allowSavesModal = false;
			if (choice === 'Allow') {
				this.savesAllowed = true;
			}
		},
		denySaves(choice: 'Deny' | 'Cancel') {
			this.denySavesModal = false;
			if (choice === 'Deny') {
				this.savesAllowed = false;
			}
		},
		saveSettings() {
			environment.saveSettings({
				lq: this.$store.state.ui.lqRendering,
				nsfw: this.$store.state.ui.nsfw,
				darkMode: this.$store.state.ui.useDarkTheme ?? undefined,
				defaultCharacterTalkingZoom: this.$store.state.ui
					.defaultCharacterTalkingZoom,
			});
		},
	},
});
</script>

<style lang="scss" scoped>
.panel {
	&.vertical {
		#dialog_text_wrapper {
			width: 173px;

			textarea {
				width: 100%;
			}
		}
	}

	&:not(.vertical) {
		#dialog_text_wrapper {
			height: 181px;
			display: table;

			* {
				display: table-row;
			}
		}
	}
}

textarea {
	min-height: 148px;
}

.btn_link {
	appearance: button;
	text-align: center;
}
</style>
