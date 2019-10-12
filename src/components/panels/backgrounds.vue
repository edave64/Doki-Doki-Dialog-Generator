<template>
	<div :class="{ panel: true }">
		<h1>Background</h1>
		<background-settings :value="value" :nsfw="nsfw" @invalidate-render="$emit('invalidate-render')" />

		<background-button
			v-for="background of backgrounds"
			:key="background.name"
			:background="background"
			:value="value"
			:customPathLookup="customPathLookup"
			@input="nsfwFilter(background);$emit('input', background)"
		/>
		<div class="btn upload-background" @click="$refs.upload.click()">
			Upload
			<input type="file" ref="upload" @change="onFileUpload" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { backgrounds, registerAsset, getAsset } from '@/asset-manager';
import {
	Background,
	IBackground,
	color,
	nsfwFilter,
} from '@/models/background';
import { VariantBackground } from '@/models/variant-background';
import BackgroundButton from './background/button.vue';
import BackgroundSettings from './background/settings.vue';
import { State } from 'vuex-class-decorator';

@Component({
	components: {
		BackgroundButton,
		BackgroundSettings,
	},
})
export default class BackgroundsPanel extends Vue {
	@Prop({ required: true }) private readonly value!: IBackground;
	@State('nsfw', { namespace: 'ui' }) private readonly nsfw!: boolean;

	private customPathLookup: { [name: string]: string } = {};
	private customBGCount = 0;

	private get backgrounds(): IBackground[] {
		// tslint:disable-next-line: no-unused-expression
		this.customBGCount;
		return this.nsfw ? backgrounds : backgrounds.filter(bg => !bg.nsfw);
	}

	private onFileUpload(e: Event) {
		const uploadInput = this.$refs.upload as HTMLInputElement;
		if (!uploadInput.files) return;
		for (const file of uploadInput.files) {
			(nr => {
				const name = 'customBg' + nr;
				const url = registerAsset(name, file);
				backgrounds.push(new Background(name, file.name, false, true));
				this.$set(this.customPathLookup, name, url);
			})(++this.customBGCount);
		}
	}

	private nsfwFilter(background: IBackground) {
		if (!this.nsfw) {
			nsfwFilter(background);
		}
	}
}
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

.upload-background {
	margin-top: 4px;
	background-size: cover;
	text-shadow: 0 0 2px white;
	color: black;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
	height: 48px;
	min-height: 48px;
	text-align: center;
	user-select: none;
	text-align: center;
	user-select: none;

	input {
		display: none;
	}
}

#panels:not(.vertical) > .panel {
	> div {
		width: 12rem;
	}
}

#panels.vertical > .panel {
	> div {
		text-align: center;
	}
}

.vertical {
	fieldset {
		width: calc(100% - 4px);
		input {
			width: 60px;
		}
	}
}
</style>