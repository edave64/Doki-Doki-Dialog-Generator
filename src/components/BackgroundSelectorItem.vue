<template>
	<div @click="$emit('click')" :class="{ active }" :title="background.name">
		<img :src="background.el.src" />
		{{background.name}}
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { backgrounds } from '../models/constants';
import { Background } from '../models/background';

@Component({
	components: {},
})
export default class BackgroundSelectorItem extends Vue {
	@Prop({ required: true }) private background!: Background;
	@Prop({ type: Boolean, default: false }) private active!: boolean;
}
</script>

<style lang="scss" scoped>
img {
	width: 128px;
	float: left;
	margin-right: 1em;
}

div {
	background-color: transparent;
	color: #555;
	font-size: 16px;
	height: 72px;
	padding: 5px;
	cursor: pointer;

	&.active {
		background-color: white;
	}
}
</style>
