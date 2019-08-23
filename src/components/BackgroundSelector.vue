<template>
	<div id="bg_sel" class="gui" @click="$emit('click')">
		<background-selector-item
			v-for="background of backgrounds"
			:key="background.name"
			:background="background"
			:active="value === background"
			@click="$emit('input', background)"
		/>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import BackgroundSelectorItem from './BackgroundSelectorItem.vue';
import { Background, backgrounds } from '../asset-manager';

@Component({
	components: {
		BackgroundSelectorItem,
	},
})
export default class BackgroundSelector extends Vue {
	@Prop({ type: Background, required: true })
	private readonly value!: Background;
	private get backgrounds(): Background[] {
		return backgrounds;
	}
}
</script>

<style lang="scss">
#bg_sel {
	position: absolute;
	top: 5vh;
	height: 90vh;
	left: 20vw;
	width: 60vw;
	border: 3px solid #ffbde1;
	background-color: #ffe6f4;
	overflow: auto;
}
</style>
