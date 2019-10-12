<template>
	<div :class="{ panel: true }">
		<h1>General</h1>
		<a
			class="btn_link"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/edave64/Doki-Doki-Dialog-Generator/blob/v1/docs/index.md"
		>Help</a>
		<toggle
			label="Low quality preview?"
			title="Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render."
			:value="lqRendering"
			@input="$emit('update:lqRendering', $event)"
		/>
		<button :disabled="!hasPrevRender" @click="$emit('show-prev-render')">Compare to last download</button>
		<toggle label="NSFW Mode?" :value="nsfw" @input="setNsfw" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { TextBox } from '@/models/textbox';
import Toggle from '@/components/toggle.vue';
import { State } from 'vuex-class-decorator';

@Component({
	components: {
		Toggle,
	},
})
export default class GeneralPanel extends Vue {
	@Prop({ required: true, type: Boolean })
	private readonly lqRendering!: boolean;
	@Prop({ required: true, type: Boolean })
	private readonly hasPrevRender!: boolean;
	@State('nsfw', { namespace: 'ui' }) private readonly nsfw!: boolean;

	private setNsfw(value: boolean) {
		this.$store.commit('ui/setNsfw', value);
	}
}
</script>

<style lang="scss" scoped>
.panel {
	&.vertical {
		#dialog_text_wrapper {
			width: 173px;

			textarea {
				width: 100%;
			}
		}
	}

	&:not(.vertical) {
		#dialog_text_wrapper {
			height: 181px;
			display: table;

			* {
				display: table-row;
			}
		}
	}
}

textarea {
	min-height: 148px;
}

.btn_link {
	appearance: button;
	text-align: center;
}
</style>