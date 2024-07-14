<!--
	A tab allowing you create, delete, switch and export panels.
	Also allows to save the entire custom dialog.
-->
<template>
	<div class="panel" ref="root">
		<h1>Panels</h1>
		<ImageOptions
			v-if="imageOptions"
			type="panel"
			title=""
			:panel-id="currentPanel.id"
			no-composition
			@leave="
				imageOptions = false;
				renderCurrentThumbnail();
			"
		/>
		<template v-else>
			<d-fieldset class="existing_panels_fieldset" title="Existing Panels">
				<d-flow no-wraping maxSize="350px">
					<div
						v-for="(panel, idx) of panelButtons"
						:key="panel.id"
						:class="{
							panel_button: true,
							active: panel.id === currentPanel.id,
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
				<d-button icon="add_to_queue" @click="addNewPanel"> Add new</d-button>
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
				<d-button class="bt0" icon="color_lens" @click="imageOptions = true">
					Image options
				</d-button>
			</div>
			<d-fieldset title="Export" class="h-h100">
				<table class="v-w100">
					<tr>
						<td>
							<label for="export_format">Format</label>
						</td>
						<td>
							<select id="export_format" v-model="format">
								<option value="image/png">PNG (lossless)</option>
								<option value="image/webp" v-if="webpSupport">
									WebP (lossy)
								</option>
								<option value="image/heif" v-if="heifSupport">
									HEIF (lossy)
								</option>
								<option value="image/jpeg">JPEG (lossy)</option>
								<!-- <option value="image/jpeg">WebM (lossy, video)</option>-->
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
							<d-button icon="photo_camera" class="w100" @click="download">
								Download
							</d-button>
						</td>
					</tr>
				</table>
			</d-fieldset>
			<div class="column">
				<d-button icon="save" @click="save">Save</d-button>
				<d-button class="bt0" icon="folder_open" @click="loadUpload.click()">
					Load
					<input type="file" ref="loadUpload" @change="load" />
				</d-button>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import DButton from '@/components/ui/d-button.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import getConstants from '@/constants';
import environment from '@/environments/environment';
import eventBus, {
	RenderUpdatedEvent,
	ShowMessageEvent,
	StateLoadingEvent,
} from '@/eventbus/event-bus';
import { transaction } from '@/plugins/vuex-history';
import { SceneRenderer } from '@/renderables/scene-renderer';
import { useStore } from '@/store';
import type { IObject } from '@/store/objects';
import type {
	IDeletePanelAction,
	IDuplicatePanelAction,
	IMovePanelAction,
	IPanel,
	ISetCurrentPanelMutation,
	ISetPanelPreviewMutation,
} from '@/store/panels';
import { safeAsync } from '@/util/errors';
import type { DeepReadonly } from 'ts-essentials';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import ImageOptions from '../subtools/image-options/image-options.vue';

interface IPanelButton {
	id: IPanel['id'];
	image: string;
	text: string;
}

const qualityFactor = 100;
const defaultQuality = 90;
const qualityWarningThreshold = 70;

const store = useStore();
const root = ref(null! as HTMLElement);
const { vertical, getRoot } = setupPanelMixin(root);

const ppi = ref(environment.supports.limitedCanvasSpace ? 10 : 0);
const pages = ref('');
const format = ref('image/png');
const quality = ref(defaultQuality);
const imageOptions = ref(false);
const loadUpload = ref(null! as HTMLInputElement);
const baseConst = getConstants().Base;

const currentPanel = computed(
	() => store.state.panels.panels[store.state.panels.currentPanel]
);
const isLossy = computed(() => format.value !== 'image/png');
const canDeletePanel = computed(() => panelButtons.value.length > 1);

function emptyStringInInt(v: string | number) {
	if (v === '') return true;
	return false;
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
import type { IChoices } from '@/store/object-types/choices';
import type { INotification } from '@/store/object-types/notification';
import type { IPoem } from '@/store/object-types/poem';
import type { ITextBox } from '@/store/object-types/textbox';

const canMoveAhead = computed((): boolean => {
	const panelOrder = store.state.panels.panelOrder;
	const idx = panelOrder.indexOf(currentPanel.value.id);
	return idx > 0;
});

const canMoveBehind = computed((): boolean => {
	const panelOrder = store.state.panels.panelOrder;
	const idx = panelOrder.indexOf(currentPanel.value.id);
	return idx < panelOrder.length - 1;
});

const panelButtons = computed((): IPanelButton[] => {
	const panelOrder = store.state.panels.panelOrder;
	return panelOrder.map((id) => {
		const panel = store.state.panels.panels[id];
		const objectOrders = store.state.panels.panels[id];
		const txtBox = [...objectOrders.order, ...objectOrders.onTopOrder]
			.map((objId) => store.state.panels.panels[id].objects[objId])
			.map(extractObjectText);
		return {
			id,
			image: panel.lastRender,
			text: txtBox.reduce(
				(acc, current) => (acc.length > current.length ? acc : current),
				''
			),
		} as IPanelButton;
	});
});

function extractObjectText(obj: DeepReadonly<IObject>) {
	switch (obj.type) {
		case 'textBox':
			return (obj as ITextBox).text;
		case 'notification':
			return (obj as INotification).text;
		case 'poem':
			return (obj as IPoem).text;
		case 'choice':
			return (obj as IChoices).choices
				.map((choice) => `[${choice.text}]`)
				.join('\n');
	}
	return '';
}
function moveFocusToActivePanel() {
	const active = getRoot().querySelector('.panel_button.active') as HTMLElement;
	if (active != null) {
		scrollIntoView(active);
	}
}
function scrollIntoView(ele: HTMLElement) {
	const parent = ele.parentElement!.parentElement!;
	if (store.state.ui.vertical) {
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
		const prefix = getDownloadFilenamePrefix();
		await renderObjects(
			distribution,
			true,
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
	distribution: DeepReadonly<IPanel['id'][][]>,
	hq: boolean,
	mapper: (imageIdx: number, canvas: HTMLCanvasElement) => Promise<T>
): Promise<T[]> {
	const baseConst = getConstants().Base;
	const ret = [];
	for (let imageIdx = 0; imageIdx < distribution.length; ++imageIdx) {
		const image = distribution[imageIdx];
		const targetCanvas = document.createElement('canvas');
		targetCanvas.width = baseConst.screenWidth;
		targetCanvas.height = baseConst.screenHeight * image.length;
		try {
			const context = targetCanvas.getContext('2d')!;

			for (let panelIdx = 0; panelIdx < image.length; ++panelIdx) {
				const panelId = image[panelIdx];
				const sceneRenderer = new SceneRenderer(
					store,
					panelId,
					baseConst.screenWidth,
					baseConst.screenHeight
				);
				try {
					await sceneRenderer.render(hq, false, true);

					sceneRenderer.paintOnto(context, {
						x: 0,
						y: baseConst.screenHeight * panelIdx,
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
function getLimitedPanelList(): DeepReadonly<IPanel['id'][]> {
	const max = store.state.panels.panelOrder.length - 1;
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
					new ShowMessageEvent(`Could not read '${part}' in the page list.`)
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
		return store.state.panels.panelOrder;
	}

	return listedPages
		.sort((a, b) => a - b)
		.filter((value, idx, ary) => ary[idx - 1] !== value)
		.map((pageIdx) => store.state.panels.panelOrder[pageIdx]);
}
function getPanelDistibution(): DeepReadonly<IPanel['id'][][]> {
	const panelOrder = getLimitedPanelList();
	if (isNaN(ppi.value)) {
		ppi.value = 0;
	}
	if (ppi.value === 0) return [panelOrder];
	const images: IPanel['id'][][] = [];
	for (let imageI = 0; imageI < panelOrder.length / ppi.value; ++imageI) {
		const sliceStart = imageI * ppi.value;
		const sliceEnd = sliceStart + ppi.value;
		images.push([...panelOrder.slice(sliceStart, sliceEnd)]);
	}
	return images;
}
//#endregion Download
//#region Actions
async function addNewPanel(): Promise<void> {
	await transaction(async () => {
		await store.dispatch('panels/duplicatePanel', {
			panelId: store.state.panels.currentPanel,
		} as IDuplicatePanelAction);
	});
	await nextTick();
	moveFocusToActivePanel();
}
function updateCurrentPanel(panelId: IPanel['id']) {
	transaction(() => {
		store.commit('panels/setCurrentPanel', {
			panelId,
		} as ISetCurrentPanelMutation);
	});
	nextTick(() => {
		moveFocusToActivePanel();
	});
}
function deletePanel() {
	transaction(async () => {
		await store.dispatch('panels/delete', {
			panelId: store.state.panels.currentPanel,
		} as IDeletePanelAction);
	});
	nextTick(() => {
		moveFocusToActivePanel();
	});
}
function moveAhead() {
	transaction(async () => {
		await store.dispatch('panels/move', {
			panelId: currentPanel.value.id,
			delta: -1,
		} as IMovePanelAction);
	});
}
function moveBehind() {
	transaction(async () => {
		await store.dispatch('panels/move', {
			panelId: currentPanel.value.id,
			delta: 1,
		} as IMovePanelAction);
	});
}
//#endregion Actions
//#region Thumbnails
import { getMainSceneRenderer } from '@/renderables/main-scene-renderer';
import { disposeCanvas, makeCanvas } from '@/util/canvas';

const thumbnailFactor = 1 / 4;
const thumbnailQuality = 0.5;
const targetCanvas = makeCanvas();
targetCanvas.width = baseConst.screenWidth * thumbnailFactor;
targetCanvas.height = baseConst.screenHeight * thumbnailFactor;
const thumbnailCtx = targetCanvas.getContext('2d')!;
const isMounted = ref(false);

const missingThumbnails = computed((): IPanel['id'][] => {
	const panelOrder = store.state.panels.panelOrder;
	return panelOrder.filter((id) => {
		const panel = store.state.panels.panels[id];
		return panel.lastRender == null;
	});
});

async function renderCurrentThumbnail() {
	// FIXME: This sadly makes it so the selection halo is visible in the thumbnails.
	//        The renderer will lose that once the panels tab is selected, so maybe delay this?
	const sceneRenderer = getMainSceneRenderer(store);
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
				const url = URL.createObjectURL(blob);
				transaction(() => {
					store.commit('panels/setPanelPreview', {
						panelId,
						url,
					} as ISetPanelPreviewMutation);
				});
			},
			(await isWebPSupported()) ? 'image/webp' : 'image/jpeg',
			thumbnailQuality
		);
	});
}

async function restoreThumbnails() {
	const baseConst = getConstants().Base;
	if (!isMounted.value) return;
	if (environment.supports.limitedCanvasSpace) return;
	const missingThumbnails_ = missingThumbnails.value;
	if (missingThumbnails_.length === 0) return;
	const toRender = missingThumbnails_[0];
	const localRenderer = new SceneRenderer(
		store,
		toRender,
		baseConst.screenWidth,
		baseConst.screenHeight
	);

	await localRenderer.render(false, false, true);

	await renderPanelThumbnail(localRenderer);
	setTimeout(() => {
		restoreThumbnails();
	}, 500);
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
	const str = await store.dispatch('getSave', true);
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
		await store.dispatch('loadSave', data);
		if (environment.supports.limitedCanvasSpace) {
			eventBus.fire(
				new ShowMessageEvent(
					'To prevent running out of memory, thumbnails will not be automatically restored in the background.'
				)
			);
		}
	});

	await renderCurrentThumbnail();

	setTimeout(() => {
		restoreThumbnails();
	}, 1000);
}

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
.panel_button {
	height: 150px;
	width: 150px;
	flex-shrink: 0;
	padding: 4px;
	background-size: contain;
	background-position: center center;
	background-repeat: no-repeat;
	//noinspection CssOverwrittenProperties
	background-color: $default-native-background;
	//noinspection CssOverwrittenProperties
	background-color: var(--native-background);
	border: 2px solid $default-border;
	//noinspection CssOverwrittenProperties
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
		//noinspection CssOverwrittenProperties
		background-color: $default-border;
		//noinspection CssOverwrittenProperties
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
			@include height-100();
			flex-direction: column;
			flex-wrap: wrap;

			textarea {
				height: 100%;
			}
		}

		.existing_panels_fieldset {
			@include height-100();
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
