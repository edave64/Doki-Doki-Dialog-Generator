<!--
	A tab that shows the application credits.
-->
<template>
	<div class="panel" ref="root">
		<h1>Help and Credits</h1>
		<external-link class="btn" to="wiki://Dokumentation"
			>Help</external-link
		>
		<external-link class="btn" to="github://"
			>Fork me on GitHub</external-link
		>
		<external-link class="btn" to="wiki://Privacy Statement"
			>Privacy Statement</external-link
		>
		<p>
			All assets used are IP of Team Salvato and created by them, unless
			noted otherwise.
		</p>
		<p>
			Doki Doki Dialog Generator developed by EDave64
			<br />Based on gemdude46's DDLC Shitpost generator
		</p>
		<p>
			Unused House Background by
			<external-link
				to="https://www.deviantart.com/fatelogic/art/VN-Background-Practice-295671161"
			>
				Fatelogic
			</external-link>
		</p>
		<p>
			Aller Font by
			<external-link to="https://www.daltonmaag.com/library/aller"
				>Dalton Maag Ltd</external-link
			>
		</p>
		<p>
			Riffic Bold Font by
			<external-link
				to="https://www.fontspring.com/fonts/inky-type/riffic"
				>InkyType</external-link
			>
		</p>
		<p>
			Verily Serif Mono Font by
			<external-link to="https://www.dafont.com/verily-serif-mono.font"
				>Stephen G. Hartke</external-link
			>
		</p>
		<p>
			F25 Bank Printer Font by
			<external-link to="https://www.dafont.com/f25-bank-printer.font"
				>F25 Digital Typeface Design</external-link
			>
		</p>
		<p>
			Journal Font by
			<external-link to="https://www.dafont.com/journal.font"
				>Fontourist</external-link
			>
		</p>
		<p>
			Hashtag Font by
			<external-link to="https://www.dafont.com/hashtag.font">
				TitanVex</external-link
			>
		</p>
		<p>
			JP Hand Slanted Font by
			<external-link to="https://www.dafont.com/jp-hand-slanted.font"
				>Jonathan Paterson</external-link
			>
		</p>
		<p>
			As I Lay Dying Font by
			<external-link to="https://www.dafont.com/as-i-lay-dying.font"
				>Moises Esqueda</external-link
			>
		</p>
		<p>
			Damagrafik Script Font by
			<external-link to="https://www.dafont.com/damagrafik-script.font"
				>Davide Terenzi</external-link
			>
		</p>
		<p>
			Ammy's Handwriting Font by
			<external-link to="https://www.dafont.com/ammys-handwriting.font"
				>Ammy K.</external-link
			>
		</p>
		<p>
			Halogen Font by
			<external-link to="https://www.dafont.com/halogen.font"
				>JLH Fonts</external-link
			>
		</p>
		<p>
			MC Sprite by Childish-N
			<br />MC Casual Sprite by SlightlySimple <br />MC Chibi by
			SlightlySimple
		</p>
		<p>
			<external-link
				to="https://www.reddit.com/r/DDLCMods/comments/1hhmu77/"
				>Concept MC</external-link
			>
			by StormBlazed76,
			<external-link to="https://www.reddit.com/ofof3o"
				>chibi</external-link
			>
			by Hadrosaur838
		</p>
		<p>
			MC Chad Sprite by Cylent-Nite
			<br />MC Chad Poses and expressions by SlightlySimple <br />MC Chad
			Poses and chibi by Meddy-sin
		</p>
		<p>
			FeMC Sprite by Meddy-sin
			<br />FeMC Casual Sprite by SlightlySimple
		</p>
		<p>
			<external-link to="https://www.reddit.com/oizaow"
				>Concept FeMC</external-link
			>
			by ShidoDraws,
			<external-link to="https://www.reddit.com/oosuxu"
				>additional poses, expressions and chibi</external-link
			>
			by SlightlySimple
		</p>
		<p>Amy Sprite by Meddy-sin and SlightlySimple</p>
		<p>Special thanks to SlightlySimple for testing and technical help</p>
		<p>
			Atlas421, T-Rex Harris, smearglexd and Tactical Cupcakes for
			suggestions and testing
		</p>
	</div>
</template>

<script lang="ts" setup>
import { setupPanelMixin } from '@/components/mixins/panel-mixin';
import ExternalLink from '@/components/ui/external-link.vue';
import { ref } from 'vue';

const root = ref(null! as HTMLDivElement);
setupPanelMixin(root);
</script>

<style lang="scss" scoped>
p {
	margin: 4px;
	max-width: 256px;
}
</style>
