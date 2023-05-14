<!--
	A tab that shows the application credits.
-->
<template>
	<div class="panel">
		<h1>Help and Credits</h1>
		<l class="btn" to="wiki://Dokumentation">Help</l>
		<l class="btn" to="github://">Fork me on GitHub</l>
		<l class="btn" to="wiki://Privacy Statement">Privacy Statement</l>
		<p>
			All assets used are IP of Team Salvato and created by them, unless noted
			otherwise.
		</p>
		<p>
			Doki Doki Dialog Generator developed by EDave64
			<br />Based on gemdude46's DDLC Shitpost generator
		</p>
		<p>
			Unused House Background by
			<l
				to="https://www.deviantart.com/fatelogic/art/VN-Background-Practice-295671161"
			>
				Fatelogic
			</l>
		</p>
		<p>
			Aller Font by
			<l to="https://www.daltonmaag.com/library/aller">Dalton Maag Ltd</l>
		</p>
		<p>
			Riffic Bold Font by
			<l to="https://www.fontspring.com/fonts/inky-type/riffic">InkyType</l>
		</p>
		<p>
			Verily Serif Mono Font by
			<l to="https://www.dafont.com/verily-serif-mono.font"
				>Stephen G. Hartke</l
			>
		</p>
		<p>
			F25 Bank Printer Font by
			<l to="https://www.dafont.com/f25-bank-printer.font"
				>F25 Digital Typeface Design</l
			>
		</p>
		<p>
			Journal Font by
			<l to="https://www.dafont.com/journal.font">Fontourist</l>
		</p>
		<p>
			Hashtag Font by
			<l to="https://www.dafont.com/hashtag.font"> TitanVex</l>
		</p>
		<p>
			JP Hand Slanted Font by
			<l to="https://www.dafont.com/jp-hand-slanted.font">Jonathan Paterson</l>
		</p>
		<p>
			As I Lay Dying Font by
			<l to="https://www.dafont.com/as-i-lay-dying.font">Moises Esqueda</l>
		</p>
		<p>
			Damagrafik Script Font by
			<l to="https://www.dafont.com/damagrafik-script.font">Davide Terenzi</l>
		</p>
		<p>
			Ammy's Handwriting Font by
			<l to="https://www.dafont.com/ammys-handwriting.font">Ammy K.</l>
		</p>
		<p>
			Halogen Font by
			<l to="https://www.dafont.com/halogen.font">JLH Fonts</l>
		</p>
		<p>
			MC Sprite by Childish-N
			<br />MC Casual Sprite by SlightlySimple <br />MC Chibi by SlightlySimple
		</p>
		<p>
			<l to="https://www.reddit.com/ofkg59">Concept MC</l> by StormBlazed76,
			<l to="https://www.reddit.com/og6shh">red</l> and
			<l to="https://www.reddit.com/oft3vb">yellow</l> eyes by YinuS_WinneR,
			<l to="https://www.reddit.com/ofof3o">chibi</l> by Hadrosaur838
		</p>
		<p>
			MC Chad Sprite by Cylent-Nite
			<br />MC Chad Poses and expressions by SlightlySimple <br />MC Chad Poses
			and chibi by Meddy-sin
		</p>
		<p>
			FeMC Sprite by Meddy-sin
			<br />FeMC Casual Sprite by SlightlySimple
		</p>
		<p>
			<l to="https://www.reddit.com/oizaow">Concept FeMC</l> by ShidoDraws,
			<l to="https://www.reddit.com/oosuxu"
				>additional poses, expressions and chibi</l
			>
			by SlightlySimple
		</p>
		<p>Amy Sprite by Meddy-sin and SlightlySimple</p>
		<p>Special thanks to SlightlySimple for testing and technical help</p>
		<p>
			Atlas421, T-Rex Harris, smearglexd and Tactical Cupcakes for suggestions
			and testing
		</p>
	</div>
</template>

<script lang="ts">
import { PanelMixin } from './panelMixin';
import L from '@/components/ui/link.vue';
import { defineComponent } from 'vue';

export default defineComponent({
	mixins: [PanelMixin],
	components: { L },
});
</script>

<style lang="scss" scoped>
p {
	margin: 4px;
	max-width: 256px;
}
</style>
