<template>
	<div :class="{ panel: true, vertical }">
		<h1>Background</h1>
		<background-settings :value="value" @invalidate-render="$emit('invalidate-render')" />

		<background-button
			v-for="background of backgrounds"
			:key="background.name"
			:background="background"
			:value="value"
			:customPathLookup="customPathLookup"
			@input="$emit('input', background)"
		/>
		<div class="btn upload-background" @click="$refs.upload.click()">
			Upload
			<input type="file" ref="upload" @change="onFileUpload" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { backgrounds, registerAsset, getAsset } from '../../asset-manager';
import { Background, IBackground, color } from '../../models/background';
import { VariantBackground } from '../../models/variant-background';
import BackgroundButton from './background/button.vue';
import BackgroundSettings from './background/settings.vue';

@Component({
	components: {
		BackgroundButton,
		BackgroundSettings,
	},
})
export default class BackgroundsPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ required: true }) private readonly value!: IBackground;

	private customPathLookup: { [name: string]: string } = {};
	private customBGCount = 0;

	private get backgrounds(): IBackground[] {
		// tslint:disable-next-line: no-unused-expression
		this.customBGCount;
		return backgrounds;
	}

	private onFileUpload(e: Event) {
		const uploadInput = this.$refs.upload as HTMLInputElement;
		if (!uploadInput.files) return;
		for (const file of uploadInput.files) {
			(nr => {
				const name = 'customBg' + nr;
				const url = registerAsset(name, file);
				backgrounds.push(new Background(name, file.name, true));
				this.$set(this.customPathLookup, name, url);
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
		text-align: center;
		user-select: none;
		box-sizing: border-box;

		input {
			display: none;
		}
	}
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