<template>
	<div class="wrapper" @dragenter="dragEnter" @mouseleave="dt?.hide()">
		<h1>Add expressions</h1>
		<expression-select
			v-if="!headGroup"
			label="What kind of expression would you like to add?"
		>
			<expression-option
				v-for="headgroup of availableHeadGroups"
				:key="headgroup.name"
				:label="normalizeName(headgroup.name)"
				:images="headgroup.preview"
				@selected="headGroup = headgroup"
			/>
		</expression-select>
		<template v-else>
			<div v-if="!uploadsFinished" class="page">
				<h2>
					Upload new '{{ normalizeName(headGroup.name) }}' expressions
					<external-link v-if="downloadLink" :to="downloadLink"
						>(Template)</external-link
					>
					<external-link v-if="listLink" :to="listLink"
						>(List)</external-link
					>
				</h2>
				<drop-target ref="dt" class="drop-target" @drop="addByImageFile"
					>Drop here to add as a new expression
				</drop-target>
				<div class="expression_list_wrapper">
					<div
						class="expression_list"
						@wheel.passive="verticalScrollRedirect"
					>
						<button @click="upload.click()">
							Upload expression
							<input
								type="file"
								ref="upload"
								multiple
								@change="addByUpload"
							/>
						</button>
						<button @click="addByUrl">
							Add expression from URL
						</button>
						<div
							v-for="(expression, idx) of uploadedExpressions"
							:key="idx"
							:style="{ backgroundImage: `url('${expression}')` }"
							:class="{
								expression_item: true,
								active:
									currentUploadedExpression === expression,
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
									<tbody>
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
									</tbody>
								</table>
								<p v-if="offsetX !== 0 || offsetY !== 0">
									WARNING: Offsets will be lost when
									saving/loading.
								</p>
							</d-fieldset>
							<toggle-box
								label="Reduce to fit DDDG standard"
								v-if="
									headGroup.imagePatching &&
									headGroup.imagePatching.mask
								"
								v-model="addMask"
							/>
							<toggle-box
								label="Add new parts to fit DDDG standard"
								v-if="
									headGroup.imagePatching &&
									headGroup.imagePatching.addition
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
					Finishing up images.
					{{ Math.round(batchRunner.percentage * 100) }}%
				</h2>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { getAAssetUrl, getAssetByUrl } from '@/asset-manager';
import { verticalScrollRedirect } from '@/components/mixins/vertical-scroll-redirect';
import DFieldset from '@/components/ui/d-fieldset.vue';
import ToggleBox from '@/components/ui/d-toggle.vue';
import ExternalLink from '@/components/ui/external-link.vue';
import { SelectedState } from '@/constants/shared';
import environment from '@/environments/environment';
import { transaction } from '@/history-engine/transaction';
import { AssetListRenderable } from '@/renderables/asset-list-renderable';
import { Character } from '@/renderables/character';
import { Renderer } from '@/renderer/renderer';
import type { IAssetSwitch } from '@/store/content';
import CharacterStore from '@/store/object-types/character';
import { Panel } from '@/store/panels';
import { state } from '@/store/root';
import { WorkBatch } from '@/util/workBatch';
import type {
	Character as CharacterModel,
	ContentPack,
	IHeadCommand,
	Pose,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { type DeepReadonly, computed, nextTick, ref, watch } from 'vue';
import DropTarget from '../../toolbox/drop-target.vue';
import ExpressionOption from './expression-option.vue';
import ExpressionSelect from './expression-select.vue';

const props = defineProps<{
	character: string;
	initHeadGroup?: string;
}>();
const emit = defineEmits<{
	leave: [];
}>();

const uploadedExpressionsPackDefaults: ContentPack<IAssetSwitch> = {
	packId: 'dddg.uploads.expressions',
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

const partFiles: { [s: string]: string[] | undefined } = {};

const target = ref(null! as HTMLCanvasElement);
const headGroup = ref(null as null | IHeadGroup);
const uploadedExpressions = ref([] as string[]);
const currentUploadedExpression = ref(null as string | null);
const previewPoseIdx = ref(0);
const offsetX = ref(0);
const offsetY = ref(0);
const addMask = ref(false);
const addExtras = ref(false);
const names = ref({} as { [url: string]: string });

const characterData = computed(() => {
	return state.content.current.characters.find(
		(char) => char.id === props.character
	)!;
});

const availableHeadGroups = computed(() => {
	const headTypes = Object.keys(characterData.value.heads);
	return headTypes.map((headTypeKey) => {
		const headType = characterData.value.heads[headTypeKey];

		return {
			name: headTypeKey,
			preview: headType.variants[0].map((asset) =>
				getAAssetUrl(asset, false)
			),
			partsFiles: partFiles[headTypeKey] || [],
			imagePatching: {
				mask: masks[headTypeKey],
				addition: adds[headTypeKey],
			},
		} as IHeadGroup;
	});
});

function applySingleHeadGroup() {
	if (availableHeadGroups.value.length === 1) {
		headGroup.value = availableHeadGroups.value[0];
	}
}

function leave() {
	emit('leave');
	headGroup.value = null;
	uploadedExpressions.value = [];
}

function removeUploadedExpression() {
	if (currentUploadedExpression.value == null) return;
	const expression = currentUploadedExpression.value;
	currentUploadedExpression.value = null;
	if (expression.startsWith('blob:')) {
		URL.revokeObjectURL(expression);
	}
	let idx = uploadedExpressions.value.indexOf(expression);
	uploadedExpressions.value.splice(idx, 1);
	if (idx > uploadedExpressions.value.length - 1) {
		idx = uploadedExpressions.value.length - 1;
	}
	currentUploadedExpression.value = uploadedExpressions.value[idx] || null;
}

function normalizeName(name: string): string {
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
}

const downloadLink = computed((): string | null => {
	const character = characterData.value;
	if (!headGroup.value) return null;
	const headType = character.heads[headGroup.value!.name];
	return headType.variants[0][0].hq;
});

const listLink = computed((): string | null => {
	if (!headGroup.value) return null;
	const charName = characterData.value.id;
	const headGroupName = headGroup.value.name;
	return (
		listPaths[charName + ':' + headGroupName] ?? listPaths[charName] ?? null
	);
});

//#region Drag and Drop
const dt = ref(null! as typeof DropTarget);
function dragEnter(e: DragEvent) {
	if (!headGroup.value) return;
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
	dt.value.show();
}
//#endregion Drag and Drop
//#region Preview
async function redraw() {
	const previewChar = previewCharacter;
	let charRenderer: Character;
	const pose = previewPoses.value[previewPoseIdx.value];
	try {
		charRenderer = new Character(previewChar);
	} catch {
		return;
	}

	// noinspection ES6MissingAwait
	nextTick(async () => {
		if (uploadsFinished.value) return;
		const renderer = new Renderer(pose.width, pose.height);
		try {
			await renderer.render(async (rx) => {
				AssetListRenderable.prototype.prepareData.call(
					charRenderer,
					panel
				);
				// Skip reloading the character data.
				await charRenderer.prepareRender(!rx.hq);

				await charRenderer.render(
					rx.fsCtx,
					SelectedState.None,
					rx.preview,
					rx.hq,
					false
				);
			});

			const ctx = target.value.getContext('2d')!;
			ctx.clearRect(0, 0, target.value.width, target.value.height);
			renderer.paintOnto(ctx, {
				x: 0,
				y: 0,
				w: target.value.width,
				h: target.value.height,
			});
		} finally {
			charRenderer.dispose();
			renderer.dispose();
		}
	});
}

const previewPoses = computed((): IPose[] => {
	const character = characterData.value;
	if (!headGroup.value) return [];
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
				if (pose.compatibleHeads.includes(headGroup.value.name)) {
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
});

const expressionModels = computed((): IAssetSwitch[][] => {
	return uploadedExpressions.value.map((expression) => [
		{
			hq: expression,
			lq: expression,
			sourcePack: 'dddg.temp1:default',
		} as IAssetSwitch,
	]);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const temporaryCharacterModel = computed((): CharacterModel<IAssetSwitch> => {
	const poses = previewPoses.value;
	const character: DeepReadonly<CharacterModel<IAssetSwitch>> =
		state.content.current.characters.find(
			(char) => char.id === props.character
		)!;

	return {
		id: character.id,
		size: [960, 960],
		defaultScale: [0.8, 0.8],
		hd: false,
		heads: {
			'dddg.temp1:default': {
				variants: expressionModels.value,
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
							const styleGroup =
								character.styleGroups[pose.styleGroupId];
							const style = styleGroup.styles[pose.styleId];
							const renderCommands =
								style.poses[pose.poseId].renderCommands.slice(
									0
								);
							let headIdx = renderCommands.findIndex(
								(command) => command.type === 'head'
							);
							const headRenderCommand = renderCommands[headIdx];
							const newHeadCommand: IHeadCommand = {
								type: 'head',
								offset: [
									headRenderCommand.offset[0] + offsetX.value,
									headRenderCommand.offset[1] + offsetY.value,
								],
							};

							if (
								addMask.value &&
								headGroup.value &&
								headGroup.value.imagePatching &&
								headGroup.value.imagePatching.mask != null
							) {
								const mask = headGroup.value.imagePatching.mask;
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
								renderCommands.splice(
									headIdx,
									1,
									newHeadCommand
								);
							}

							if (
								addExtras.value &&
								headGroup.value &&
								headGroup.value.imagePatching &&
								headGroup.value.imagePatching.addition != null
							) {
								const add =
									headGroup.value.imagePatching.addition;
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
							} as Pose<IAssetSwitch>;
						}),
					},
				],
			},
		],
		label: '',
		chibi: null!,
	};
});
//#endregion Preview
//#region Content Pack Export
const uploadsFinished = ref(false);

const batchRunner = ref(null! as WorkBatch<string, string>);
batchRunner.value = new WorkBatch<string, string>(
	processExpression,
	async () => {}
);
async function processExpression(
	expression: string,
	isRunning: () => boolean
): Promise<string | undefined> {
	const asset = await getAssetByUrl(expression);
	if (!isRunning()) return undefined;
	const renderer = new Renderer(
		asset.width + offsetX.value,
		asset.height + offsetY.value
	);
	const blob = await renderer.renderToBlob(async (rx) => {
		rx.drawImage({
			image: asset,
			x: offsetX.value,
			y: offsetY.value,
			w: asset.width,
			h: asset.height,
		});

		if (
			addMask.value &&
			headGroup.value &&
			headGroup.value.imagePatching &&
			headGroup.value.imagePatching.mask != null
		) {
			const mask = await getAssetByUrl(
				headGroup.value.imagePatching.mask
			);
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
			addExtras.value &&
			headGroup.value &&
			headGroup.value.imagePatching &&
			headGroup.value.imagePatching.addition != null
		) {
			const addition = await getAssetByUrl(
				headGroup.value.imagePatching.addition
			);
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
	names.value[finalExpression] = names.value[expression];

	if (expression !== finalExpression && expression.startsWith('blob:')) {
		URL.revokeObjectURL(expression);
	}

	return finalExpression;
}

async function finishUpload() {
	uploadsFinished.value = true;
	const processedExpressions = (
		await batchRunner.value.run(uploadedExpressions.value)
	).filter((exp) => exp) as string[];

	const storeCharacter = state.content.current.characters.find(
		(char) => char.id === props.character
	)!;

	const old =
		state.content.contentPacks.find(
			(x) => x.packId === uploadedExpressionsPackDefaults.packId
		) || uploadedExpressionsPackDefaults;
	const newPackVersion: ContentPack<IAssetSwitch> = JSON.parse(
		JSON.stringify(old)
	);

	let character = newPackVersion.characters.find(
		(char) => char.id === props.character
	);
	if (!character) {
		character = {
			id: props.character,
			heads: {},
			styleGroups: [],
			label: '',
			chibi: null!,
			size: [960, 960],
			defaultScale: [0.8, 0.8],
			hd: false,
		} as CharacterModel<IAssetSwitch>;
		newPackVersion.characters.push(character);
	}

	let headGroup_ = character.heads[headGroup.value!.name];
	const storeHeadGroup = storeCharacter.heads[headGroup.value!.name];
	if (headGroup_ == null) {
		headGroup_ = {
			previewSize:
				storeHeadGroup.previewSize as (typeof headGroup_)['previewSize'],
			previewOffset:
				storeHeadGroup.previewOffset as (typeof headGroup_)['previewOffset'],
			variants: [],
		};
		character.heads[headGroup.value!.name] = headGroup_;
	}

	for (const processedExpression of processedExpressions) {
		const assetUrl = await state.uploadUrls.add(
			'expression_' + (names.value[processedExpression] || ''),
			processedExpression
		);
		headGroup_.variants.push([
			{
				hq: assetUrl,
				lq: assetUrl,
				sourcePack: uploadedExpressionsPackDefaults.packId!,
			},
		]);
	}

	await transaction(async () => {
		state.content.replaceContentPack({
			contentPack: newPackVersion,
			processed: true,
		});
	});

	leave();
}
//#endregion Content Pack Export
//#region Upload
const upload = ref(null! as HTMLInputElement);
function addByUpload(): void {
	const uploadInput = upload.value;
	if (!uploadInput.files) return;
	for (const file of uploadInput.files) {
		addByImageFile(file);
	}
}

function addByImageFile(file: File) {
	const url = URL.createObjectURL(file);
	addUrl(file.name, url);
}

async function addByUrl(): Promise<void> {
	const url = await environment.prompt('Enter the url of the image.', '');
	if (url == null) return;
	const lastSegment = url.split('/').slice(-1)[0];
	addUrl(lastSegment, url);
}

function addUrl(name: string, url: string): void {
	currentUploadedExpression.value = url;
	names.value[url] = name;
	uploadedExpressions.value.push(url);
}
//#endregion Upload
//#region Constants
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

const panel = new Panel(0);

const previewCharacter: CharacterStore = CharacterStore.create(
	panel,
	props.character
);

watch(
	() => previewPoses.value[previewPoseIdx.value],
	(pose) => {
		if (pose == null) return;
		previewCharacter.width = pose.width;
		previewCharacter.height = pose.height;
		previewCharacter.setPart('pose', previewPoseIdx.value);
		previewCharacter.x = pose.width / 2;
		previewCharacter.y = pose.height / 2;
		previewCharacter.setPosePosition({
			headGroup: 0,
			head: uploadedExpressions.value.indexOf(
				currentUploadedExpression.value!
			),
		});
	},
	{ immediate: true }
);
//#endregion Constants
//#region init
if (props.initHeadGroup != null) {
	headGroup.value = availableHeadGroups.value.find(
		(group) => group.name === props.initHeadGroup
	)!;
}
applySingleHeadGroup();
//#endregion

watch(() => availableHeadGroups.value, applySingleHeadGroup);
watch(
	() => [
		availableHeadGroups.value,
		previewPoseIdx.value,
		previewPoses.value,
		currentUploadedExpression.value,
		offsetX.value,
		offsetY.value,
		addMask.value,
		addExtras.value,
	],
	redraw
);

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
