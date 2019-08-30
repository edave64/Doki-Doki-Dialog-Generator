<template>
	<div :class="{ panel: true, vertical }">
		<h1>Custom Sprite</h1>
		<fieldset>
			<legend>Position/Size:</legend>
			<label for="sprite_x">X:</label>
			<input id="sprite_x" type="number" v-model.number="sprite.x" @input="$emit('invalidate-render')" />
			<br />
			<label for="sprite_y">Y:</label>
			<input id="sprite_y" type="number" v-model.number="sprite.y" @input="$emit('invalidate-render')" />
			<br />
			<label for="sprite_w">Width:</label>
			<input
				id="sprite_w"
				type="number"
				v-model.number="sprite.width"
				@input="$emit('invalidate-render')"
			/>
			<br />
			<label for="sprite_h">Height:</label>
			<input
				id="sprite_h"
				type="number"
				v-model.number="sprite.height"
				@input="$emit('invalidate-render')"
			/>
		</fieldset>
		<fieldset id="layerfs">
			<legend>Layer:</legend>
			<button
				@click="$emit('shiftLayer', {object: sprite, move: 'Back'})"
				title="Move to back"
			>&#10515;</button>
			<button
				@click="$emit('shiftLayer', {object: sprite, move: 'Backward'})"
				title="Move backwards"
			>&#8595;</button>
			<button
				@click="$emit('shiftLayer', {object: sprite, move: 'Forward'})"
				title="Move forwards"
			>&#8593;</button>
			<button
				@click="$emit('shiftLayer', {object: sprite, move: 'Front'})"
				title="Move to front"
			>&#10514;</button>
		</fieldset>
		<toggle
			v-model="sprite.infront"
			@input="$emit('invalidate-render')"
			label="In front of textbox?"
		/>
		<toggle v-model="sprite.flip" @input="$emit('invalidate-render')" label="Flip?" />

		<button @click="$emit('shiftLayer', {object: sprite, move: 'Delete'});$emit('close')">Delete</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported } from '../../asset-manager';
import { Character } from '../../models/character';
import Toggle from '../Toggle.vue';
import { IRenderable } from '../../models/renderable';
import { Sprite } from '../../models/sprite';

@Component({
	components: {
		Toggle,
	},
})
export default class SpritePanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Sprite, required: true }) private sprite!: Sprite;
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}
</style>