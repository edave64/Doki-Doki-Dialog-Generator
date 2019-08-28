<template>
	<div :class="{ panel: true, vertical }">
		<h1>{{character.label}}</h1>
		<fieldset v-if="hasMultiplePoses || parts.length > 0">
			<legend>Pose:</legend>
			<table>
				<tbody>
					<tr v-if="hasMultiplePoses">
						<td>
							<button @click="character.posel();">&lt;</button>
						</td>
						<td>Pose</td>
						<td>
							<button @click="character.poser();">&gt;</button>
						</td>
					</tr>
					<tr v-for="part of parts" :key="part">
						<td>
							<button @click="character.partl(part);">&lt;</button>
						</td>
						<td>{{captialize(part)}}</td>
						<td>
							<button @click="character.partr(part);">&gt;</button>
						</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
		<fieldset>
			<legend>Position:</legend>
			<button @click="character.pos=Math.max(1, character.pos-1);$emit('invalidate-render')">&lt; left</button>
			<button @click="character.pos=Math.min(7, character.pos+1);$emit('invalidate-render')">&gt; right</button>
		</fieldset>
		<fieldset id="layerfs">
			<legend>Layer:</legend>
			<button
				@click="$emit('shiftLayer', {character: character, move: 'Back'})"
				title="Move to back"
			>&#10515;</button>
			<button
				@click="$emit('shiftLayer', {character: character, move: 'Backward'})"
				title="Move backwards"
			>&#8595;</button>
			<button
				@click="$emit('shiftLayer', {character: character, move: 'Forward'})"
				title="Move forwards"
			>&#8593;</button>
			<button
				@click="$emit('shiftLayer', {character: character, move: 'Front'})"
				title="Move to front"
			>&#10514;</button>
		</fieldset>
		<toggle
			v-model="character.infront"
			@input="$emit('invalidate-render')"
			label="In front of textbox?"
		/>
		<toggle v-model="character.close" @input="$emit('invalidate-render')" label="Close up?" />
		<toggle v-model="character.flip" @input="$emit('invalidate-render')" label="Flipped?" />

		<button @click="$emit('shiftLayer', {character: character, move: 'Delete'});$emit('close')">Delete</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported } from '../../asset-manager';
import { Character } from '../../models/character';
import Toggle from '../Toggle.vue';

@Component({
	components: {
		Toggle,
	},
})
export default class CharacterPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Character, required: true }) private character!: Character;

	private isWebPSupported: boolean | null = null;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get parts(): string[] {
		return this.character.getParts();
	}

	private get hasMultiplePoses(): boolean {
		return this.character.data.poses.length > 1;
	}

	private captialize(str: string) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}
}

export interface MoveCharacter {
	character: Character;
	move: 'Forward' | 'Backward' | 'Back' | 'Front' | 'Delete';
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}
</style>