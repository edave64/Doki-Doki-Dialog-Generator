<template>
	<div class="panel">
		<h1>Help and Credits</h1>
		<a
			class="btn"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/edave64/Doki-Doki-Dialog-Generator/blob/v1/docs/index.md"
		>Help</a>
		<a
			class="btn"
			target="_blank"
			rel="noopener noreferrer"
			href="https://github.com/edave64/Doki-Doki-Dialog-Generator/"
		>Fork me on GitHub</a>
		<p>
			All assets used are IP of Team Salvato and created by them, unless noted
			otherwise.
		</p>
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
			<br />MC Chad Poses
			and chibi by Meddy-sin
		</p>
		<p>
			FeMC Sprite by Meddy-sin
			<br />FeMC Casual Sprite by SlightlySimple
		</p>
		<p>Classic Amy Sprite by Meddy-sin</p>
		<p>Amy Sprite by Meddy-sin and SlightlySimple</p>
		<p>Special thanks to SlightlySimple for testing and technical help</p>
		<p>Atlas421 for suggestions and testing</p>
		<p>T-Rex Harris for suggestions and testing</p>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { PanelMixin } from './panelMixin';

@Component({
	components: {},
})
export default class AddPanel extends Mixins(PanelMixin) {}
</script>

<style lang="scss" scoped>
p {
	margin: 4px;
	max-width: 256px;
}
</style>
