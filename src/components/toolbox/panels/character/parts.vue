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
		<fieldset v-for="styleComponent of styleComponents" :key="styleComponent.name">
			<legend>{{ styleComponent.label }}</legend>
			<part-button
				v-for="(button, index) of styleComponent.buttons"
				:size="130"
				:key="index"
				:value="index"
				:part="button"
				@click="choose_component(styleComponent.name, index)"
			/>
		</fieldset>
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
import PartButton, { IPartButtonImage } from './partButton.vue';
import { Part } from '@/models/constants';
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
} from '@/store/objectTypes/characters';
import { IHistorySupport } from '@/plugins/vuex-history';
import { State } from 'vuex-class-decorator';

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
		| Part
		| 'pose'
		| 'style';

	private isWebPSupported: boolean | null = null;
	private styleData: {
		lastBase: string;
		components: {
			[s: string]: string;
		};
	} = {
		lastBase: '',
		components: {},
	};

	private get history(): IHistorySupport {
		return this.$root as any;
	}

	private get charData(): Character<IAsset> {
		return getData(this.$store, this.character);
	}

	@Watch('character')
	private updateStyleData(): void {
		const pose = getPose(this.charData, this.character);
		const baseStyle = this.charData.styles.find(
			style => style.name === pose.style
		);
		if (!baseStyle) return;
		this.styleData.lastBase = baseStyle.styleGroup;
		this.styleData.components = baseStyle.components;
	}

	private async created() {
		this.updateStyleData();
		this.isWebPSupported = await isWebPSupported();
	}

	private get styleComponents(): IPartStyleGroup[] {
		if (this.part !== 'style') return [];
		return this.charData.styleComponents.map(component => {
			const buttons: IPartStyleGroup['buttons'] = {};
			for (const key in component.variants) {
				if (!component.variants.hasOwnProperty(key)) continue;
				const variant = component.variants[key];
				buttons[key] = {
					size: [960, 960],
					offset: [0, 0],
					images: [variant],
				};
			}
			return { label: component.label, name: component.name, buttons };
		});
	}

	private get parts(): { [id: number]: IPartButtonImage } {
		const ret: { [id: string]: IPartButtonImage } = {};
		let collection: IAsset[][];
		let offset: IPartButtonImage['offset'];
		let size: IPartButtonImage['size'];
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
							images: headImages,
							size: heads.size,
							offset: heads.offset,
						};
					}
				}
				return ret;
			case 'variant':
				collection = currentPose.variant;
				size = currentPose.size;
				offset = currentPose.offset;
				break;
			case 'left':
				collection = currentPose.left;
				size = currentPose.size;
				offset = currentPose.offset;
				break;
			case 'right':
				collection = currentPose.right;
				size = currentPose.size;
				offset = currentPose.offset;
				break;
			case 'pose':
				const currentStyle = data.styles[this.character.styleId];
				for (let poseIdx = 0; poseIdx < data.poses.length; ++poseIdx) {
					const pose = data.poses[poseIdx];
					if (pose.style !== currentStyle.name) continue;
					ret[poseIdx] = this.generatePosePreview(pose);
				}
				return ret;
			case 'style':
				const styles = data.styles;
				const dedupedStyleGroups = styles
					.map(style => style.styleGroup)
					.filter((style, idx, all) => {
						if (all.indexOf(style) !== idx) return false;
						return true;
					});

				for (const styleGroup of dedupedStyleGroups) {
					const firstStyle = styles.find(
						style => style.styleGroup === styleGroup
					)!;
					const firstPose = data.poses.find(
						pose => pose.style === firstStyle.name
					)!;
					ret[styleGroup] = this.generatePosePreview(firstPose);
				}
				return ret;

			default:
				throw new Error('Unrecognised pose part: ' + this.part);
		}
		for (let partIdx = 0; partIdx < collection.length; ++partIdx) {
			const part = collection[partIdx];
			ret[partIdx] = {
				images: part,
				size,
				offset,
			};
		}
		return ret;
	}

	private generatePosePreview(pose: Pose<IAsset>): IPartButtonImage {
		const data = this.charData;
		const heads = data.heads[pose.compatibleHeads[0]];
		const head = heads ? heads.variants[0] : null;
		let images: IAsset[] = [];

		for (const order of pose.renderOrder) {
			switch (order.toUpperCase()) {
				case 'S':
					if (pose.static) images = images.concat(pose.static);
					break;
				case 'V':
					if (pose.variant.length > 0) images = images.concat(pose.variant[0]);
					break;
				case 'L':
					if (pose.left.length > 0) images = images.concat(pose.left[0]);
					break;
				case 'R':
					if (pose.right.length > 0) images = images.concat(pose.right[0]);
					break;
				case 'H':
					if (head) images = images.concat(head);
					break;
			}
		}

		return {
			images,
			size: pose.size,
			offset: pose.offset,
		};
	}

	private updatePose() {
		const data = this.charData;
		let selection = data.styles.filter(
			style => style.styleGroup === this.styleData.lastBase
		);
		for (const component of data.styleComponents) {
			const subSelect = selection.filter(styleComponent => {
				return (
					styleComponent.components[component.name] ===
					this.styleData.components[component.name]
				);
			});
			if (subSelect.length > 0) selection = subSelect;
		}
		this.setPart('style', data.styles.indexOf(selection[0]));
	}

	private choose(index: string) {
		if (this.part === 'style') {
			this.styleData.lastBase = index;
			this.updatePose();
		} else if (this.part === 'head') {
			const [headTypeIdx, headIdx] = index
				.split('_', 2)
				.map(part => parseInt(part, 10));
			this.setPart('headType', headTypeIdx);
			this.setPart('head', headIdx);
		} else {
			this.setPart(this.part, parseInt(index, 10));
		}
	}

	private choose_component(component: string, index: string) {
		this.styleData.components[component] = index;
		this.updatePose();
	}

	private setPart(part: ISetPartAction['part'], index: number): void {
		this.history.transaction(() => {
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
