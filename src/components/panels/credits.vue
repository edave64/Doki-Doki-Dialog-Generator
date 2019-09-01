<template>
	<div :class="{ panel: true, vertical }">
		<h1>Credits</h1>
		<p>All assets used are IP of Team Salvato and created by them, unless noted otherwise.</p>
		<p>
			Doki Doki Dialog Generator developed by EDave64
			<br />Based on gemdude46's DDLC Shitpost generator
		</p>
		<p>MC Classic Sprite by Childish-N</p>
		<p>MC Sprite by Childish-N</p>
		<p>MC Chibis by GyleToTheRescue</p>
		<p>
			FeMC Sprite by Meddy-sin
			<br />FeMC Casual Sprite by SlightlySimple
		</p>
		<p>Classic Amy Sprite by Meddy-sin</p>
		<p>Amy Sprite by Meddy-sin and SlightlySimple</p>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class AddPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
}
</script>

<style lang="scss" scoped>
</style>