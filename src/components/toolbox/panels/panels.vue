<template>
	<div class="panel">
		<h1>Panels</h1>
		<fieldset class="existing_panels_fieldset">
			<legend>Existing Panels</legend>
			<div class="existing_panels">
				<div
					v-for="(panel, idx) of panelButtons"
					:key="panel.id"
					:class="{ panel_button: true, active: panel.id === currentPanel }"
					:style="`background-image: url('${panel.image}')`"
					@click="updateCurrentPanel(panel.id)"
				>
					<div class="panel_text">
						<p>{{ panel.text }}</p>
					</div>
					<div class="panel_nr">{{ idx + 1 }}</div>
				</div>
			</div>
		</fieldset>
		<div class="column">
			<button @click="addNewPanel">
				<i class="material-icons">add_to_queue</i> Add new
			</button>
			<button @click="deletePanel" :disabled="!canDeletePanel">
				<i class="material-icons">remove_from_queue</i> Delete panel
			</button>

			<button @click="moveAhead" :disabled="!canMoveAhead">
				<i class="material-icons">arrow_upward</i> Move ahead
			</button>
			<button @click="moveBehind" :disabled="!canMoveBehind">
				<i class="material-icons">arrow_downward</i> Move behind
			</button>
		</div>
		<fieldset>
			<legend>Export</legend>
			<table>
				<tr>
					<td>
						<label for="export_format">Format</label>
					</td>
					<td>
						<select id="export_format" v-model="format">
							<option value="image/png">PNG (lossless)</option>
							<option value="image/webp" v-if="webpSupport"
								>WebP (lossy)</option
							>
							<option value="image/heif" v-if="heifSupport"
								>HEIF (lossy)</option
							>
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
						<input id="export_ppi" type="number" min="0" v-model.number="ppi" />
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
						<button @click="download">
							<i class="material-icons">photo_camera</i> Download
						</button>
					</td>
					<td>
						<button @click="estimateExportSize">Estimate filesizes</button>
					</td>
				</tr>
			</table>
		</fieldset>
	</div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { PanelMixin } from './panelMixin';
import panels, {
	IPanel,
	IDuplicatePanelAction,
	ISetCurrentPanelMutation,
	IDeletePanelAction,
	ISetPanelPreviewMutation,
	IMovePanelAction,
} from '@/store/panels';
import { State } from 'vuex-class-decorator';
import { getAAsset, isWebPSupported, isHeifSupported } from '@/asset-manager';
import { ITextBox } from '@/store/objectTypes/textbox';
import { IHistorySupport } from '@/plugins/vuex-history';
import { SceneRenderer } from '@/renderables/scene-renderer';
import { DeepReadonly } from '@/util/readonly';
import environment from '@/environments/environment';
import leftPad from 'left-pad';
import eventBus, { ShowMessageEvent } from '../../../eventbus/event-bus';
import { screenWidth, screenHeight } from '@/constants/base';
import { IObject } from '../../../store/objects';
import { INotification } from '../../../store/objectTypes/notification';
import { IPoemTextStyle } from '../../../constants/poem';
import { IPoem } from '../../../store/objectTypes/poem';
import { IChoice, IChoices } from '../../../store/objectTypes/choices';

interface IPanelButton {
	id: string;
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

@Component({})
export default class PanelsPanel extends Mixins(PanelMixin) {
	public $store!: Store<DeepReadonly<IRootState>>;
	private vuexHistory!: IHistorySupport;

	@State('currentPanel', { namespace: 'panels' })
	private currentPanel!: string;

	private webpSupport = false;
	private heifSupport = false;
	private ppi = 0;
	private pages = '';
	private format = 'image/png';
	private quality = defaultQuality;

	public async created() {
		(window as any).panelsTool = this;

		[this.webpSupport, this.heifSupport] = await Promise.all([
			isWebPSupported(),
			isHeifSupported(),
		]);
	}

	public async mounted() {
		this.moveFocusToActivePanel();

		const sceneRenderer = new SceneRenderer(
			this.$store,
			this.currentPanel,
			screenWidth,
			screenHeight
		);

		await sceneRenderer.render(false);

		const targetCanvas = document.createElement('canvas');
		targetCanvas.width = screenWidth * thumbnailFactor;
		targetCanvas.height = screenHeight * thumbnailFactor;

		sceneRenderer.paintOnto(
			targetCanvas.getContext('2d')!,
			0,
			0,
			targetCanvas.width,
			targetCanvas.height
		);
		targetCanvas.toBlob(
			blob => {
				if (!blob) return;
				const url = URL.createObjectURL(blob);
				this.vuexHistory.transaction(() => {
					this.$store.commit('panels/setPanelPreview', {
						panelId: this.$store.state.panels.currentPanel,
						url,
					} as ISetPanelPreviewMutation);
				});
			},
			(await isWebPSupported()) ? 'image/webp' : 'image/jpeg',
			thumbnailQuality
		);
	}

	private get isLossy(): boolean {
		return this.format !== 'image/png';
	}

	private async download() {
		const distribution = this.getPanelDistibution();
		const date = new Date();
		const prefix = `cd-${[
			date.getFullYear(),
			leftPad(date.getMonth() + 1, 2, '0'),
			leftPad(date.getDate(), 2, '0'),
			leftPad(date.getHours(), 2, '0'),
			leftPad(date.getMinutes(), 2, '0'),
			leftPad(date.getSeconds(), 2, '0'),
		].join('-')}`;
		const extension = this.format.split('/')[1];
		const format = this.format;
		const quality = this.quality;
		await this.renderObjects(
			distribution,
			true,
			async (imageIdx: number, canvas: HTMLCanvasElement) => {
				environment.saveToFile(
					canvas,
					`${prefix}_${imageIdx}.${extension}`,
					format,
					quality / qualityFactor
				);
			}
		);
	}

	private async estimateExportSize() {
		const distribution = this.getPanelDistibution();
		const format = this.format || 'image/png';
		const quality = this.quality || defaultQuality;
		const sizes = await this.renderObjects(
			distribution,
			false,
			async (imageIdx: number, canvas: HTMLCanvasElement) => {
				return new Promise<number>((resolve, reject) => {
					canvas.toBlob(
						blob => {
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
			size => ((size * estimateFactor) / 1024 / 1024).toFixed(2) + 'MiB'
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
	}

	@Watch('quality')
	private warnImageQuality(quality: number, oldQuality: number) {
		if (quality === qualityFactor) {
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
					'Note: A quality level below 70% might be very noticable and impair legibility of text.'
				)
			);
			return;
		}
	}

	private async renderObjects<T>(
		distribution: DeepReadonly<string[][]>,
		hq: boolean,
		mapper: (imageIdx: number, canvas: HTMLCanvasElement) => Promise<T>
	): Promise<T[]> {
		return await Promise.all(
			distribution.map(async (image, imageIdx) => {
				const targetCanvas = document.createElement('canvas');
				targetCanvas.width = screenWidth;
				targetCanvas.height = screenHeight * image.length;
				const context = targetCanvas.getContext('2d')!;

				await Promise.all(
					image.map(async (panelId, panelIdx) => {
						const sceneRenderer = new SceneRenderer(
							this.$store,
							image[panelIdx],
							screenWidth,
							screenHeight
						);

						await sceneRenderer.render(hq);

						sceneRenderer.paintOnto(
							context,
							0,
							screenHeight * panelIdx,
							screenWidth,
							screenHeight
						);
					})
				);

				return await mapper(imageIdx, targetCanvas);
			})
		);
	}

	private get canDeletePanel(): boolean {
		return this.panelButtons.length > 1;
	}

	private getLimitedPanelList(): DeepReadonly<string[]> {
		const max = this.$store.state.panels.panelOrder.length - 1;
		const min = 0;
		const parts = this.pages.split(',');
		const listedPages: number[] = [];
		let foundMatch = false;

		for (const part of parts) {
			const match = part.match(/^\s*((\d+)|(\d+)\s*\-\s*(\d+))\s*$/);
			if (!match) {
				eventBus.fire(
					new ShowMessageEvent(`Could not read '${part}' in the page list.`)
				);
				continue;
			}
			foundMatch = true;
			/* tslint:disable:no-magic-numbers */
			if (match[2]) listedPages.push(parseInt(match[2], 10) - 1);
			else {
				const from = Math.max(parseInt(match[3], 10) - 1, min);
				const to = Math.min(parseInt(match[4], 10) - 1, max);
				if (from === undefined || to === undefined || from > to) continue;
				for (let i = from; i <= to; ++i) {
					listedPages.push(i);
				}
			}
			/* tslint:enable:no-magic-numbers */
		}

		if (!foundMatch) {
			return this.$store.state.panels.panelOrder;
		}

		return listedPages
			.sort((a, b) => a - b)
			.filter((value, idx, ary) => ary[idx - 1] !== value)
			.map(pageIdx => this.$store.state.panels.panelOrder[pageIdx]);
	}

	private getPanelDistibution(): DeepReadonly<string[][]> {
		const panelOrder = this.getLimitedPanelList();
		if (this.ppi === 0) return [panelOrder];
		const images: string[][] = [];
		for (let imageI = 0; imageI < panelOrder.length / this.ppi; ++imageI) {
			const sliceStart = imageI * this.ppi;
			const sliceEnd = sliceStart + this.ppi;
			images.push([...panelOrder.slice(sliceStart, sliceEnd)]);
		}
		return images;
	}

	private moveFocusToActivePanel() {
		const active = this.$el.querySelector('.panel_button.active');
		if (active) {
			this.scrollIntoView(active);
		}
	}

	private scrollIntoView(ele: Element) {
		const parent = ele.parentElement!;
		const idx = Array.from(parent.children).indexOf(ele);
		if (this.$store.state.ui.vertical) {
			const scroll =
				idx * ele.clientHeight - parent.clientHeight / 2 + ele.clientHeight / 2;
			parent.scrollTop = scroll;
			parent.scrollLeft = 0;
		} else {
			const scroll =
				idx * ele.clientWidth - parent.clientWidth / 2 + ele.clientWidth / 2;
			parent.scrollLeft = scroll;
			parent.scrollTop = 0;
		}
	}

	private get panelButtons(): IPanelButton[] {
		const panelButtons: IPanelButton[] = [];
		const panelOrder = this.$store.state.panels.panelOrder;
		return panelOrder.map(id => {
			const panel = this.$store.state.panels.panels[id];
			const objectOrders = this.$store.state.objects.panels[id];
			const txtBox = objectOrders
				? ([] as string[])
						.concat(objectOrders.order, objectOrders.onTopOrder)
						.map(objId => this.$store.state.objects.objects[objId])
						.map(this.extractObjectText)
				: [];
			return {
				id,
				image: panel.lastRender,
				text: txtBox.reduce(
					(acc, current) => (acc.length > current.length ? acc : current),
					''
				),
			} as IPanelButton;
		});
	}

	private extractObjectText(obj: IObject) {
		switch (obj.type) {
			case 'textBox':
				return (obj as ITextBox).text;
			case 'notification':
				return (obj as INotification).text;
			case 'poem':
				return (obj as IPoem).text;
			case 'choice':
				return (obj as IChoices).choices
					.map(choice => `[${choice.text}]`)
					.join('\n');
		}
		return '';
	}

	private async addNewPanel() {
		await this.vuexHistory.transaction(async () => {
			this.$store.dispatch('panels/duplicatePanel', {
				panelId: this.$store.state.panels.currentPanel,
			} as IDuplicatePanelAction);
		});
		this.$nextTick(() => {
			this.moveFocusToActivePanel();
		});
	}

	private updateCurrentPanel(panelId: string) {
		this.vuexHistory.transaction(async () => {
			this.$store.commit('panels/setCurrentPanel', {
				panelId,
			} as ISetCurrentPanelMutation);
		});
		this.$nextTick(() => {
			this.moveFocusToActivePanel();
		});
	}

	private deletePanel() {
		this.vuexHistory.transaction(async () => {
			this.$store.dispatch('panels/delete', {
				panelId: this.$store.state.panels.currentPanel,
			} as IDeletePanelAction);
		});
		this.$nextTick(() => {
			this.moveFocusToActivePanel();
		});
	}

	private moveAhead() {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('panels/move', {
				panelId: this.currentPanel,
				delta: -1,
			} as IMovePanelAction);
		});
	}

	private get canMoveAhead(): boolean {
		const panelOrder = this.$store.state.panels.panelOrder;
		const idx = panelOrder.indexOf(this.currentPanel);
		return idx > 0;
	}

	private moveBehind() {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('panels/move', {
				panelId: this.currentPanel,
				delta: 1,
			} as IMovePanelAction);
		});
	}

	private get canMoveBehind(): boolean {
		const panelOrder = this.$store.state.panels.panelOrder;
		const idx = panelOrder.indexOf(this.currentPanel);
		return idx < panelOrder.length - 1;
	}
}
</script>

<style lang="scss" scoped>
fieldset {
	.existing_panels {
		display: flex;
		background: #aaaaaa;
		overflow: auto;
	}

	.panel_button {
		height: 150px;
		width: 150px;
		flex-shrink: 0;
		padding: 4px;
		background-size: contain;
		background-position: center center;
		background-repeat: no-repeat;
		background-color: #ffffff;
		border: #ffbde1 2px solid;
		display: flex;
		flex-direction: column;
		color: #ffffff;

		text-shadow: 0 0 4px #000, -1px -1px 0 #000, 1px -1px 0 #000,
			-1px 1px 0 #000, 1px 1px 0 #000;

		&.active {
			background-color: #ffbde1;
		}
	}

	.panel_text {
		flex-grow: 1;
		position: relative;

		p {
			height: 60px;
			overflow: hidden;
			text-overflow: ellipsis;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			white-space: pre;
		}
	}

	.panel_nr {
		text-align: right;
	}
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
		}
	}
	&:not(.vertical) {
		.column {
			display: flex;
			height: 100%;
			flex-direction: column;
			flex-wrap: wrap;

			textarea {
				height: 100%;
			}
		}

		.existing_panels_fieldset {
			height: 100%;
		}

		fieldset {
			.existing_panels {
				max-width: 350px;
				height: calc(100% - 16px);
				flex-direction: row;

				.panel_button {
					height: 100%;
					width: 150px;
				}
			}
		}
	}
}
</style>
