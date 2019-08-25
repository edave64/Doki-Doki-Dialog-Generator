<template>
	<div :class="{ panel: true, vertical }" v-if="isWebPSupported !== undefined">
		<h1>Background</h1>
		<div
			v-for="background of backgrounds"
			:class="{background: true, active: background === value}"
			:key="background.name"
			:title="background.name"
			:style="{backgroundImage: 'url(' + (background.custom ? customPathLookup[background.path] : assetPath(background.path)) + ')'}"
			@click="$emit('input', background)"
		>{{background.name}}</div>
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
import { Background } from '../../models/background';

interface IDoki {
	id: string;
	name: string;
}

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

	private get backgrounds(): Background[] {
		// this is just to force a recompute when a new custom background gets added.
		const count = this.customBGCount;
		return backgrounds;
	}

	private assetPath(doki: string) {
		return `${process.env.BASE_URL}/assets/${doki.toLowerCase()}.lq.${
			this.isWebPSupported ? 'webp' : 'png'
		}`.replace(/\/+/, '/');
	}

	private onClick(e: MouseEvent): void {
		const girlSel = this.$el as HTMLDivElement;
		const cx = e.clientX - girlSel.offsetLeft;
		const girl =
			cx < 123 ? 'sayori' : cx < 247 ? 'yuri' : cx < 370 ? 'monika' : 'natsuki';
		this.$emit('chosen', girl);
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
</style>