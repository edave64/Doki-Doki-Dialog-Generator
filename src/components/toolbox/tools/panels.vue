<!--
	A tab allowing you create, delete, switch and export panels.
	Also allows to save the entire custom dialog.
-->
<template>
	<div class="panel">
		<h1>Panels</h1>
		<image-options
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
					@click="deletePanel"
					:disabled="!canDeletePanel"
				>
					Delete panel
				</d-button>

				<d-button
					icon="arrow_upward"
					@click="moveAhead"
					:disabled="!canMoveAhead"
				>
					Move ahead
				</d-button>
				<d-button
					icon="arrow_downward"
					@click="moveBehind"
					:disabled="!canMoveBehind"
				>
					Move behind
				</d-button>
				<d-button icon="color_lens" @click="imageOptions = true">
					Image options
				</d-button>
			</div>
			<d-fieldset title="Export">
				<table>
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
								<br /><small>(0 for one single image)</small>
							</label>
						</td>
						<td>
							<input
								id="export_ppi"
								type="number"
								min="0"
								v-model.number="ppi"
								@keydown.stop
								@blur="if (ppi === '') ppi = 0;"
							/>
						</td>
					</tr>
					<tr>
						<td>
							<label for="export_pages">
								Panels to export:
								<br /><small>(Leave empty for all)</small>
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
						<td>
							<d-button icon="photo_camera" @click="download">
								Download
							</d-button>
						</td>
						<td>
							<button @click="estimateExportSize">Estimate filesizes</button>
						</td>
					</tr>
				</table>
			</d-fieldset>
			<div class="column">
				<d-button icon="save" @click="save">Save</d-button>
				<d-button icon="folder_open" @click="$refs.loadUpload.click()">
					Load
					<input type="file" ref="loadUpload" @change="load" />
				</d-button>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
import { PanelMixin } from './panelMixin';
import {
	IDeletePanelAction,
	IDuplicatePanelAction,
	IMovePanelAction,
	IPanel,
	ISetCurrentPanelMutation,
	ISetPanelPreviewMutation,
} from '@/store/panels';
import { isHeifSupported, isWebPSupported } from '@/asset-manager';
import { ITextBox } from '@/store/objectTypes/textbox';
import { SceneRenderer } from '@/renderables/scene-renderer';
import { DeepReadonly } from 'ts-essentials';
import environment from '@/environments/environment';
import eventBus, {
	RenderUpdatedEvent,
	ShowMessageEvent,
	StateLoadingEvent,
} from '@/eventbus/event-bus';
import { IObject } from '@/store/objects';
import { INotification } from '@/store/objectTypes/notification';
import { IPoem } from '@/store/objectTypes/poem';
import { IChoices } from '@/store/objectTypes/choices';
import { defineComponent, markRaw } from 'vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import DFlow from '@/components/ui/d-flow.vue';
import DButton from '@/components/ui/d-button.vue';
import ImageOptions from '../subtools/image-options/image-options.vue';
import getConstants from '@/constants';
import { safeAsync } from '@/util/errors';
import { makeCanvas, disposeCanvas } from '@/util/canvas';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { transaction } from '@/plugins/vuex-history';

interface IPanelButton {
	id: IPanel['id'];
	image: string;
	text: string;
}

// tslint:disable: no-magic-numbers
const estimateFactor = 1.5;
const thumbnailFactor = 1 / 4;
const thumbnailQuality = 0.5;
const qualityFactor = 100;

const defaultQuality = 90;

const qualityWarningThreshold = 70;
// tslint:enable: no-magic-numbers

export default defineComponent({
	mixins: [PanelMixin],
	components: { DFieldset, DFlow, DButton, ImageOptions },
	data: () => ({
		webpSupport: false,
		heifSupport: false,
		ppi: environment.supports.limitedCanvasSpace ? 10 : 0,
		pages: '',
		format: 'image/png',
		quality: defaultQuality,
		imageOptions: false,
		isMounted: false,
		thumbnailCtx: null! as CanvasRenderingContext2D,
	}),
	computed: {
		currentPanel(): DeepReadonly<IPanel> {
			return this.$store.state.panels.panels[
				this.$store.state.panels.currentPanel
			];
		},

		isLossy(): boolean {
			return this.format !== 'image/png';
		},

		canDeletePanel(): boolean {
			return this.panelButtons.length > 1;
		},

		panelButtons(): IPanelButton[] {
			const panelOrder = this.$store.state.panels.panelOrder;
			return panelOrder.map((id) => {
				const panel = this.$store.state.panels.panels[id];
				const objectOrders = this.$store.state.panels.panels[id];
				const txtBox = [...objectOrders.order, ...objectOrders.onTopOrder]
					.map((objId) => this.$store.state.panels.panels[id].objects[objId])
					.map(this.extractObjectText);
				return {
					id,
					image: panel.lastRender,
					text: txtBox.reduce(
						(acc, current) => (acc.length > current.length ? acc : current),
						''
					),
				} as IPanelButton;
			});
		},

		canMoveAhead(): boolean {
			const panelOrder = this.$store.state.panels.panelOrder;
			const idx = panelOrder.indexOf(this.currentPanel.id);
			return idx > 0;
		},

		canMoveBehind(): boolean {
			const panelOrder = this.$store.state.panels.panelOrder;
			const idx = panelOrder.indexOf(this.currentPanel.id);
			return idx < panelOrder.length - 1;
		},

		missingThumbnails(): IPanel['id'][] {
			const store = (this as any).$store as Store<DeepReadonly<IRootState>>;
			const panelOrder = store.state.panels.panelOrder;
			return panelOrder.filter((id) => {
				const panel = store.state.panels.panels[id];
				return panel.lastRender == null;
			});
		},
	},
	async created() {
		eventBus.subscribe(RenderUpdatedEvent, () =>
			requestAnimationFrame(() => this.renderCurrentThumbnail())
		);
		const baseConst = getConstants().Base;
		const targetCanvas = makeCanvas();
		targetCanvas.width = baseConst.screenWidth * thumbnailFactor;
		targetCanvas.height = baseConst.screenHeight * thumbnailFactor;
		this.thumbnailCtx = markRaw(targetCanvas.getContext('2d')!);
		[this.webpSupport, this.heifSupport] = await Promise.all([
			isWebPSupported(),
			isHeifSupported(),
		]);
	},
	mounted() {
		this.isMounted = true;
		this.moveFocusToActivePanel();
		requestAnimationFrame(() => this.renderCurrentThumbnail().catch(() => {}));
	},
	unmounted() {
		this.isMounted = false;
		disposeCanvas(this.thumbnailCtx.canvas);
	},
	methods: {
		async restoreThumbnails() {
			const baseConst = getConstants().Base;
			if (!this.isMounted) return;
			if (environment.supports.limitedCanvasSpace) return;
			const missingThumbnails = this.missingThumbnails;
			if (missingThumbnails.length === 0) return;
			const toRender = missingThumbnails[0];
			const localRenderer = new SceneRenderer(
				this.$store,
				toRender,
				baseConst.screenWidth,
				baseConst.screenHeight
			);

			await localRenderer.render(false, false, true);

			await this.renderPanelThumbnail(localRenderer);
			setTimeout(() => {
				this.restoreThumbnails();
			}, 500);
		},
		async download() {
			await safeAsync('export image', async () => {
				const distribution = this.getPanelDistibution();
				const date = new Date();
				const prefix = `cd-${[
					date.getFullYear(),
					`${date.getMonth() + 1}`.padStart(2, '0'),
					`${date.getDate()}`.padStart(2, '0'),
					`${date.getHours()}`.padStart(2, '0'),
					`${date.getMinutes()}`.padStart(2, '0'),
					`${date.getSeconds()}`.padStart(2, '0'),
				].join('-')}`;
				const extension = this.format.split('/')[1];
				const format = this.format;
				const quality = this.quality;
				await this.renderObjects(
					distribution,
					true,
					async (imageIdx: number, canvasEle: HTMLCanvasElement) => {
						await environment.saveToFile(
							canvasEle,
							`${prefix}_${imageIdx}.${extension}`,
							format,
							quality / qualityFactor
						);
					}
				);
			});
		},
		async estimateExportSize() {
			const distribution = this.getPanelDistibution();
			const format = this.format || 'image/png';
			const quality = this.quality || defaultQuality;
			const sizes = await this.renderObjects(
				distribution,
				false,
				(imageIdx: number, canvasEle: HTMLCanvasElement) => {
					return new Promise<number>((resolve, reject) => {
						canvasEle.toBlob(
							(blob) => {
								if (!blob) {
									reject(`Image ${imageIdx + 1} could not be rendered.`);
									return;
								}
								resolve(blob.size);
							},
							format,
							quality / qualityFactor
						);
					});
				}
			);
			const readableSizes = sizes.map(
				(size) => ((size * estimateFactor) / 1024 / 1024).toFixed(2) + 'MiB'
			);
			const filePluralize = readableSizes.length > 1 ? 'files' : 'file';
			const itPluralize = readableSizes.length > 1 ? 'These' : 'It';
			const sizePluralize = readableSizes.length > 1 ? 'sizes' : 'size';
			eventBus.fire(
				new ShowMessageEvent(
					`This would export ${
						readableSizes.length
					} ${filePluralize}. ${itPluralize} would have the following (aproximate) ${sizePluralize}: ${readableSizes.join(
						','
					)}`
				)
			);
		},
		async renderObjects<T>(
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
							this.$store,
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
		},
		getLimitedPanelList(): DeepReadonly<IPanel['id'][]> {
			const max = this.$store.state.panels.panelOrder.length - 1;
			const min = 0;
			const parts = this.pages.split(',');
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
				return this.$store.state.panels.panelOrder;
			}

			return listedPages
				.sort((a, b) => a - b)
				.filter((value, idx, ary) => ary[idx - 1] !== value)
				.map((pageIdx) => this.$store.state.panels.panelOrder[pageIdx]);
		},
		getPanelDistibution(): DeepReadonly<IPanel['id'][][]> {
			const panelOrder = this.getLimitedPanelList();
			if (isNaN(this.ppi)) {
				this.ppi = 0;
			}
			if (this.ppi === 0) return [panelOrder];
			const images: IPanel['id'][][] = [];
			for (let imageI = 0; imageI < panelOrder.length / this.ppi; ++imageI) {
				const sliceStart = imageI * this.ppi;
				const sliceEnd = sliceStart + this.ppi;
				images.push([...panelOrder.slice(sliceStart, sliceEnd)]);
			}
			return images;
		},
		moveFocusToActivePanel() {
			const active = this.$el.querySelector('.panel_button.active');
			if (active) {
				this.scrollIntoView(active);
			}
		},
		scrollIntoView(ele: HTMLElement) {
			const parent = ele.parentElement!.parentElement!;
			if (this.$store.state.ui.vertical) {
				parent.scrollTop = ele.offsetTop - parent.clientHeight / 2;
				parent.scrollLeft = 0;
			} else {
				parent.scrollLeft = ele.offsetLeft - parent.clientWidth / 2;
				parent.scrollTop = 0;
			}
		},
		extractObjectText(obj: DeepReadonly<IObject>) {
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
		},
		async addNewPanel(): Promise<void> {
			await transaction(async () => {
				await this.$store.dispatch('panels/duplicatePanel', {
					panelId: this.$store.state.panels.currentPanel,
				} as IDuplicatePanelAction);
			});
			await this.$nextTick();
			this.moveFocusToActivePanel();
		},
		updateCurrentPanel(panelId: IPanel['id']) {
			transaction(() => {
				this.$store.commit('panels/setCurrentPanel', {
					panelId,
				} as ISetCurrentPanelMutation);
			});
			this.$nextTick(() => {
				this.moveFocusToActivePanel();
			});
		},
		deletePanel() {
			transaction(async () => {
				await this.$store.dispatch('panels/delete', {
					panelId: this.$store.state.panels.currentPanel,
				} as IDeletePanelAction);
			});
			this.$nextTick(() => {
				this.moveFocusToActivePanel();
			});
		},
		moveAhead() {
			transaction(async () => {
				await this.$store.dispatch('panels/move', {
					panelId: this.currentPanel.id,
					delta: -1,
				} as IMovePanelAction);
			});
		},
		moveBehind() {
			transaction(async () => {
				await this.$store.dispatch('panels/move', {
					panelId: this.currentPanel.id,
					delta: 1,
				} as IMovePanelAction);
			});
		},
		async renderCurrentThumbnail() {
			// Warning, ugly hack incoming:
			// getMainSceneRenderer is a bridge set up by renderer.vue, that allows us to
			// borrow its renderer. It already contains the fully rendered scene, so
			// we just need to stick it in a thumbnail.
			// FIXME: This sadly makes it so the selection halo is visible in the thumbnails.
			//        The renderer will lose that once the panels tab is selected, so maybe delay this?
			const getMainSceneRenderer: undefined | (() => SceneRenderer | null) = (
				window as any
			).getMainSceneRenderer;
			const sceneRenderer = getMainSceneRenderer && getMainSceneRenderer();

			// Suboptimal. But whatever, it's just a thumbnail...
			if (!sceneRenderer) return;

			await this.renderPanelThumbnail(sceneRenderer);
		},
		async renderPanelThumbnail(sceneRenderer: SceneRenderer) {
			await safeAsync('render thumbnail', async () => {
				const panelId = sceneRenderer.panelId;
				sceneRenderer.paintOnto(this.thumbnailCtx, {
					x: 0,
					y: 0,
					w: this.thumbnailCtx.canvas.width,
					h: this.thumbnailCtx.canvas.height,
				});

				this.thumbnailCtx.canvas.toBlob(
					(blob) => {
						if (!blob) return;
						const url = URL.createObjectURL(blob);
						transaction(() => {
							this.$store.commit('panels/setPanelPreview', {
								panelId,
								url,
							} as ISetPanelPreviewMutation);
						});
					},
					(await isWebPSupported()) ? 'image/webp' : 'image/jpeg',
					thumbnailQuality
				);
			});
		},
		async save() {
			const str = await this.$store.dispatch('getSave', true);
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
		},
		async load() {
			await transaction(async () => {
				const uploadInput = this.$refs.loadUpload as HTMLInputElement;
				if (!uploadInput.files) return;
				eventBus.fire(new StateLoadingEvent());
				const data = await blobToText(uploadInput.files[0]);
				await this.$store.dispatch('loadSave', data);
				if (environment.supports.limitedCanvasSpace) {
					eventBus.fire(
						new ShowMessageEvent(
							'To prevent running out of memory, thumbnails will not be automatically restored in the background.'
						)
					);
				}
			});

			await this.renderCurrentThumbnail();

			setTimeout(() => {
				this.restoreThumbnails();
			}, 1000);
		},
	},
	watch: {
		quality(quality: number, oldQuality: number) {
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
		},
		ppi(ppi: number, oldppi: number) {
			if (!environment.supports.limitedCanvasSpace) return;
			if (
				(oldppi <= 10 && ppi > 10) ||
				(ppi === 0 && this.panelButtons.length > 10)
			) {
				eventBus.fire(
					new ShowMessageEvent(
						'Note: Safari has strict limitations on available memory. More images per panel can easily cause crashes.'
					)
				);
				return;
			}
		},
	},
});

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

	text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
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

#export_ppi,
#export_pages {
	width: 128px;
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
					display: table-row;
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
