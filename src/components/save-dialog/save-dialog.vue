<template>
	<div class="save-dialog">
		<h1>Save Manager</h1>
		<div v-if="!persisted">
			<p>
				Storage is not persisted. This means that the browser might
				delete your data at any time. Do not treat this as a permanent
				storage. Consider downloading your saves as ZIP files.
			</p>
			<button @click="requestPersistance()">Request persistence</button>
			<p v-if="chromeDetected">
				This might not work in chrome and chromium based browsers.
			</p>
			<p v-if="persistanceRejected">
				The browser rejected the request for persistance. This might be
				due to the browser's settings or because the user denied the
				request.
			</p>
		</div>
		<p v-else-if="estimate">
			Free storage estimate:
			{{
				(
					((estimate?.quota ?? 0) - (estimate?.usage ?? 0)) /
					1024 /
					1024
				).toFixed(2)
			}}
			MB
		</p>
		<div class="save-selector">
			<table :disabled="availableSaves.length === 0" tabindex="0">
				<tbody>
					<tr
						v-for="save in availableSaves"
						:key="save.name"
						:class="{ active: save.name === saveName }"
						@click="saveName = save.name"
					>
						<td>{{ save.name }}</td>
						<td class="small timestamp">
							{{ save.timestamp.toLocaleString() }}
						</td>
						<td class="small size">
							{{ prettyPrintSize(save.size) }}
						</td>
						<td class="small actions">
							<button @click="deleteSave(save.name)">
								Delete
							</button>
						</td>
					</tr>
					<tr v-if="availableSaves.length === 0">
						<td>No saves available</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="save-name-input">
			<label for="save-name">Save name: </label>
			<input
				id="save-name"
				type="text"
				placeholder="Save name"
				v-model="saveName"
			/>
		</div>
		<button
			:disabled="saveName === ''"
			:title="
				saveName === ''
					? 'Save needs a name'
					: 'Saves the current state'
			"
			@click="createSave"
		>
			{{ activeSelection ? 'Override' : 'Create' }} save
		</button>
		<button :disabled="!activeSelection" @click="loadSave">Load</button>
		<button
			:disabled="!activeSelection"
			:title="
				activeSelection
					? 'Downloads the selected save as a ZIP file'
					: 'You must create a save before downloading it as zip'
			"
			@click="downloadSaveAsZip"
		>
			Download save as zip
		</button>
	</div>
</template>

<script lang="ts" setup>
import envX from '@/environments/environment';
import eventBus, { StateLoadingEvent } from '@/eventbus/event-bus';
import { transaction } from '@/history-engine/transaction';
import { confirm } from '@/util/dialogs';
import { computed, ref } from 'vue';
const estimate = ref(null as null | StorageEstimate);

navigator.storage.estimate().then((e) => {
	estimate.value = e;
});

const availableSaves = computed(() => {
	return envX.storage.getSaves();
});
const saveName = ref('');
const persistanceRejected = ref(false);
const persisted = computed(() => envX.storage.isPersisted());

//@ts-expect-error: Not in standard lib
const chromeDetected = ref(typeof chrome !== 'undefined');

async function requestPersistance() {
	const ret = await envX.storage.requestPersistance();
	persistanceRejected.value = !ret;
}

const activeSelection = computed(() =>
	availableSaves.value.find((save) => save.name === saveName.value)
);

async function createSave() {
	if (activeSelection.value) {
		if (!(await confirm('Are you sure you want to overwrite this save?'))) {
			return;
		}
	}
	await transaction(async () => {
		await envX.storage.save(saveName.value);
	});
}

async function downloadSaveAsZip() {
	await transaction(async () => {
		if (activeSelection.value) {
			await envX.storage.downloadAsZip(saveName.value);
		}
	});
}

async function loadSave() {
	if (activeSelection.value) {
		if (
			!(await confirm(
				'Are you sure you want to load this save? Any unsaved changes to your current dialouge will be discarded.'
			))
		) {
			return;
		}
	}
	await transaction(async () => {
		if (activeSelection.value) {
			await envX.storage.load(saveName.value);
		}
		eventBus.fire(new StateLoadingEvent());
	});
}

async function deleteSave(save: string) {
	if (
		!(await confirm(`Are you sure you want to delete the save "${save}"?`))
	) {
		return;
	}
	await transaction(async () => {
		await envX.storage.delete(save);
	});
}

function prettyPrintSize(size: number): string {
	const units = ['B', 'KiB', 'MiB', 'GiB'];
	let unitIndex = 0;
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}
	return `${size.toFixed(2)} ${units[unitIndex]}`;
}
</script>

<style lang="scss" scoped>
.save-dialog {
	display: flex;
	flex-direction: column;
	height: 100%;
	gap: 8px;
	padding: 8px;
}

.save-selector {
	flex-grow: 1;
	width: 100%;
	border: 2px solid var(--border);

	table {
		width: 100%;
		border-spacing: 0px;

		&:focus {
			outline: none;
		}

		tr {
			padding: 4px;
			cursor: pointer;

			td {
				border: 0;
				padding: 4px;
				border-bottom: 1px solid var(--border);

				&.small {
					width: 0;
					white-space: nowrap;
				}
				&.size {
					text-align: right;
				}
				&.actions {
					padding: 0;
				}
			}

			&.active {
				background: var(--border);
				color: var(--text);
			}
		}

		&:focus tr.active {
			outline: 1px solid var(--text);
		}
	}
}

.save-name-input {
	display: flex;
	gap: 8px;
	align-items: baseline;

	input {
		flex-grow: 1;
	}
}
</style>
