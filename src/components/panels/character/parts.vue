<template>
	<div :class="{ partList: true, vertical }">
		<button @click="$emit('leave')">Back</button>
		<part-button
			v-for="(part, index) of parts"
			:key="index"
			:value="index"
			:part="part"
			@click="choose(index); $emit('leave')"
		/>
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
} from '@/asset-manager';
import environment from '@/environments/environment';
import { Part, Character } from '@/models/character';
import PartButton, { IPartButtonImage } from './partButton.vue';
import { poses } from '../../../models/constants';

@Component({
	components: {
		PartButton,
	},
})
export default class PartsPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Character, required: true }) private character!: Character;
	@Prop({ required: true, type: String }) private readonly part!: Part | 'pose';
	@Prop({ required: true, type: Boolean }) private readonly nsfw!: boolean;

	private isWebPSupported: boolean | null = null;
	private customAssetCount = 0;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
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
				for (let poseIdx = 0; poseIdx < data.poses.length; ++poseIdx) {
					const pose = data.poses[poseIdx];
					if (pose.nsfw && !this.nsfw) continue;
					if ('static' in pose) {
						ret[poseIdx] = {
							image1: pose.static,
							size: pose.size,
							offset: pose.offset,
						};
					} else if ('variant' in pose) {
						ret[poseIdx] = {
							image1: pose.variant[0].img,
							size: pose.size,
							offset: pose.offset,
						};
					} else if ('left' in pose) {
						ret[poseIdx] = {
							image1: pose.left[0].img,
							image2: pose.right[0].img,
							size: pose.size,
							offset: pose.offset,
						};
					}
				}
				return ret;

			default:
				throw new Error('Unrecognised pose part');
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

	private choose(index: string) {
		if (this.part === 'head') {
			const [headTypeIdx, headIdx] = index
				.split('_', 2)
				.map(part => parseInt(part));
			this.character.setPart('headType', headTypeIdx);
			this.character.setPart('head', headIdx);
		} else {
			this.character.setPart(this.part, parseInt(index));
		}
	}

	private assetPath(character: ICharacter<any>) {
		if (character.chibi) {
			return character.chibi;
		}
		const lq = environment.allowLQ ? '.lq' : '';
		return `${process.env.BASE_URL}/assets/chibis/${character.internalId +
			lq}.${this.isWebPSupported ? 'webp' : 'png'}`.replace(/\/+/, '/');
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
	display: flex;
	flex-wrap: nowrap;

	&:not(.vertical) {
		justify-content: center;
	}

	&.vertical {
		flex-direction: column;
		.character {
			text-align: center;
		}
	}

	.custom-sprite {
		input {
			display: none;
		}
	}
}
</style>