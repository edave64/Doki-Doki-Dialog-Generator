<template>
	<div class="repo-dialog">
		<h1>Content Repository Manager</h1>
		<p>These are the sources of content packs known to DDDG.</p>
		<div class="repo-selector">
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
import { ref } from 'vue';
const estimate = ref(null as null | StorageEstimate);
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
