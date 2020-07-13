<template>
	<div :class="{ partList: true, vertical }">
		<button @click="$emit('leave')">Back</button>

		<part-button
			v-for="(part, index) of parts"
			:key="index"
			:value="index"
			:part="part"
			@click="
				choose(index);
				$emit('leave');
			"
		/>
		<fieldset
			v-for="styleComponent of styleComponents"
			:key="styleComponent.name"
		>
			<legend>{{ styleComponent.label }}</legend>
			<part-button
				v-for="(button, id) of styleComponent.buttons"
				:size="130"
				:key="id"
				:value="id"
				:part="button"
				@click="choose_component(styleComponent.name, id)"
			/>
		</fieldset>
		<button
			@click="
				$emit('show-expression-dialog', { character: character.characterType })
			"
			v-if="part === 'head'"
		>
			<i class="material-icons">extension</i> Create new expressions
		</button>
		<button
			@click="
				$emit('show-dialog', 'type: Expressions character: ' + charData.label)
			"
			v-if="part === 'head'"
		>
			<i class="material-icons">extension</i> Search in content packs
		</button>
		<button
			@click="$emit('show-dialog', 'type: Styles character: ' + charData.label)"
			v-else-if="part === 'style'"
		>
			<i class="material-icons">extension</i> Search in content packs
		</button>
		<button
			@click="$emit('show-dialog', 'type: Poses character: ' + charData.label)"
			v-else
		>
			<i class="material-icons">extension</i> Search in content packs
		</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import {
	isWebPSupported,
	registerAsset,
	registerAssetWithURL,
} from '@/asset-manager';
import environment from '@/environments/environment';
import PartButton, { IPartButtonImage, IPartImage } from './partButton.vue';
import {
	StyleComponent,
	Pose,
	Character,
} from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IAsset } from '@/store/content';
import {
	getPose,
	getDataG,
	ISeekPoseAction,
	ISetPosePositionMutation,
	ISetPartAction,
	getData,
	ICharacter,
	ISetStyleAction,
} from '@/store/objectTypes/characters';
import { IHistorySupport } from '@/plugins/vuex-history';
import { State } from 'vuex-class-decorator';
import { DeepReadonly } from '../../../../util/readonly';

interface IPartStyleGroup {
	label: string;
	name: string;
	buttons: { [id: string]: IPartButtonImage };
}

@Component({
	components: {
		PartButton,
	},
})
export default class PartsPanel extends Vue {
	@State('vertical', { namespace: 'ui' }) private readonly vertical!: boolean;

	@Prop({ required: true }) private character!: ICharacter;
	@Prop({ required: true, type: String }) private readonly part!:
		| string
		| 'pose'
		| 'style';

	private isWebPSupported: boolean | null = null;

	private vuexHistory!: IHistorySupport;
	/**
	 * [styleComponentKey, styleComponentValue]
	 */
	private stylePriorities: Array<[string, string]> = [];

	private get charData(): DeepReadonly<Character<IAsset>> {
		return getData(this.$store, this.character);
	}

	@Watch('character')
	private updateStyleData(): void {
		const baseStyle = this.charData.styleGroups[this.character.styleGroupId]
			.styles[this.character.styleId];
		this.stylePriorities = Object.keys(baseStyle.components).map(key => [
			key,
			baseStyle.components[key],
		]);
	}

	private async created() {
		this.updateStyleData();
		this.isWebPSupported = await isWebPSupported();
	}

	private get styleComponents(): DeepReadonly<IPartStyleGroup[]> {
		if (this.part !== 'style') return [];
		const styleComponents = this.charData.styleGroups[
			this.character.styleGroupId
		];
		return styleComponents.styleComponents.map(component => {
			const buttons: IPartStyleGroup['buttons'] = {};
			for (const key in component.variants) {
				if (!component.variants.hasOwnProperty(key)) continue;
				const variant = component.variants[key];
				buttons[key] = {
					size: styleComponents.styles[0].poses[0].size,
					offset: [0, 0],
					images: [{ offset: [0, 0], asset: variant }],
				};
			}
			return { label: component.label, name: component.id, buttons };
		});
	}

	private get parts(): { [id: number]: DeepReadonly<IPartButtonImage> } {
		const ret: { [id: string]: DeepReadonly<IPartButtonImage> } = {};
		let collection: DeepReadonly<IAsset[][]>;
		let offset: DeepReadonly<IPartButtonImage['offset']>;
		let size: DeepReadonly<IPartButtonImage['size']>;
		const data = this.charData;
		const currentPose = getPose(data, this.character);
		switch (this.part) {
			case 'head':
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
						};
					}
				}
				return ret;
			case 'pose':
				const currentStyle =
					data.styleGroups[this.character.styleGroupId].styles[
						this.character.styleId
					];
				for (let poseIdx = 0; poseIdx < currentStyle.poses.length; ++poseIdx) {
					const pose = currentStyle.poses[poseIdx];
					ret[poseIdx] = this.generatePosePreview(pose);
				}
				return ret;
			case 'style':
				for (const styleGroup of data.styleGroups) {
					ret[styleGroup.id] = this.generatePosePreview(
						styleGroup.styles[0].poses[0]
					);
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
				images: part.map((partImage: IAsset) => ({
					offset: [0, 0],
					asset: partImage,
				})),
				size,
				offset,
			};
		}
		return ret;
	}

	private generatePosePreview(
		pose: DeepReadonly<Pose<IAsset>>
	): DeepReadonly<IPartButtonImage> {
		const data = this.charData;
		const heads = data.heads[pose.compatibleHeads[0]];
		const head = heads ? heads.variants[0] : null;
		let images: IAsset[] = [];

		for (const command of pose.renderCommands) {
			switch (command.type) {
				case 'pose-part':
					const part = pose.positions[command.part];
					if (!part || part.length === 0) break;
					images = images.concat(part[0] as IAsset[]);
					break;
				case 'head':
					if (head) images = images.concat(head);
					break;
				case 'image':
					images = images.concat(command.images);
					break;
			}
		}

		return {
			images: images.map(image => ({ asset: image, offset: [0, 0] })),
			size: pose.previewSize,
			offset: pose.previewOffset,
		};
	}

	private updatePose(styleGroupId?: number) {
		if (styleGroupId === undefined) styleGroupId = this.character.styleGroupId;

		const data = this.charData;
		const styleGroups = data.styleGroups[styleGroupId];
		let selection = styleGroups.styles;
		for (const priority of this.stylePriorities) {
			const subSelect = selection.filter(style => {
				return style.components[priority[0]] === priority[1];
			});
			if (subSelect.length > 0) selection = subSelect;
		}
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setCharStyle', {
				id: this.character.id,
				styleGroupId,
				styleId: styleGroups.styles.indexOf(selection[0]),
			} as ISetStyleAction);
		});
	}

	private choose(index: string) {
		if (this.part === 'style') {
			this.updatePose(
				this.charData.styleGroups.findIndex(group => group.id === index)
			);
		} else if (this.part === 'head') {
			const [headTypeIdx, headIdx] = index
				.split('_', 2)
				.map(part => parseInt(part, 10));
			this.$store.commit('objects/setPosePosition', {
				id: this.character.id,
				posePositions: {
					headType: headTypeIdx,
					head: headIdx,
				},
			} as ISetPosePositionMutation);
		} else {
			this.setPart(this.part, parseInt(index, 10));
		}
	}

	private choose_component(component: string, id: string) {
		const prioIdx = this.stylePriorities.findIndex(
			stylePriority => stylePriority[0] === component
		);
		this.stylePriorities.splice(prioIdx, 1);
		this.stylePriorities.unshift([component, id]);
		this.updatePose();
	}

	private setPart(part: ISetPartAction['part'], index: number): void {
		this.vuexHistory.transaction(() => {
			this.$store.dispatch('objects/setPart', {
				id: this.character.id,
				part,
				val: index,
			} as ISetPartAction);
		});
	}
}
</script>

<style lang="scss" scoped>
.partList {
	&:not(.vertical) {
		white-space: nowrap;
		button {
			height: 100%;
		}
	}
	&.vertical {
		button {
			width: 100%;
		}
	}
}

button {
	vertical-align: middle;
}

fieldset {
	flex-wrap: nowrap;
	border: 3px solid #ffbde1;
	margin-bottom: 0;
	display: inline-block;
	vertical-align: middle;
}
</style>
