<template>
	<div :class="{ panel: true, vertical }" v-if="isWebPSupported !== undefined">
		<h1>Background</h1>
		<fieldset v-if="value === colorBackground">
			<legend>Settings:</legend>
			<label for="bg_color">Color:</label>
			<input
				id="bg_color"
				type="color"
				v-model="colorBackground.color"
				@input="$emit('invalidate-render')"
			/>
		</fieldset>
		<div
			v-for="background of backgrounds"
			:class="{background: true, active: background === value}"
			:key="background.name"
			:title="background.name"
			:style="{backgroundImage: 'url(' + (background.custom ? customPathLookup[background.path] : assetPath(background.path)) + ')'}"
			@click="$emit('input', background)"
		>{{background.name}}</div>
		<div
			:class="{background: true, active: colorBackground === value}"
			:key="colorBackground.name"
			:title="colorBackground.name"
			:style="{background: colorBackground.color }"
			@click="$emit('input', colorBackground)"
		>{{colorBackground.name}}</div>
		<div class="btn upload-background" @click="$refs.upload.click()">
			Upload
			<input type="file" ref="upload" @change="onFileUpload" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import {
	isWebPSupported,
	backgrounds,
	registerAsset,
	getAsset,
} from '../../asset-manager';
import { Background, IBackground, color } from '../../models/background';

@Component({
	components: {},
})
export default class BackgroundsPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Background, required: true })
	private readonly value!: Background;

	private isWebPSupported: boolean | null = null;
	private customPathLookup: { [name: string]: string } = {};
	private customBGCount = 0;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get colorBackground(): typeof color {
		return color;
	}

	private get backgrounds(): IBackground[] {
		// this is just to force a recompute when a new custom background gets added.
		const count = this.customBGCount;
		return backgrounds.filter(background => background instanceof Background);
	}

	private assetPath(background: string) {
		return `${process.env.BASE_URL}/assets/${background.toLowerCase()}.lq.${
			this.isWebPSupported ? 'webp' : 'png'
		}`.replace(/\/+/, '/');
	}

	private onFileUpload(e: Event) {
		const uploadInput = this.$refs.upload as HTMLInputElement;
		if (!uploadInput.files) return;
		for (const file of uploadInput.files) {
			(nr => {
				const name = 'customBg' + nr;
				const url = registerAsset(name, file);
				backgrounds.push(new Background(name, file.name, true));
				this.customPathLookup[name] = url;
			})(++this.customBGCount);
		}
	}
}
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

.panel {
	.background {
		margin-top: 4px;
		background-size: cover;
		text-shadow: 0 0 2px black;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 0 1px 3px rgba(0, 0, 0, 0.5);
		height: 48px;
		min-height: 48px;
		text-align: center;
		user-select: none;
	}

	&:not(.vertical) {
		> div {
			width: 12rem;
		}
	}

	&.vertical {
		> div {
			text-align: center;
		}
	}

	.upload-background {
		margin-top: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 48px;
		min-height: 48px;
		text-align: center;
		user-select: none;
		box-sizing: border-box;

		input {
			display: none;
		}
	}
}
fieldset {
	border: 3px solid #ffbde1;
	min-height: 135px;
}

.vertical {
	fieldset {
		box-sizing: border-box;
		width: calc(100% - 4px);
		input {
			width: 60px;
		}
	}
}
</style>