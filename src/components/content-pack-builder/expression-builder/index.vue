<template>
	<div class="wrapper" @dragenter="dragEnter" @mouseleave="hideDt">
		<h1>Add expressions</h1>
		<selector
			v-if="!headGroup"
			label="What kind of expression would you like to add?"
		>
			<selection
				v-for="headgroup of availableHeadGroups"
				:key="headgroup.name"
				:label="normalizeName(headgroup.name)"
				:images="headgroup.preview"
				@selected="headGroup = headgroup"
			/>
		</selector>
		<selector
			v-else-if="!method"
			label="How would you like to add the new expressions?"
		>
			<selection
				label="Build expressions from parts"
				icon="info"
				:disabled="hasParts"
				@selected="method = 'parts'"
			/>
			<selection
				label="Upload expression images"
				icon="info"
				@selected="method = 'upload'"
			/>
		</selector>
		<template v-else-if="method === 'upload'">
			<div v-if="!uploadsFinished" class="page">
				<h2>
					Upload new '{{ normalizeName(headGroup.name) }}' expressions
					<l v-if="downloadLink" :to="downloadLink">(Template)</l>
					<l v-if="listLink" :to="listLink">(List)</l>
				</h2>
				<drop-target ref="dt" class="drop-target" @drop="addByImageFile"
					>Drop here to add as a new expression
				</drop-target>
				<div class="expression_list_wrapper">
					<div class="expression_list" @wheel.passive="verticalScrollRedirect">
						<button @click="$refs.upload.click()">
							Upload expression
							<input type="file" ref="upload" multiple @change="addByUpload" />
						</button>
						<button @click="addByUrl">Add expression from URL</button>
						<div
							v-for="(expression, idx) of uploadedExpressions"
							:key="idx"
							:style="{ backgroundImage: `url('${expression}')` }"
							:class="{
								expression_item: true,
								active: currentUploadedExpression === expression,
							}"
							@click="currentUploadedExpression = expression"
						></div>
					</div>
					<div class="options_wrapper">
						<div class="image">
							<canvas
								ref="target"
								:width="previewPoses[previewPoseIdx].width"
								:height="previewPoses[previewPoseIdx].height"
							/>
						</div>
						<div>
							Preview pose:
							<select v-model="previewPoseIdx">
								<option
									v-for="(pose, idx) of previewPoses"
									:key="idx"
									:value="idx"
								>
									{{ normalizeName(pose.name) }}
								</option>
							</select>
							<d-fieldset title="Offset">
								<table>
									<tr>
										<th>X:</th>
										<td>
											<input
												type="number"
												v-model.number="offsetX"
												@keydown.stop
											/>
										</td>
										<th>Y:</th>
										<td>
											<input
												type="number"
												v-model.number="offsetY"
												@keydown.stop
											/>
										</td>
									</tr>
								</table>
							</d-fieldset>
							<toggle-box
								label="Reduce to fit DDDG standard"
								v-if="headGroup.imagePatching && headGroup.imagePatching.mask"
								v-model="addMask"
							/>
							<toggle-box
								label="Add new parts to fit DDDG standard"
								v-if="
									headGroup.imagePatching && headGroup.imagePatching.addition
								"
								v-model="addExtras"
							/>
							<button
								:disabled="currentUploadedExpression === null"
								@click="removeUploadedExpression"
							>
								Remove this expression
							</button>
							<button @click="finishUpload">Finish</button>
							<button @click="leave">Abort</button>
						</div>
					</div>
				</div>
			</div>
			<div v-else>
				<h2>
					Finishing up images. {{ Math.round(batchRunner.percentage * 100) }}%
				</h2>
			</div>
		</template>
	</div>
</template>

<script lang="ts">
// App.vue has currently so many responsiblities that it's best to break it into chunks
import Selection from './selection.vue';
import Selector from './selector.vue';
import DropTarget from '../../toolbox/drop-target.vue';
import ToggleBox from '@/components/toggle.vue';
import environment from '@/environments/environment';
import { VerticalScrollRedirect } from '@/components/vertical-scroll-redirect';
import DFieldset from '@/components/ui/d-fieldset.vue';
import { Character } from '@/renderables/character';
import {
	Character as CharacterModel,
	ContentPack,
	IHeadCommand,
	Pose,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset, ReplaceContentPackAction } from '@/store/content';
import { getAssetByUrl } from '@/asset-manager';
import { Renderer } from '@/renderer/renderer';
import { WorkBatch } from '@/util/workBatch';
import { defineComponent } from 'vue';
import { DeepReadonly } from 'ts-essentials';
import L from '@/components/ui/link.vue';

const uploadedExpressionsPack: ContentPack<string> = {
	packId: 'dddg.buildin.uploadedExpressions',
	dependencies: [],
	packCredits: [],
	characters: [],
	fonts: [],
	sprites: [],
	poemStyles: [],
	poemBackgrounds: [],
	backgrounds: [],
	colors: [],
};

const masks: { [s: string]: string | undefined } = {
	'dddg.buildin.base.monika:straight': 'assets/mask/monika-a-mask.png',
	'dddg.buildin.base.monika:sideways': 'assets/mask/monika-b-mask.png',
	'dddg.buildin.base.natsuki:straight': 'assets/mask/natsuki-a-mask.png',
	'dddg.buildin.base.natsuki:sideways': 'assets/mask/natsuki-b-mask.png',
	'dddg.buildin.base.natsuki:turnedAway': 'assets/mask/natsuki-c-mask.png',
	'dddg.buildin.base.sayori:straight': 'assets/mask/sayori-a-mask.png',
	'dddg.buildin.base.sayori:sideways': 'assets/mask/sayori-b-mask.png',
	'dddg.buildin.base.yuri:straight': 'assets/mask/yuri-a-mask.png',
	'dddg.buildin.base.yuri:sideways': 'assets/mask/yuri-b-mask.png',
};

const adds: { [s: string]: string | undefined } = {
	'dddg.buildin.base.natsuki:straight': 'assets/mask/natsuki-a-add.png',
};

const baseUrl =
	'https://github.com/edave64/Doki-Doki-Dialog-Generator/tree/master/public/assets/';

const listPaths: { [s: string]: string | undefined } = {
	'dddg.buildin.base.monika:ddlc.monika': `${baseUrl}monika`,
	'dddg.buildin.base.natsuki:ddlc.natsuki': `${baseUrl}natsuki`,
	'dddg.buildin.base.sayori:ddlc.sayori': `${baseUrl}sayori`,
	'dddg.buildin.base.yuri:ddlc.yuri': `${baseUrl}yuri`,
	'dddg.buildin.amy1:ddlc.fan.amy1': `${baseUrl}classic_amy`,
	'dddg.buildin.amy2:ddlc.fan.amy2': `${baseUrl}amy`,
	'dddg.buildin.femc:ddlc.fan.femc': `${baseUrl}femc`,
	'dddg.buildin.femc:ddlc.fan.femc:straight_lh': `${baseUrl}femc_lh`,
	'dddg.buildin.femc:ddlc.fan.femc:straight_hetero': `${baseUrl}femc/hetero`,
	'dddg.buildin.femc:ddlc.fan.femc:straight_hetero_lh': `${baseUrl}femc_lh/hetero`,
	'dddg.buildin.mc_classic:ddlc.fan.mc1': `${baseUrl}classic_mc`,
	'dddg.buildin.mc:ddlc.fan.mc2': `${baseUrl}mc`,
	'dddg.buildin.mc:ddlc.fan.mc2:straight_red': `${baseUrl}mc/red`,
	'dddg.buildin.mc_chad:ddlc.fan.mc_chad': `${baseUrl}chad`,
	'dddg.buildin.mc_chad:ddlc.fan.mc_chad:straight_red': `${baseUrl}chad/red`,
};

const partFiles: { [s: string]: string[] | undefined } = {};

const charDefDefaults = {
	type: 'character' as 'character',
	characterType: '',
	freeMove: false,
	close: false,
	styleGroupId: 0,
	styleId: 0,
	poseId: 0,
	posePositions: {},
	panelId: '',
	id: '',
	y: 0,
	rotation: 0,
	preserveRatio: true,
	ratio: 1,
	opacity: 100,
	version: 1,
	flip: false,
	onTop: false,
	composite: 'source-over' as 'source-over',
	filters: [],
};

export default defineComponent({
	mixins: [VerticalScrollRedirect],
	components: { Selection, Selector, ToggleBox, DropTarget, DFieldset, L },
	props: {
		character: {
			type: String,
			required: true,
		},
		initHeadGroup: String,
	},
	data: () => ({
		method: 'upload' as null | 'upload' | 'parts',
		headGroup: null as null | IHeadGroup,
		uploadsFinished: false,
		everythingBroken: false,
		uploadedExpressions: [] as string[],
		currentUploadedExpression: null as string | null,
		previewPoseIdx: 0,
		offsetX: 0,
		offsetY: 0,
		addMask: false,
		addExtras: false,
		batchRunner: null! as WorkBatch<string, string>,
	}),
	created() {
		(window as any).exp = this;
		this.batchRunner = new WorkBatch<string, string>(
			this.processExpression.bind(this),
			async () => {}
		);
		if (this.initHeadGroup) {
			this.headGroup = this.availableHeadGroups.find(
				(group) => group.name === this.initHeadGroup
			)!;
		}
		this.applySingleHeadGroup();
	},
	watch: {
		availableHeadGroups() {
			this.applySingleHeadGroup();
		},
		previewPoseIdx() {
			this.redraw();
		},
		previewPoses() {
			this.redraw();
		},
		currentUploadedExpression() {
			this.redraw();
		},
		offsetX() {
			this.redraw();
		},
		offsetY() {
			this.redraw();
		},
		addMask() {
			this.redraw();
		},
		addExtras() {
			this.redraw();
		},
	},
	methods: {
		applySingleHeadGroup() {
			if (this.availableHeadGroups.length === 1) {
				this.headGroup = this.availableHeadGroups[0];
			}
		},

		async addByUpload(): Promise<void> {
			const uploadInput = this.$refs.upload as HTMLInputElement;
			if (!uploadInput.files) return;
			for (const file of uploadInput.files) {
				this.addByImageFile(file);
			}
		},

		addByImageFile(file: File) {
			const url = URL.createObjectURL(file);
			this.addUrl(url);
		},

		async addByUrl(): Promise<void> {
			const url = await environment.prompt('Enter the url of the image.', '');
			if (!url) return;
			this.addUrl(url);
		},

		addUrl(url: string): void {
			this.currentUploadedExpression = url;
			this.uploadedExpressions.push(url);
		},

		async processExpression(
			expression: string,
			isRunning: () => boolean
		): Promise<string | undefined> {
			const asset = (await getAssetByUrl(expression)) as HTMLImageElement;
			if (!isRunning()) return undefined;
			const renderer = new Renderer(
				asset.width + this.offsetX,
				asset.height + this.offsetY
			);
			const blob = await renderer.renderToBlob(async (rx) => {
				rx.drawImage({
					image: asset,
					x: this.offsetX,
					y: this.offsetY,
					w: asset.width,
					h: asset.height,
				});

				if (
					this.addMask &&
					this.headGroup &&
					this.headGroup.imagePatching &&
					this.headGroup.imagePatching.mask
				) {
					const mask = (await getAssetByUrl(
						this.headGroup.imagePatching.mask
					)) as HTMLImageElement;
					if (!isRunning()) return undefined;
					rx.drawImage({
						image: mask,
						x: 0,
						y: 0,
						w: mask.width,
						h: mask.height,
						composite: 'destination-in',
					});
				}

				if (
					this.addExtras &&
					this.headGroup &&
					this.headGroup.imagePatching &&
					this.headGroup.imagePatching.addition
				) {
					const addition = (await getAssetByUrl(
						this.headGroup.imagePatching.addition
					)) as HTMLImageElement;
					if (!isRunning()) return undefined;
					rx.drawImage({
						image: addition,
						x: 0,
						y: 0,
						w: addition.width,
						h: addition.height,
					});
				}
			});
			const finalExpression = URL.createObjectURL(blob);

			if (expression !== finalExpression && expression.startsWith('blob:')) {
				URL.revokeObjectURL(expression);
			}

			return finalExpression;
		},

		async redraw() {
			if (this.uploadsFinished) return;
			const pose = this.previewPoses[this.previewPoseIdx];
			if (!pose) return;
			let charRenderer: Character;
			try {
				charRenderer = new Character(
					{
						...charDefDefaults,
						width: pose.width,
						height: pose.height,
						poseId: this.previewPoseIdx,
						x: pose.width / 2,
						posePositions: {
							headGroup: 0,
							head: this.uploadedExpressions.indexOf(
								this.currentUploadedExpression!
							),
						},
						label: null,
						textboxColor: null,
						enlargeWhenTalking: false,
						nameboxWidth: null,
						zoom: 1,
					},
					await this.temporaryCharacterModel
				);
			} catch (e) {
				return;
			}

			// noinspection ES6MissingAwait
			this.$nextTick(async () => {
				if (this.uploadsFinished) return;
				const renderer = new Renderer(pose.width, pose.height);
				await renderer.render(async (rx) => {
					await charRenderer.render(false, rx);
				});

				const target = this.$refs.target as HTMLCanvasElement;
				const ctx = target.getContext('2d')!;
				ctx.clearRect(0, 0, target.width, target.height);
				renderer.paintOnto(ctx, {
					x: 0,
					y: 0,
					w: target.width,
					h: target.height,
				});
			});
		},

		async finishUpload() {
			this.uploadsFinished = true;
			const processedExpressions = (
				await this.batchRunner.run(this.uploadedExpressions)
			).filter((exp) => exp) as string[];

			const storeCharacter = this.$store.state.content.current.characters.find(
				(char) => char.id === this.character
			)!;
			let character = uploadedExpressionsPack.characters.find(
				(char) => char.id === this.character
			);
			if (!character) {
				character = {
					id: this.character,
					heads: {},
					styleGroups: [],
					label: '',
					chibi: '',
					size: [960, 960],
					defaultScale: [0.8, 0.8],
					hd: false,
				} as CharacterModel<string>;
				uploadedExpressionsPack.characters.push(character);
			}

			let headGroup = character.heads[this.headGroup!.name];
			const storeHeadGroup = storeCharacter.heads[this.headGroup!.name];
			if (!headGroup) {
				headGroup = {
					previewSize: storeHeadGroup.previewSize as any,
					previewOffset: storeHeadGroup.previewOffset as any,
					variants: [],
				};
				character.heads[this.headGroup!.name] = headGroup;
			}

			for (const processedExpression of processedExpressions) {
				headGroup.variants.push([processedExpression]);
			}

			await this.vuexHistory.transaction(() => {
				this.$store.dispatch('content/replaceContentPack', {
					contentPack: uploadedExpressionsPack,
				} as ReplaceContentPackAction);
			});

			this.leave();
		},

		leave() {
			this.$emit('leave');
			this.method = null;
			this.headGroup = null;
			this.uploadedExpressions = [];
		},

		removeUploadedExpression() {
			if (!this.currentUploadedExpression) return;
			const expression = this.currentUploadedExpression;
			this.currentUploadedExpression = null;
			if (expression.startsWith('blob:')) {
				URL.revokeObjectURL(expression);
			}
			let idx = this.uploadedExpressions.indexOf(expression);
			this.uploadedExpressions.splice(idx, 1);
			if (idx > this.uploadedExpressions.length - 1) {
				idx = this.uploadedExpressions.length - 1;
			}
			this.currentUploadedExpression = this.uploadedExpressions[idx] || null;
		},

		normalizeName(name: string): string {
			const parts = name.split(':');
			let actualName = parts[parts.length - 1];
			const packId = parts.length > 1 ? parts[0].trim() : '';

			actualName = (
				actualName[0].toUpperCase() + actualName.slice(1).toLowerCase()
			)
				.split('_')
				.join(' ');
			if (packId.startsWith('dddg.') || packId === '') {
				return actualName;
			}
			return packId + ': ' + actualName;
		},

		dragEnter(e: DragEvent) {
			if (!this.headGroup || this.method !== 'upload') return;
			if (!e.dataTransfer) return;
			e.dataTransfer.effectAllowed = 'none';
			if (
				!Array.from(e.dataTransfer.items).find((item) =>
					item.type.match(/^image.*$/)
				)
			) {
				return;
			}
			e.dataTransfer.effectAllowed = 'link';
			(this.$refs.dt as any).show();
		},

		hideDt() {
			if (this.$refs.dt) (this.$refs.dt as any).hide();
		},
	},
	computed: {
		characterData(): DeepReadonly<CharacterModel<IAsset>> {
			return this.$store.state.content.current.characters.find(
				(char) => char.id === this.character
			)!;
		},

		availableHeadGroups(): IHeadGroup[] {
			const characterData = this.characterData;
			const headTypes = Object.keys(characterData.heads);
			return headTypes.map((headTypeKey) => {
				const headType = characterData.heads[headTypeKey];

				return {
					name: headTypeKey,
					preview: headType.variants[0].map((asset) => asset.lq),
					partsFiles: partFiles[headTypeKey] || [],
					imagePatching: {
						mask: masks[headTypeKey],
						addition: adds[headTypeKey],
					},
				} as IHeadGroup;
			});
		},

		hasParts(): boolean {
			return !!this.availableHeadGroups.find(
				(headGroup) => headGroup.partsFiles.length > 0
			);
		},

		downloadLink(): string | null {
			const character = this.characterData;
			if (!character || !this.headGroup) return null;
			const headType = character.heads[this.headGroup!.name];
			if (!headType) return null;
			return headType.variants[0][0].hq;
		},

		listLink(): string | null {
			if (!this.characterData || !this.headGroup) return null;
			const charName = this.characterData.id;
			const headGroupName = this.headGroup.name;
			if (listPaths[charName + ':' + headGroupName]) {
				return listPaths[charName + ':' + headGroupName] || null;
			}
			return listPaths[charName] || null;
		},

		previewPoses(): IPose[] {
			const character = this.characterData;
			if (!character || !this.headGroup) return [];
			const poses: IPose[] = [];

			for (
				let styleGroupIdx = 0;
				styleGroupIdx < character.styleGroups.length;
				++styleGroupIdx
			) {
				const styleGroup = character.styleGroups[styleGroupIdx];
				for (
					let styleIdx = 0;
					styleIdx < styleGroup.styles.length;
					++styleIdx
				) {
					const style = styleGroup.styles[styleIdx];
					for (let poseIdx = 0; poseIdx < style.poses.length; ++poseIdx) {
						const pose = style.poses[poseIdx];
						if (pose.compatibleHeads.includes(this.headGroup.name)) {
							poses.push({
								name: pose.id,
								styleGroupId: styleGroupIdx,
								styleId: styleIdx,
								poseId: poseIdx,
								width: pose.size[0],
								height: pose.size[1],
							});
						}
					}
				}
			}

			return poses;
		},

		expressionModels(): IAsset[][] {
			return this.uploadedExpressions.map((expression) => [
				{
					hq: expression,
					lq: expression,
					sourcePack: 'dddg.temp1:default',
				} as IAsset,
			]);
		},

		temporaryCharacterModel(): CharacterModel<IAsset> {
			const poses = this.previewPoses;
			const character = this.$store.state.content.current.characters.find(
				(char) => char.id === this.character
			)!;
			const offsetX = this.offsetX;
			const offsetY = this.offsetY;

			return {
				id: this.character,
				size: [960, 960],
				defaultScale: [0.8, 0.8],
				hd: false,
				heads: {
					'dddg.temp1:default': {
						variants: this.expressionModels,
						previewSize: [0, 0],
						previewOffset: [0, 0],
					},
				},
				styleGroups: [
					{
						id: 'preview',
						styleComponents: [],
						styles: [
							{
								components: {},
								poses: poses.map((pose, idx) => {
									const styleGroup = character.styleGroups[pose.styleGroupId];
									const style = styleGroup.styles[pose.styleId];
									const renderCommands =
										style.poses[pose.poseId].renderCommands.slice(0);
									let headIdx = renderCommands.findIndex(
										(command) => command.type === 'head'
									);
									const headRenderCommand = renderCommands[headIdx];
									const newHeadCommand: IHeadCommand = {
										type: 'head',
										offset: [
											headRenderCommand.offset[0] + offsetX,
											headRenderCommand.offset[1] + offsetY,
										],
									};

									if (
										this.addMask &&
										this.headGroup &&
										this.headGroup.imagePatching &&
										this.headGroup.imagePatching.mask
									) {
										const mask = this.headGroup.imagePatching.mask;
										renderCommands.splice(headIdx, 1);
										headIdx = 1;
										renderCommands.splice(0, 0, newHeadCommand, {
											type: 'image',
											images: [
												{
													hq: mask,
													lq: mask,
													sourcePack: 'dddg.temp1',
												},
											],
											composite: 'destination-in',
											offset: headRenderCommand.offset,
										});
									} else {
										renderCommands.splice(headIdx, 1, newHeadCommand);
									}

									if (
										this.addExtras &&
										this.headGroup &&
										this.headGroup.imagePatching &&
										this.headGroup.imagePatching.addition
									) {
										const add = this.headGroup.imagePatching.addition;
										renderCommands.splice(headIdx + 1, 0, {
											type: 'image',
											images: [
												{
													hq: add,
													lq: add,
													sourcePack: 'dddg.temp1',
												},
											],
											offset: headRenderCommand.offset,
										});
									}

									return {
										...style.poses[pose.poseId],
										renderCommands,
										id: 'dddg.temp1:pose' + idx,
										compatibleHeads: ['dddg.temp1:default'],
									} as Pose<IAsset>;
								}),
							},
						],
					},
				],
				label: '',
				chibi: null!,
			};
		},
	},
});

interface IPose {
	name: string;
	styleGroupId: number;
	styleId: number;
	poseId: number;
	width: number;
	height: number;
}

interface IHeadGroup {
	name: string;
	preview: string[];
	partsFiles: string[];
	imagePatching?: {
		mask?: string;
		addition?: string;
	};
}

interface ICachedProcessedExpression {
	url: string;
	addMask: boolean;
	addExtras: boolean;
	offsetX: number;
	offsetY: number;
}
</script>

<style lang="scss" scoped>
.expression_list_wrapper {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	flex-shrink: 1;
}

.options_wrapper {
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	flex-shrink: 1;
}

.expression_list {
	display: flex;
	flex-direction: row;
	overflow: auto;

	button {
		width: 100px;
		height: 128px;
	}

	* {
		flex-shrink: 0;
	}
}

.expression_item {
	height: 128px;
	width: 128px;
	background-position: center center;
	background-size: contain;
	background-repeat: no-repeat;
	box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
	box-sizing: border-box;

	&.active {
		box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.25);
	}
}

input[type='file'] {
	display: none;
}

.wrapper {
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
}

.page {
	flex-grow: 1;
	flex-shrink: 1;
	display: flex;
	flex-direction: column;

	.image {
		flex-grow: 1;
		flex-shrink: 1;
		position: relative;
		background-size: contain;
		background-position: center center;
		background-repeat: no-repeat;

		canvas {
			position: absolute;
			max-height: 100%;
			max-width: 100%;
		}
	}
}

@media only screen and (max-height: 560px) {
	.expression_list_wrapper {
		flex-direction: row;
		height: 1px;

		.expression_list {
			flex-direction: column;
			width: 128px;
			overflow: auto;

			button {
				height: 64px;
				width: 100%;
			}

			.expression_item {
				width: 100%;
			}
		}
	}
}
</style>
