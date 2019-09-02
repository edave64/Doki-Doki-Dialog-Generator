<template>
	<div :class="{ panel: true, vertical }">
		<h1>General</h1>
		<toggle
			label="Low quality preview?"
			title="Reduces the quality of the preview images to speed up the user experience and consume less data. Does not effect final render."
			:value="lqRendering"
			@input="$emit('update:lqRendering', $event)"
		/>
		<toggle label="Textbox visible?" v-model="options.display" />
		<toggle label="Textbox corrupt?" v-model="options.corrupted" />
		<div>
			<label for="current_talking">Person talking:</label>
			<br />
			<select id="current_talking" v-model="options.talking">
				<option value>No-one</option>
				<option value="Sayori">Sayori</option>
				<option value="Yuri">Yuri</option>
				<option value="Natsuki">Natsuki</option>
				<option value="Monika">Monika</option>
				<option value="FeMC">FeMC</option>
				<option value="MC">MC</option>
				<option value="Amy">Amy</option>
				<option value="other">Other</option>
			</select>
		</div>
		<div>
			<label for="custom_name">Other name:</label>
			<br />
			<input id="custom_name" v-model="options.customName" />
		</div>
		<toggle label="Controls visible?" v-model="options.showControls" />
		<toggle label="Able to skip?" v-model="options.allowSkipping" />
		<toggle label="Continue arrow?" v-model="options.showContinueArrow" />
		<div id="dialog_text_wrapper">
			<label for="dialog_text">Dialog:</label>
			<textarea v-model="options.dialog" id="dialog_text" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Textbox } from '../../models/textbox';
import Toggle from '../Toggle.vue';

@Component({
	components: {
		Toggle,
	},
})
export default class GeneralPanel extends Vue {
	@Prop({ required: true }) private readonly options!: Textbox;
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ required: true, type: Boolean })
	private readonly lqRendering!: boolean;

	@Watch('options.customName')
	private talkingChange(): void {
		this.options.talking = 'other';
	}
}
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

.panel {
	&:not(.vertical) {
		#dialog_text_wrapper {
			height: calc(100% - 2px);
			display: table;

			* {
				display: table-row;
				height: 100%;
			}

			label {
				height: 0px;
			}
		}
	}
}

textarea {
	min-height: 148px;
}
</style>