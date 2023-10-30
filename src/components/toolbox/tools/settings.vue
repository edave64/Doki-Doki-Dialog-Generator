<!--
	A tab allowing you to change global settings of the application.
-->
<template>
	<div class="panel" ref="root">
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
					<p>Do you want to allow DDDG to save settings on your device?</p>
					<p>
						By choosing to enable saving settings, DDDG can save data to your
						device, and nowhere else. However, your browser and any installed
						browser extensions might possibly read and send this data to other
						servers, e.g. to sync between devices. This is outside of our
						control. But in general, we recommend only using browsers and
						browser extensions that you trust with your personal data.
					</p>
					<p>You can revoke this permission at any time.</p>
					<p>
						Our usual <l to="wiki://Privacy Statement">privacy policy</l> still
						applies.
					</p>
				</div>
			</modal-dialog>
			<modal-dialog
				:options="['Deny', 'Cancle']"
				v-if="denySavesModal"
				@leave="denySaves('Cancel')"
				@option="denySaves"
				no-base-size
			>
				<div class="modal-scroll-area">
					<p>Do you want to deny DDDG from saving settings on your device?</p>
					<p>
						This will cause all your settings to reset when leaving the page.
					</p>
					<p>
						Our usual <l to="wiki://Privacy Statement">privacy policy</l> still
						applies.
					</p>
				</div>
			</modal-dialog>
			<modal-dialog
				:options="[
					inPlusMode ? 'Enter Classic Mode' : 'Enter Plus mode',
					'Stay',
				]"
				v-if="showModeDialog"
				@leave="showModeDialog = false"
				@option="modeChange"
				no-base-size
			>
				<div class="modal-scroll-area">
					<p>
						WARNING: Swiching modes will discard everything you have done in
						this session. All dialouge will be lost!
					</p>
				</div>
			</modal-dialog>
		</teleport>
		<button v-if="waitOnSaveChange" disabled>Applying...</button>
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
		<button @click="showModeDialog = true">
			<template v-if="inPlusMode"> Enter Classic Mode </template>
			<template v-else> Enter DDLC Plus Mode </template>
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
		<toggle
			label="Fault tolerant text parsing"
			title="Silently ignore parse errors in texts. (Like unexpected '{' characters) Prevents beginners from getting stuck working with textboxes, but also makes it harder to understand what you are doing wrong."
			v-model="looseTextParsing"
		/>
		<table class="v-w100">
			<tr>
				<td><label>Theme:</label></td>
				<td>
					<select v-model="theme" class="v-w100">
						<option :value="null">System</option>
						<option :value="false">Light</option>
						<option :value="true">Dark</option>
					</select>
				</td>
			</tr>
		</table>

		<table v-if="showDownloadFolder" class="downloadTable">
			<tr>
				<td><label>Download folder:</label></td>
				<td>{{ downloadFolder }}</td>
				<td>
					<button @click="setDownloadFolder">Set</button>
					<button @click="openDownloadFolder">Open</button>
				</td>
			</tr>
		</table>
	</div>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import ModalDialog from '@/components/modal-dialog.vue';
import Toggle from '@/components/toggle.vue';
import L from '@/components/ui/link.vue';
import environment from '@/environments/environment';
import { transaction } from '@/plugins/vuex-history';
import { useStore } from '@/store';
import { safeAsync } from '@/util/errors';
import { computed, ref, watch } from 'vue';

const store = useStore();
const root = ref(null! as HTMLElement);
setupPanelMixin(root);

function saveSettings() {
	environment.saveSettings({
		lq: store.state.ui.lqRendering,
		nsfw: store.state.ui.nsfw,
		darkMode: store.state.ui.useDarkTheme ?? undefined,
		looseTextParsing: environment.state.looseTextParsing,
		defaultCharacterTalkingZoom: store.state.ui.defaultCharacterTalkingZoom,
	});
}
//#region Allow saving
const savesEnabledInEnv = computed(() => environment.supports.optionalSaving);
const allowSavesModal = ref(false);
const denySavesModal = ref(false);
const waitOnSaveChange = ref(false);

const savesAllowed = computed({
	get(): boolean {
		return environment.savingEnabled;
	},
	set(allowed: boolean) {
		waitOnSaveChange.value = true;
		environment.savingEnabled = allowed;
		saveSettings();
	},
});

function allowSaves(choice: 'Allow' | 'Deny') {
	allowSavesModal.value = false;
	if (choice === 'Allow') {
		savesAllowed.value = true;
	}
}

function denySaves(choice: 'Deny' | 'Cancel') {
	denySavesModal.value = false;
	if (choice === 'Deny') {
		savesAllowed.value = false;
	}
}

watch(
	() => savesAllowed.value,
	() => (waitOnSaveChange.value = false)
);
//#endregion Allow saving
//#region Mode changer
const showModeDialog = ref(false);
const inPlusMode = computed(() => environment.gameMode === 'ddlc_plus');
function modeChange(choice: 'Enter Classic Mode' | 'Enter Plus mode' | 'Stay') {
	safeAsync('changing modes', async () => {
		if (choice === 'Enter Classic Mode') {
			await environment.setGameMode('ddlc');
		} else if (choice === 'Enter Plus mode') {
			await environment.setGameMode('ddlc_plus');
		} else {
			showModeDialog.value = false;
		}
	});
}
//#endregion Mode changer
//#region LQ preview
const lqAllowed = computed(() => environment.supports.lq);
const lqRendering = computed({
	get(): boolean {
		return store.state.ui.lqRendering;
	},
	set(lqRendering: boolean) {
		transaction(() => {
			store.commit('ui/setLqRendering', lqRendering);
		});
		saveSettings();
	},
});
//#endregion LQ preview
//#region NSFW mode
const nsfw = computed({
	get(): boolean {
		return !!store.state.ui.nsfw;
	},
	set(value: boolean) {
		transaction(() => {
			store.commit('ui/setNsfw', value);
			saveSettings();
		});
	},
});
//#endregion NSFW mode
//#region Enlarge when talking
const defaultCharacterTalkingZoom = computed({
	get(): boolean {
		return !!store.state.ui.defaultCharacterTalkingZoom;
	},
	set(value: boolean) {
		transaction(() => {
			store.commit('ui/setDefaultCharacterTalkingZoom', value);
			saveSettings();
		});
	},
});
//#endregion Enlarge when talking
//#region Loose text parsing
const looseTextParsing = computed({
	get(): boolean {
		return environment.state.looseTextParsing;
	},
	set(looseTextParsing: boolean) {
		environment.state.looseTextParsing = looseTextParsing;
		saveSettings();
	},
});
//#endregion Loose text parsing
//#region Theme
const theme = computed({
	get(): boolean | null {
		return store.state.ui.useDarkTheme;
	},
	set(value: boolean | null) {
		transaction(() => {
			store.commit('ui/setDarkTheme', value);
			saveSettings();
		});
	},
});
//#endregion Theme
//#region Download folder
const showDownloadFolder = computed(
	(): boolean => environment.supports.setDownloadFolder
);
const downloadFolder = computed(
	(): string => environment.state.downloadLocation
);

function setDownloadFolder() {
	environment.updateDownloadFolder();
}

function openDownloadFolder() {
	environment.openFolder('downloads');
}
//#endregion Download folder
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

		.downloadTable {
			td {
				display: table-row;
				line-break: anywhere;
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
