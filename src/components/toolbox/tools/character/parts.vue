<template>
	<d-flow no-wraping>
		<button @click="$emit('leave')">Back</button>
		<button
			@click="
				$emit('show-expression-dialog', { character: character.characterType })
			"
			v-if="part === 'head'"
			class="icon-button"
		>
			<i class="material-icons">extension</i>
			<span class="text-block">Create new expressions</span>
		</button>
		<button
			@click="
				$emit('show-dialog', 'type: Expressions character: ' + charData.label)
			"
			v-if="part === 'head'"
			class="icon-button"
		>
			<i class="material-icons">extension</i>
			<span class="text-block">Search in content packs</span>
		</button>
		<button
			@click="$emit('show-dialog', 'type: Styles character: ' + charData.label)"
			v-else-if="part === 'style'"
			class="icon-button"
		>
			<i class="material-icons">extension</i>
			<span>Search in content packs</span>
		</button>
		<button
			@click="$emit('show-dialog', 'type: Poses character: ' + charData.label)"
			v-else
			class="icon-button"
		>
			<i class="material-icons">extension</i>
			<span>Search in content packs</span>
		</button>
		<part-button
			v-for="(part, index) of parts"
			:key="index"
			:value="index"
			:part="part"
			@click="
				choose(index);
				$emit('leave');
			"
			@quick-click="choose(index)"
		/>
		<d-fieldset
			v-for="styleComponent of styleComponents"
			:key="styleComponent.name"
			:title="styleComponent.label"
		>
			<d-flow noWraping>
				<part-button
					v-for="(button, id) of styleComponent.buttons"
					:size="130"
					:key="id"
					:value="id"
					:part="button"
					@click="choose_component(styleComponent.name, id)"
				/>
			</d-flow>
		</d-fieldset>
	</d-flow>
</template>

<script lang="ts">
import { isWebPSupported } from '@/asset-manager';
import PartButton, { IPartButtonImage, IPartImage } from './partButton.vue';
import DFlow from '@/components/ui/d-flow.vue';
import DFieldset from '@/components/ui/d-fieldset.vue';
import {
	Character,
	Pose,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAssetSwitch } from '@/store/content';
import {
	getData,
	getPose,
	ICharacter,
	ISetPartAction,
	ISetPosePositionMutation,
	ISetStyleAction,
} from '@/store/objectTypes/characters';
import { DeepReadonly } from 'ts-essentials';
import { defineComponent, PropType } from 'vue';

interface IPartStyleGroup {
	label: string;
	name: string;
	buttons: { [id: string]: IPartButtonImage };
}

export default defineComponent({
	components: { PartButton, DFieldset, DFlow },
	props: {
		character: {
			type: Object as PropType<DeepReadonly<ICharacter>>,
			required: true,
		},
		part: {
			required: true,
			type: String as PropType<string | 'pose' | 'style'>,
		},
	},
	data: () => ({
		isWebPSupported: null as boolean | null,
		/**
		 * [styleComponentKey, styleComponentValue]
		 */
		stylePriorities: [] as Array<[string, string]>,
	}),
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
		styleComponents(): DeepReadonly<IPartStyleGroup[]> {
			if (this.part !== 'style') return [];
			const styleComponents =
				this.charData.styleGroups[this.character.styleGroupId];
			return styleComponents.styleComponents.map((component) => {
				const buttons: IPartStyleGroup['buttons'] = {};
				for (const key in component.variants) {
					// eslint-disable-next-line no-prototype-builtins
					if (!component.variants.hasOwnProperty(key)) continue;
					const variant = component.variants[key];
					buttons[key] = {
						size: styleComponents.styles[0].poses[0].size,
						offset: [0, 0],
						images: [{ offset: [0, 0], asset: variant }],
						active: false,
					};
				}
				return { label: component.label, name: component.id, buttons };
			});
		},
		parts(): { [id: string]: DeepReadonly<IPartButtonImage> } {
			const ret: { [id: string]: DeepReadonly<IPartButtonImage> } = {};
			let collection: DeepReadonly<IAssetSwitch[][]>;
			let offset: DeepReadonly<IPartButtonImage['offset']>;
			let size: DeepReadonly<IPartButtonImage['size']>;
			const data = this.charData;
			const currentPose = getPose(data, this.character);
			switch (this.part) {
				case 'head':
					const activeHeadTypeIdx = this.character.posePositions.headType || 0;
					const activeHeadIdx = this.character.posePositions.head || 0;
					for (
						let headKeyIdx = 0;
						headKeyIdx < currentPose.compatibleHeads.length;
						++headKeyIdx
					) {
						const headKey = currentPose.compatibleHeads[headKeyIdx];
						const heads = data.heads[headKey];
						for (let headIdx = 0; headIdx < heads.variants.length; ++headIdx) {
							const headImages = heads.variants[headIdx];
							ret[`${headKeyIdx}_${headIdx}`] = {
								size: heads.previewSize,
								offset: heads.previewOffset,
								images: headImages.map(
									(image): IPartImage => ({ asset: image, offset: [0, 0] })
								),
								active:
									activeHeadIdx === headIdx && activeHeadTypeIdx === headKeyIdx,
							};
						}
					}
					return ret;
				case 'pose':
					// eslint-disable-next-line no-case-declarations
					const currentStyle =
						data.styleGroups[this.character.styleGroupId].styles[
							this.character.styleId
						];
					for (
						let poseIdx = 0;
						poseIdx < currentStyle.poses.length;
						++poseIdx
					) {
						const pose = currentStyle.poses[poseIdx];
						ret[poseIdx] = this.generatePosePreview(pose);
						(ret[poseIdx] as any).active = poseIdx === this.character.poseId;
					}
					return ret;
				case 'style':
					for (
						let styleIdx = 0;
						styleIdx < data.styleGroups.length;
						++styleIdx
					) {
						const styleGroup = data.styleGroups[styleIdx];
						ret[styleGroup.id] = this.generatePosePreview(
							styleGroup.styles[0].poses[0]
						);
						(ret[styleGroup.id] as any).active =
							styleIdx === this.character.styleGroupId;
					}
					return ret;

				default:
					collection = currentPose.positions[this.part];
					size = currentPose.previewSize;
					offset = currentPose.previewOffset;
					break;
			}
			for (let partIdx = 0; partIdx < collection.length; ++partIdx) {
				const part = collection[partIdx];
				ret[partIdx] = {
					images: part.map((partImage: IAssetSwitch) => ({
						offset: [0, 0],
						asset: partImage,
					})),
					size,
					offset,
					active: partIdx === (this.character.posePositions[this.part] || 0),
				};
			}
			return ret;
		},
		charData(): DeepReadonly<Character<IAssetSwitch>> {
			return getData(this.$store, this.character);
		},
	},
	methods: {
		updateStyleData(): void {
			const baseStyle =
				this.charData.styleGroups[this.character.styleGroupId].styles[
					this.character.styleId
				];
			this.stylePriorities = Object.keys(baseStyle.components).map((key) => [
				key,
				baseStyle.components[key],
			]);
		},
		generatePosePreview(
			pose: DeepReadonly<Pose<IAssetSwitch>>
		): DeepReadonly<IPartButtonImage> {
			const data = this.charData;
			const heads = data.heads[pose.compatibleHeads[0]];
			const head = heads ? heads.variants[0] : null;
			let images: Array<IPartImage> = [];

			for (const command of pose.renderCommands) {
				switch (command.type) {
					case 'pose-part':
						// eslint-disable-next-line no-case-declarations
						const part = pose.positions[command.part];
						if (!part || part.length === 0) break;
						images = images.concat(
							part[0].map((x) => ({ asset: x, offset: command.offset }))
						);
						break;
					case 'head':
						if (head) {
							images = images.concat(
								head.map((x) => ({
									asset: x,
									offset: command.offset,
								}))
							);
						}
						break;
					case 'image':
						images = images.concat(
							command.images.map((x) => ({ asset: x, offset: command.offset }))
						);
						break;
				}
			}

			return {
				images,
				size: pose.previewSize,
				offset: pose.previewOffset,
				active: false,
			};
		},
		updatePose(styleGroupId?: number) {
			if (styleGroupId == undefined) styleGroupId = this.character.styleGroupId;

			const data = this.charData;
			const styleGroups = data.styleGroups[styleGroupId];
			let selection = styleGroups.styles;
			for (const priority of this.stylePriorities) {
				const subSelect = selection.filter((style) => {
					return style.components[priority[0]] === priority[1];
				});
				if (subSelect.length > 0) selection = subSelect;
			}
			this.vuexHistory.transaction(async () => {
				await this.$store.dispatch('panels/setCharStyle', {
					id: this.character.id,
					panelId: this.character.panelId,
					styleGroupId,
					styleId: styleGroups.styles.indexOf(selection[0]),
				} as ISetStyleAction);
			});
		},
		choose(index: string) {
			if (this.part === 'style') {
				this.updatePose(
					this.charData.styleGroups.findIndex((group) => group.id === index)
				);
			} else if (this.part === 'head') {
				const [headTypeIdx, headIdx] = index
					.split('_', 2)
					.map((part) => parseInt(part, 10));
				this.$store.commit('panels/setPosePosition', {
					id: this.character.id,
					panelId: this.character.panelId,
					posePositions: {
						headType: headTypeIdx,
						head: headIdx,
					},
				} as ISetPosePositionMutation);
			} else {
				this.setPart(this.part, parseInt(index, 10));
			}
		},
		// eslint-disable-next-line @typescript-eslint/camelcase
		choose_component(component: string, id: string) {
			const prioIdx = this.stylePriorities.findIndex(
				(stylePriority) => stylePriority[0] === component
			);
			this.stylePriorities.splice(prioIdx, 1);
			this.stylePriorities.unshift([component, id]);
			this.updatePose();
		},
		setPart(part: ISetPartAction['part'], index: number): void {
			this.vuexHistory.transaction(() => {
				this.$store.dispatch('panels/setPart', {
					id: this.character.id,
					panelId: this.character.panelId,
					part,
					val: index,
				} as ISetPartAction);
			});
		},
	},
	async created() {
		this.updateStyleData();
		this.isWebPSupported = await isWebPSupported();
	},
	watch: {
		character() {
			this.updateStyleData();
		},
	},
});
</script>

<style lang="scss" scoped>
.icon-button {
	vertical-align: middle;
	width: 100px;
}
</style>
