<!-- eslint-disable vue/html-comment-indent -->
<!--
	A tab allowing you create, delete, switch and export panels.
	Also allows to save the entire custom dialog.
-->
<template>
	<div class="panel" ref="root">
		<h1>Panels</h1>
		<image-options
			v-if="imageOptionsActive"
			type="panel"
			title=""
			:panel-id="viewport.currentPanel"
			no-composition
			@leave="
				imageOptionsActive = false;
				renderCurrentThumbnail();
			"
		/>
		<template v-else>
			<d-fieldset
				class="existing_panels_fieldset"
				title="Existing Panels"
			>
				<d-flow no-wraping maxSize="350px">
					<div
						v-for="(panel, idx) of panelButtons"
						:key="panel.id"
						:class="{
							panel_button: true,
							active: panel.id === viewport.currentPanel,
						}"
						:style="`background-image: url('${panel.image}')`"
						tabindex="0"
						@click="updateCurrentPanel(panel.id)"
						@keydown.enter="updateCurrentPanel(panel.id)"
						@keydown.space.prevent="updateCurrentPanel(panel.id)"
					>
						<div class="panel_text">
							<p>{{ panel.text }}</p>
						</div>
						<div class="panel_nr">{{ idx + 1 }}</div>
					</div>
				</d-flow>
			</d-fieldset>
			<div class="column">
				<d-button icon="add_to_queue" @click="addNewPanel">
					Add new</d-button
				>
				<d-button
					icon="remove_from_queue"
					class="bt0"
					@click="deletePanel"
					:disabled="!canDeletePanel"
				>
					Delete panel
				</d-button>

				<d-button
					icon="arrow_upward"
					class="bt0"
					@click="moveAhead"
					:disabled="!canMoveAhead"
				>
					Move ahead
				</d-button>
				<d-button
					icon="arrow_downward"
					class="bt0"
					@click="moveBehind"
					:disabled="!canMoveBehind"
				>
					Move behind
				</d-button>
				<d-button
					class="bt0"
					icon="color_lens"
					@click="imageOptionsActive = true"
				>
					Image options
				</d-button>
			</div>
			<d-fieldset title="Export" class="h-h100 export_settings">
				<table class="v-w100">
					<tbody>
						<tr>
							<td colspan="2">
								<d-button
									icon="photo_camera"
									class="w100"
									@click="download"
								>
									Download
								</d-button>
							</td>
						</tr>
						<tr>
							<td>
								<label for="export_format">Format</label>
							</td>
							<td>
								<select id="export_format" v-model="format">
									<option value="image/png">
										PNG (lossless)
									</option>
									<option
										value="image/webp"
										v-if="webpSupport"
									>
										WebP (lossy)
									</option>
									<option
										value="image/heif"
										v-if="heifSupport"
									>
										HEIF (lossy)
									</option>
									<option value="image/jpeg">
										JPEG (lossy)
									</option>
									<option value="image/jpeg">
										WebM (lossy, video)
									</option>
								</select>
							</td>
						</tr>
						<tr v-if="isLossy">
							<td>
								<label for="export_quality">Quality:</label>
							</td>
							<td>
								<input
									id="export_quality"
									type="number"
									min="0"
									max="100"
									v-model.number="quality"
									@keydown.stop
								/>
							</td>
						</tr>
						<tr>
							<td>
								<label for="export_ppi">
									Panels per image:
									<small v-if="!isLossy || vertical"
										><br />(0 for one single image)</small
									>
								</label>
							</td>
							<td>
								<input
									id="export_ppi"
									type="number"
									min="0"
									v-model.number="ppi"
									@keydown.stop
									@blur="if (emptyStringInInt(ppi)) ppi = 0;"
								/>
							</td>
						</tr>
						<tr>
							<td>
								<label for="export_pages">
									Panels to export:
									<small v-if="!isLossy || vertical"
										><br />(Leave empty for all)</small
									>
								</label>
							</td>
							<td>
								<input
									id="export_pages"
									v-model="pages"
									placeholder="E.g. 1-5, 8, 11-13"
								/>
							</td>
						</tr>
						<tr>
							<td colspan="2">
								<toggle-box
									v-model="horizontalExport"
									label="Horizontal arrangement?"
									title="Order panels side by side instead of top to bottom"
								/>
							</td>
						</tr>
					</tbody>
				</table>
			</d-fieldset>
			<div class="column">
				<div style="display: flex">
					<d-button icon="download" @click="save"
						>Quick Save</d-button
					>
					<d-button
						class="bl0"
						icon="upload"
						@click="loadUpload.click()"
						style="width: auto"
					>
						<input type="file" ref="loadUpload" @change="load" />
					</d-button>
				</div>
				<d-button
					v-if="canDoFullSave"
					class="bt0"
					icon="save"
					@click="saveFolder"
					>Save Folder
				</d-button>
				<d-button
					v-if="canDoFullSave"
					class="bt0"
					icon="folder_open"
					@click="loadOpenFolder.click()"
					>Load Folder
					<input
						type="file"
						ref="loadOpenFolder"
						@change="loadFolder"
						webkitdirectory
					/>
				</d-button>
			</div>
		</template>
	</div>
	<teleport to="#modal-messages">
		<modal-dialog
			:options="['No', 'Yes']"
			no-base-size
			class="modal-rename"
			v-if="showConfirmModal"
			@option="confirmOption"
			@leave="confirmOption('No')"
		>
			<p class="modal-text">{{ confirmText }}</p>
		</modal-dialog>
	</teleport>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import ModalDialog from '@/components/modal-dialog.vue';
import DButton from '@/components/ui/d-button.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import getConstants from '@/constants';
import environment from '@/environments/environment';
import eventBus, {
	RenderUpdatedEvent,
	ShowMessageEvent,
	StateLoadingEvent,
} from '@/eventbus/event-bus';
import { transaction } from '@/history-engine/transaction';
import { SceneRenderer } from '@/renderables/scene-renderer';
import { safeAsync } from '@/util/errors';
import type { DeepReadonly } from 'ts-essentials';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import ImageOptions from '../subtools/image-options/image-options.vue';

interface IPanelButton {
	id: Panel['id'];
	image: string;
	text: string;
}

const qualityFactor = 100;
const defaultQuality = 90;
const qualityWarningThreshold = 70;

const root = ref(null! as HTMLElement);
const { vertical, getRoot } = setupPanelMixin(root);

const ppi = ref(environment.supports.limitedCanvasSpace ? 10 : 0);
const pages = ref('');
const format = ref('image/png');
const quality = ref(defaultQuality);
const horizontalExport = ref(false);
const imageOptionsActive = ref(false);
const loadUpload = ref(null! as HTMLInputElement);
const loadOpenFolder = ref(null! as HTMLInputElement);
const baseConst = getConstants().Base;

const canDoFullSave =
	window.showDirectoryPicker !== undefined &&
	'webkitRelativePath' in (File?.prototype ?? {});

const currentPanel = computed(
	() => state.panels.panels[viewport.value.currentPanel]
);
const isLossy = computed(() => format.value !== 'image/png');
const canDeletePanel = computed(() => panelButtons.value.length > 1);

function emptyStringInInt(v: string | number) {
	if (v === '') return true;
	return false;
}

const showConfirmModal = ref(false);
const confirmText = ref('');
const confirmResolve = ref<null | ((val: boolean) => void)>(null);
function confirmOption(option: string) {
	showConfirmModal.value = false;
	if (option === 'Yes') {
		confirmResolve.value?.(true);
	}
}

function confirmMessage(text: string): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		confirmText.value = text;
		showConfirmModal.value = true;
		confirmResolve.value = resolve;
	});
}

//#region Format-Support
import { isHeifSupported, isWebPSupported } from '@/asset-manager';
const webpSupport = ref(false);
const heifSupport = ref(false);

Promise.allSettled([isWebPSupported(), isHeifSupported()]).then(
	([webp, heif]) => {
		if (webp.status === 'fulfilled') webpSupport.value = webp.value;
		if (heif.status === 'fulfilled') heifSupport.value = heif.value;
	}
);
//#endregion Format-Support
//#region Panel-Buttons
const canMoveAhead = computed((): boolean => {
	const idx = state.panels.order.indexOf(viewport.value.currentPanel);
	return idx > 0;
});

const canMoveBehind = computed((): boolean => {
	const panels = state.panels.order;
	const idx = panels.indexOf(viewport.value.currentPanel);
	return idx < panels.length - 1;
});

const panelButtons = computed((): IPanelButton[] => {
	const panels = state.panels.order;
	return panels.map((panelId) => {
		const panel = state.panels.panels[panelId];
		const txtBox = [...panel.lowerOrder, ...panel.topOrder]
			.map((objId) => panel.objects[objId])
			.map(extractObjectText);
		return {
			id: panel.id,
			image: panel.lastRender,
			text: txtBox.reduce(
				(acc, current) => (acc.length > current.length ? acc : current),
				''
			),
		} as IPanelButton;
	});
});

function extractObjectText(obj: DeepReadonly<GenObject>) {
	switch (obj.type) {
		case 'textBox':
			return obj.text;
		case 'notification':
			return obj.text;
		case 'poem':
			return obj.text;
		case 'choice':
			return obj.choices.map((choice) => `[${choice.text}]`).join('\n');
	}
	return '';
}
function moveFocusToActivePanel() {
	const active = getRoot().querySelector(
		'.panel_button.active'
	) as HTMLElement;
	if (active != null) {
		scrollIntoView(active);
	}
}
function scrollIntoView(ele: HTMLElement) {
	const parent = ele.parentElement!.parentElement!;
	if (vertical.value) {
		parent.scrollTop = ele.offsetTop - parent.clientHeight / 2;
		parent.scrollLeft = 0;
	} else {
		parent.scrollLeft = ele.offsetLeft - parent.clientWidth / 2;
		parent.scrollTop = 0;
	}
}
onMounted(() => {
	moveFocusToActivePanel();
});
//#endregion Panel-Buttons
//#region Download
function getDownloadFilenamePrefix() {
	const date = new Date();
	return `cd-${[
		date.getFullYear(),
		`${date.getMonth() + 1}`.padStart(2, '0'),
		`${date.getDate()}`.padStart(2, '0'),
		`${date.getHours()}`.padStart(2, '0'),
		`${date.getMinutes()}`.padStart(2, '0'),
		`${date.getSeconds()}`.padStart(2, '0'),
	].join('-')}`;
}
async function download() {
	await safeAsync('export image', async () => {
		const distribution = getPanelDistibution();
		const extension = format.value.split('/')[1];
		const format_ = format.value;
		const quality_ = quality.value;
		const horizontal_ = horizontalExport.value;
		const prefix = getDownloadFilenamePrefix();
		await renderObjects(
			distribution,
			true,
			horizontal_,
			async (imageIdx: number, canvasEle: HTMLCanvasElement) => {
				await environment.saveToFile(
					canvasEle,
					`${prefix}_${imageIdx}.${extension}`,
					format_,
					quality_ / qualityFactor
				);
			}
		);
	});
}
async function renderObjects<T>(
	distribution: DeepReadonly<Panel['id'][][]>,
	hq: boolean,
	horizontal: boolean,
	mapper: (imageIdx: number, canvas: HTMLCanvasElement) => Promise<T>
): Promise<T[]> {
	const baseConst = getConstants().Base;
	const ret = [];
	const xOffset = horizontal ? baseConst.screenWidth : 0;
	const yOffset = horizontal ? 0 : baseConst.screenHeight;
	for (let imageIdx = 0; imageIdx < distribution.length; ++imageIdx) {
		const image = distribution[imageIdx];
		const targetCanvas = document.createElement('canvas');
		targetCanvas.width = horizontal
			? baseConst.screenWidth * image.length
			: baseConst.screenWidth;
		targetCanvas.height = horizontal
			? baseConst.screenHeight
			: baseConst.screenHeight * image.length;
		try {
			const context = targetCanvas.getContext('2d')!;

			for (let panelIdx = 0; panelIdx < image.length; ++panelIdx) {
				const panelId = image[panelIdx];
				const sceneRenderer = new SceneRenderer(
					panelId,
					baseConst.screenWidth,
					baseConst.screenHeight
				);
				try {
					await sceneRenderer.render(hq, false, true);

					sceneRenderer.paintOnto(context, {
						x: xOffset * panelIdx,
						y: yOffset * panelIdx,
						w: baseConst.screenWidth,
						h: baseConst.screenHeight,
					});
				} finally {
					sceneRenderer.dispose();
				}
			}

			ret.push(await mapper(imageIdx, targetCanvas));
		} finally {
			disposeCanvas(targetCanvas);
		}
	}
	return ret;
}
function getLimitedPanelList(): DeepReadonly<Panel['id'][]> {
	const max = state.panels.order.length - 1;
	const min = 0;
	const parts = pages.value.split(',');
	const listedPages: number[] = [];
	let foundMatch = false;

	for (const part of parts) {
		const trimmedPart = part.trim();
		const match = trimmedPart.match(/^\s*((\d+)|(\d+)\s*-\s*(\d+))\s*$/);
		if (!match) {
			if (trimmedPart !== '') {
				eventBus.fire(
					new ShowMessageEvent(
						`Could not read '${part}' in the page list.`
					)
				);
			}
			continue;
		}
		foundMatch = true;
		if (match[2]) {
			listedPages.push(parseInt(match[2], 10) - 1);
		} else {
			const from = Math.max(parseInt(match[3], 10) - 1, min);
			const to = Math.min(parseInt(match[4], 10) - 1, max);
			if (from == undefined || to == undefined || from > to) continue;
			for (let i = from; i <= to; ++i) {
				listedPages.push(i);
			}
		}
	}

	if (!foundMatch) {
		return state.panels.order;
	}

	return listedPages
		.sort((a, b) => a - b)
		.filter((value, idx, ary) => ary[idx - 1] !== value)
		.map((pageIdx) => state.panels.panels[pageIdx].id);
}
function getPanelDistibution(): DeepReadonly<Panel['id'][][]> {
	const panelOrder = getLimitedPanelList();
	if (isNaN(ppi.value)) {
		ppi.value = 0;
	}
	if (ppi.value === 0) return [panelOrder];
	const images: Panel['id'][][] = [];
	for (let imageI = 0; imageI < panelOrder.length / ppi.value; ++imageI) {
		const sliceStart = imageI * ppi.value;
		const sliceEnd = sliceStart + ppi.value;
		images.push(panelOrder.slice(sliceStart, sliceEnd));
	}
	return images;
}
//#endregion Download
//#region Actions
async function addNewPanel(): Promise<void> {
	transaction(async () => {
		state.panels.duplicatePanel(
			state.panels.panels[viewport.value.currentPanel]
		);
		viewport.value.currentPanel = state.panels.lastPanelId;
	});
	await nextTick();
	moveFocusToActivePanel();
}
function updateCurrentPanel(panelId: Panel['id']) {
	transaction(() => {
		viewport.value.currentPanel = panelId;
	});
	nextTick(() => {
		moveFocusToActivePanel();
	});
}
function deletePanel() {
	transaction(async () => {
		state.panels.deletePanel(
			state.panels.panels[viewport.value.currentPanel]
		);
	});
	nextTick(() => {
		moveFocusToActivePanel();
	});
}
function moveAhead() {
	transaction(() => {
		state.panels.movePanel(
			state.panels.panels[viewport.value.currentPanel],
			-1
		);
	});
}
function moveBehind() {
	transaction(() => {
		state.panels.movePanel(
			state.panels.panels[viewport.value.currentPanel],
			1
		);
	});
}
//#endregion Actions
//#region Thumbnails
import { useViewport } from '@/hooks/use-viewport';
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import type { GenObject } from '@/store/object-types/object';
import type { Panel } from '@/store/panels';
import { state } from '@/store/root';
import { disposeCanvas, makeCanvas } from '@/util/canvas';

const thumbnailFactor = 1 / 4;
const thumbnailQuality = 0.5;
const targetCanvas = makeCanvas();
targetCanvas.width = baseConst.screenWidth * thumbnailFactor;
targetCanvas.height = baseConst.screenHeight * thumbnailFactor;
const thumbnailCtx = targetCanvas.getContext('2d')!;
const isMounted = ref(false);
const viewport = useViewport();

const missingThumbnails = computed((): Panel['id'][] => {
	return state.panels.order.filter((panelId) => {
		const panel = state.panels.panels[panelId];
		return panel.lastRender == null;
	});
});

async function saveFolder() {
	const entry = await window.showDirectoryPicker();
	if (!entry) return;

	const entries: FileSystemHandle[] = await Array.fromAsync(entry.values());

	if (
		entries.some(
			(entry) => entry.kind === 'file' && entry.name === 'save.dddg'
		)
	) {
		if (
			!(await confirmMessage(
				'A save file already exists in this folder. Do you want to overwrite it?'
			))
		) {
			return;
		}
	} else if (entries.length > 0) {
		if (
			!(await confirmMessage(
				'This folder already contains files. They might get overwritten. Do you want to continue?'
			))
		) {
			return;
		}
	}

	const promises: Promise<unknown>[] = [
		(async () => {
			const saveFile = await entry.getFileHandle(`save.dddg`, {
				create: true,
			});
			const saveBlob = new Blob([await state.getSave(false)], {
				type: 'text/plain',
			});
			const writable = await saveFile.createWritable();
			await writable.write(saveBlob);
			await writable.close();
		})(),
	];

	for (const [name, url] of Object.entries(state.uploadUrls.urls)) {
		promises.push(
			(async () => {
				const file = await entry.getFileHandle(name, {
					create: true,
				});
				const writable = await file.createWritable();
				const fileLoader = await fetch(url);
				const blob = await fileLoader.blob();
				await writable.write(blob);
				await writable.close();
			})()
		);
	}
}

async function loadFolder(e: Event) {
	const files = (e.target as HTMLInputElement).files;

	if (!files) return;

	await transaction(async () => {
		for (const file of files) {
			const name = file.name;

			if (name === 'save.dddg') {
				const data = await file.text();
				await state.loadSave(data);
			}

			const url = URL.createObjectURL(file);
			state.uploadUrls.add(name, url);
		}
	});

	await renderCurrentThumbnail();

	if (!environment.supports.limitedCanvasSpace) {
		setTimeout(() => {
			restoreThumbnails();
		}, 1000);
	} else {
		eventBus.fire(
			new ShowMessageEvent(
				'To prevent running out of memory, thumbnails will not be automatically restored in the background.'
			)
		);
	}
}

async function renderCurrentThumbnail() {
	// FIXME: This sadly makes it so the selection halo is visible in the thumbnails.
	//        The renderer will lose that once the panels tab is selected, so maybe delay this?
	const sceneRenderer = getMainSceneRenderer(viewport.value);
	if (!sceneRenderer) return;
	await renderPanelThumbnail(sceneRenderer);
}

async function renderPanelThumbnail(sceneRenderer: SceneRenderer) {
	await safeAsync('render thumbnail', async () => {
		const panelId = sceneRenderer.panelId;
		sceneRenderer.paintOnto(thumbnailCtx, {
			x: 0,
			y: 0,
			w: thumbnailCtx.canvas.width,
			h: thumbnailCtx.canvas.height,
		});

		thumbnailCtx.canvas.toBlob(
			(blob: Blob | null) => {
				if (!blob) return;
				const panel = state.panels.panels[panelId];
				if (!panel) return;
				const url = URL.createObjectURL(blob);
				panel.lastRender = url;
			},
			(await isWebPSupported()) ? 'image/webp' : 'image/jpeg',
			thumbnailQuality
		);
	});
}

async function restoreThumbnails() {
	try {
		const baseConst = getConstants().Base;
		if (!isMounted.value) return;
		if (environment.supports.limitedCanvasSpace) return;
		const missingThumbnails_ = missingThumbnails.value;
		if (missingThumbnails_.length === 0) return;
		const toRender = missingThumbnails_[0];
		const localRenderer = new SceneRenderer(
			toRender,
			baseConst.screenWidth,
			baseConst.screenHeight
		);

		await localRenderer.render(false, false, true);

		await renderPanelThumbnail(localRenderer);
	} catch (e) {
		console.error(e);
	}
	setTimeout(() => {
		restoreThumbnails();
	}, 100);
}

onMounted(() => {
	isMounted.value = true;
	requestAnimationFrame(() => renderCurrentThumbnail().catch(() => {}));
});
onUnmounted(() => {
	isMounted.value = false;
	disposeCanvas(thumbnailCtx.canvas);
});
eventBus.subscribe(RenderUpdatedEvent, () =>
	requestAnimationFrame(renderCurrentThumbnail)
);
//#endregion Thumbnails
//#region Saving/Loading
async function save() {
	const str = await state.getSave(true);
	const saveBlob = new Blob([str], {
		type: 'text/plain',
	});
	const date = new Date();
	const prefix = `save-${[
		date.getFullYear(),
		`${date.getMonth() + 1}`.padStart(2, '0'),
		`${date.getDate()}`.padStart(2, '0'),
		`${date.getHours()}`.padStart(2, '0'),
		`${date.getMinutes()}`.padStart(2, '0'),
		`${date.getSeconds()}`.padStart(2, '0'),
	].join('-')}`;
	environment.storeSaveFile(saveBlob, `${prefix}.dddg`);
}

async function load() {
	await transaction(async () => {
		const uploadInput = loadUpload.value;
		if (!uploadInput.files) return;
		eventBus.fire(new StateLoadingEvent());
		const data = await blobToText(uploadInput.files[0]);
		await state.loadSave(data);
	});

	await renderCurrentThumbnail();

	if (!environment.supports.limitedCanvasSpace) {
		setTimeout(() => {
			restoreThumbnails();
		}, 1000);
	} else {
		eventBus.fire(
			new ShowMessageEvent(
				'To prevent running out of memory, thumbnails will not be automatically restored in the background.'
			)
		);
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function blobToText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function () {
			resolve(reader.result as string);
		};
		reader.onerror = function (e) {
			reject(e);
		};
		reader.readAsText(file);
	});
}
//#endregion Saving/Loading
//#region Warnings
watch(
	() => quality.value,
	(quality: number, oldQuality: number) => {
		if (quality === 100) {
			eventBus.fire(
				new ShowMessageEvent(
					'Note: 100% quality on a lossy format is still not lossless! Select PNG if you want lossless compression.'
				)
			);
			return;
		}
		if (
			oldQuality > qualityWarningThreshold &&
			quality <= qualityWarningThreshold
		) {
			eventBus.fire(
				new ShowMessageEvent(
					'Note: A quality level below 70% might be very noticeable and impair legibility of text.'
				)
			);
			return;
		}
	}
);
watch(
	() => ppi.value,
	(ppi: number, oldppi: number) => {
		if (!environment.supports.limitedCanvasSpace) return;
		if (
			(oldppi <= 10 && ppi > 10) ||
			(ppi === 0 && panelButtons.value.length > 10)
		) {
			eventBus.fire(
				new ShowMessageEvent(
					'Note: Safari has strict limitations on available memory. More images per panel can easily cause crashes.'
				)
			);
			return;
		}
	}
);
//#endregion Warnings
</script>

<style lang="scss" scoped>
@use '@/styles/fixes.scss';

.row {
	border: 10px solid #fff;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.panel_button {
	height: 150px;
	width: 150px;
	flex-shrink: 0;
	padding: 4px;
	background-size: contain;
	background-position: center center;
	background-repeat: no-repeat;
	background-color: var(--native-background);
	border: 2px solid var(--border);
	display: flex;
	flex-direction: column;

	text-shadow:
		0 0 4px #000,
		-1px -1px 0 #000,
		1px -1px 0 #000,
		-1px 1px 0 #000,
		1px 1px 0 #000;

	&.active {
		background-color: var(--border);
	}

	&:focus-visible {
		background-color: blue;
		outline: none;
	}
}

.panel_text {
	flex-grow: 1;
	position: relative;

	p {
		color: #fff;
		height: 60px;
		overflow: hidden;
		overflow: clip;
		text-overflow: ellipsis;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		white-space: pre;
		user-select: none;
	}
}

input[type='file'] {
	display: none;
}

.panel_nr {
	text-align: right;
	color: #fff;
}

.panel:not(.vertical) {
	#export_ppi,
	#export_pages,
	#export_quality,
	#export_format {
		width: 128px;
	}
}

small {
	font-size: 0.75em;
}

.panel {
	&.vertical {
		.column {
			width: 100%;

			button,
			select {
				width: 100%;
			}
		}

		fieldset {
			width: 100%;

			.existing_panels {
				max-height: 350px;
				width: 100%;
				flex-direction: column;

				.panel_button {
					width: 100%;
					height: 150px;
				}
			}

			table {
				width: 100%;

				td {
					width: 100%;
					display: block;

					> * {
						width: 100%;
					}
				}
			}
		}
	}

	&:not(.vertical) {
		.column {
			display: flex;
			@include fixes.height-100();
			flex-direction: column;
			flex-wrap: wrap;

			textarea {
				height: 100%;
			}
		}

		.existing_panels_fieldset {
			@include fixes.height-100();
		}

		.export_settings {
			height: 100%;
			:deep(fieldset) {
				max-height: 100%;
				height: 100%;
				overflow: auto;
			}
		}

		fieldset {
			.existing_panels {
				flex-direction: row;

				.panel_button {
					height: 100%;
					width: 150px;
				}
			}

			table {
				td {
					white-space: nowrap;
				}
			}
		}
	}
}
</style>
