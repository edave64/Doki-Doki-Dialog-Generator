<template>
	<div :class="{ panel: true, vertical }">
		<h1>Credits</h1>
		<p>All assets used are IP of Team Salvato and created by them, unless noted otherwise.</p>
		<p>
			Unused House Background by
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.deviantart.com/fatelogic/art/VN-Background-Practice-295671161"
			>Fatelogic</a>
		</p>
		<p>
			Doki Doki Dialog Generator developed by EDave64
			<br />Based on gemdude46's DDLC Shitpost generator
		</p>
		<p>
			MC Classic Sprite by Childish-N
			<br />MC Classic Chibi by GyleToTheRescue
		</p>
		<p>
			MC Sprite by Childish-N
			<br />MC Casual Sprite by SlightlySimple
			<br />MC Chibi by SlightlySimple
		</p>
		<p>
			MC Chad Sprite by Cylent-Nite
			<br />MC Chad Poses and expressions by SlightlySimple
			<br />MC Chad Poses and chibi by Meddy-sin
		</p>
		<p>
			FeMC Sprite by Meddy-sin
			<br />FeMC Casual Sprite by SlightlySimple
		</p>
		<p>Classic Amy Sprite by Meddy-sin</p>
		<p>Amy Sprite by Meddy-sin and SlightlySimple</p>
		<p>Special thanks to SlightlySimple for testing and technical help and Atlas421 for testing</p>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { PanelMixin } from './panelMixin';

@Component({
	components: {},
})
export default class AddPanel extends Mixins(PanelMixin) {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
}
</script>

<style lang="scss" scoped>
p {
	margin: 4px;
}
</style>