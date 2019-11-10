<template>
	<div :class="{ partList: true, vertical }">
		<button @click="$emit('leave')">Back</button>

		<part-button
			v-for="(part, index) of parts"
			:key="index"
			:value="index"
			:part="part"
			@click="choose(index);$emit('leave')"
		/>
		<fieldset v-if="eyes">
			<legend>Eyes</legend>
			<part-button
				v-for="(part, index) of eyes"
				:size="130"
				:key="index"
				:value="index"
				:part="part"
				@click="choose_eyes(index)"
			/>
		</fieldset>

		<fieldset v-if="hairs">
			<legend>Hairstyles</legend>
			<part-button
				v-for="(part, index) of hairs"
				:size="130"
				:key="index"
				:value="index"
				:part="part"
				@click="choose_hairs(index)"
			/>
		</fieldset>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
	isWebPSupported,
	ICharacter,
	characterOrder,
	registerAsset,
	registerAssetWithURL,
	INsfwAbleImg,
	Pose,
} from '@/asset-manager';
import environment from '@/environments/environment';
import { Part, Character } from '@/models/character';
import PartButton, { IPartButtonImage } from './partButton.vue';
import { poses } from '../../../models/constants';
import { baseUrl } from '../../../asset-manager';

interface IStyle {
	fullName: string;
	reducedName: string;
	index: number;
	label: string;
	eyes: string | null;
	hairs: string | null;
}

@Component({
	components: {
		PartButton,
	},
})
export default class PartsPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Character, required: true }) private character!: Character;
	@Prop({ required: true, type: String }) private readonly part!:
		| Part
		| 'pose'
		| 'style';
	@Prop({ required: true, type: Boolean }) private readonly nsfw!: boolean;

	private isWebPSupported: boolean | null = null;
	private customAssetCount = 0;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
		if (this.character.styleData.lastBase === '') {
			const baseStyle = this.styleData[0];
			this.character.styleData.lastBase = baseStyle.reducedName;
			this.character.styleData.eyes = baseStyle.eyes || '';
			this.character.styleData.hairs = baseStyle.hairs || '';
		}
	}

	private get eyes(): { [id: string]: IPartButtonImage } | null {
		if (this.part !== 'style') return null;
		const keys = Object.keys(this.character.data.eyes);
		if (keys.length < 2) return null;
		const ret: { [id: string]: IPartButtonImage } = {};
		for (const key of keys) {
			ret[key] = {
				image1: this.character.data.eyes[key],
				size: [960, 960],
				offset: [0, 0],
			};
		}
		return ret;
	}

	private get hairs(): { [id: string]: IPartButtonImage } | null {
		if (this.part !== 'style') return null;
		const keys = Object.keys(this.character.data.hairs);
		if (keys.length < 2) return null;
		const ret: { [id: string]: IPartButtonImage } = {};
		for (const key of keys) {
			ret[key] = {
				image1: this.character.data.hairs[key],
				size: [960, 960],
				offset: [0, 0],
			};
		}
		return ret;
	}

	private get parts(): { [id: number]: IPartButtonImage } {
		const ret: { [id: string]: IPartButtonImage } = {};
		let collection: INsfwAbleImg[];
		let offset: IPartButtonImage['offset'];
		let size: IPartButtonImage['size'];
		const data = this.character.data;
		switch (this.part) {
			case 'head':
				for (
					let headKeyIdx = 0;
					headKeyIdx < this.character.pose.compatibleHeads.length;
					++headKeyIdx
				) {
					const headKey = this.character.pose.compatibleHeads[headKeyIdx];
					const heads = data.heads[headKey];
					if (heads.nsfw && !this.nsfw) continue;
					for (let headIdx = 0; headIdx < heads.all.length; ++headIdx) {
						const head = heads.all[headIdx];
						if (head.nsfw && !this.nsfw) continue;
						ret[`${headKeyIdx}_${headIdx}`] = {
							image1: head.img,
							size: heads.size,
							offset: heads.offset,
						};
					}
				}
				return ret;
			case 'variant':
				collection =
					'variant' in this.character.pose ? this.character.pose.variant : [];
				size = this.character.pose.size;
				offset = this.character.pose.offset;
				break;
			case 'left':
				collection =
					'left' in this.character.pose ? this.character.pose.left : [];
				size = this.character.pose.size;
				offset = this.character.pose.offset;
				break;
			case 'right':
				collection =
					'right' in this.character.pose ? this.character.pose.right : [];
				size = this.character.pose.size;
				offset = this.character.pose.offset;
				break;
			case 'pose':
				for (
					let poseIdx = 0;
					poseIdx < this.character.poses.length;
					++poseIdx
				) {
					const pose = this.character.poses[poseIdx];
					if (pose.nsfw && !this.nsfw) continue;
					ret[poseIdx] = this.generatePosePreview(pose);
				}
				return ret;
			case 'style':
				const styles = data.styles;
				const eyes = this.eyes ? Object.keys(this.eyes) : [];
				const hairs = this.hairs ? Object.keys(this.hairs) : [];
				const dedupedStyles = this.styleData
					.map(style => style.reducedName)
					.map((style, idx, all) => {
						if (all.indexOf(style) !== idx) return null;
						return style;
					});

				for (let styleIdx = 0; styleIdx < styles.length; ++styleIdx) {
					if (dedupedStyles[styleIdx] === null) continue;
					const style = styles[styleIdx];
					if (style.nsfw && !this.nsfw) continue;
					const pose = data.poses.find(pose => pose.style === style.name)!;
					ret[dedupedStyles[styleIdx]!] = this.generatePosePreview(pose);
				}
				return ret;

			default:
				throw new Error('Unrecognised pose part: ' + this.part);
		}
		for (let partIdx = 0; partIdx < collection.length; ++partIdx) {
			const part = collection[partIdx];
			if (part.nsfw && !this.nsfw) continue;
			ret[partIdx] = {
				image1: part.img,
				size,
				offset,
			};
		}
		return ret;
	}

	private generatePosePreview(pose: Pose<any>): IPartButtonImage {
		if ('static' in pose) {
			return {
				image1: pose.static,
				size: pose.size,
				offset: pose.offset,
			};
		} else if ('variant' in pose) {
			return {
				image1: pose.variant[0].img,
				size: pose.size,
				offset: pose.offset,
			};
		} else {
			return {
				image1: pose.left[0].img,
				image2: pose.right[0].img,
				size: pose.size,
				offset: pose.offset,
			};
		}
	}

	private get styleData(): IStyle[] {
		const styles = this.character.data.styles;
		const eyesColl = Object.keys(this.eyes || {});
		const hairsColl = Object.keys(this.hairs || {});

		let ret = styles.map((value, index) => {
			let reducedName = value.name;
			let eyes = null;
			for (const iEyes of eyesColl) {
				const exp = new RegExp('-' + iEyes + '\\b');
				if (reducedName.match(exp)) {
					eyes = iEyes;
					reducedName = reducedName.replace(exp, '');
					break;
				}
			}
			let hairs = null;
			for (const iHair of hairsColl) {
				const exp = new RegExp('-' + iHair + '\\b');
				if (reducedName.match(exp)) {
					hairs = iHair;
					reducedName = reducedName.replace(exp, '');
					break;
				}
			}

			return {
				fullName: value.name,
				label: value.label,
				nsfw: value.nsfw,
				index,
				reducedName,
				eyes,
				hairs,
			};
		});
		if (!this.nsfw) {
			ret = ret.filter(style => {
				return !style.nsfw;
			});
		}
		return ret;
	}

	private updatePose() {
		let selection = this.styleData.filter(
			style => style.reducedName === this.character.styleData.lastBase
		);
		const subEyes = selection.filter(
			style => style.eyes === this.character.styleData.eyes
		);
		if (subEyes.length > 0) selection = subEyes;
		const subHairs = selection.filter(
			style => style.hairs === this.character.styleData.hairs
		);
		if (subHairs.length > 0) selection = subHairs;
		this.character.setPart('style', selection[0].index);
	}

	private choose(index: string) {
		if (this.part === 'style') {
			this.character.styleData.lastBase = index;
			this.updatePose();
		} else if (this.part === 'head') {
			const [headTypeIdx, headIdx] = index
				.split('_', 2)
				.map(part => parseInt(part, 10));
			this.character.setPart('headType', headTypeIdx);
			this.character.setPart('head', headIdx);
		} else {
			this.character.setPart(this.part, parseInt(index, 10));
		}
	}

	private choose_eyes(index: string) {
		this.character.styleData.eyes = index;
		this.updatePose();
	}

	private choose_hairs(index: string) {
		this.character.styleData.hairs = index;
		this.updatePose();
	}

	private assetPath(character: ICharacter<any>) {
		if (character.chibi) {
			return character.chibi;
		}
		const lq = environment.allowLQ ? '.lq' : '';
		return `${baseUrl}/assets/chibis/${character.internalId + lq}.${
			this.isWebPSupported ? 'webp' : 'png'
		}`.replace(/\/+/, '/');
	}

	private onFileUpload(e: Event) {
		const uploadInput = this.$refs.upload as HTMLInputElement;
		if (!uploadInput.files) return;
		for (const file of uploadInput.files) {
			(nr => {
				const name = 'customAsset' + nr;
				const url = registerAsset(name, file);
				this.$emit('add-custom-asset', name);
			})(++this.customAssetCount);
		}
	}

	private async uploadFromURL() {
		const url = prompt('Enter the URL of the image');
		if (!url) return;
		const name = 'customAsset' + ++this.customAssetCount;
		await registerAssetWithURL(name, url);
		this.$emit('add-custom-asset', name);
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