<template>
	<div :class="{ panel: true, vertical }">
		<h1>{{character.label}}</h1>
		<fieldset v-if="hasMultiplePoses || parts.length > 0">
			<legend>Pose:</legend>
			<table>
				<tbody>
					<tr v-if="hasMultiplePoses">
						<td>
							<button @click="character.seekPose(-1, nsfw);">&lt;</button>
						</td>
						<td>Pose</td>
						<td>
							<button @click="character.seekPose(1, nsfw);">&gt;</button>
						</td>
					</tr>
					<tr v-for="part of parts" :key="part">
						<td>
							<button @click="character.seekPart(part, -1);">&lt;</button>
						</td>
						<td>{{captialize(part)}}</td>
						<td>
							<button @click="character.seekPart(part, 1);">&gt;</button>
						</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
		<fieldset>
			<legend>Position:</legend>
			<toggle
				v-model="character.allowFreeMove"
				label="Move freely?"
				@input="$emit('invalidate-render')"
			/>
			<div v-if="!character.allowFreeMove">
				<button @click="--character.pos;$emit('invalidate-render')" :disabled="character.pos === 0">&lt;</button>
				<select id="current_talking" v-model.number="character.pos" @input="$emit('invalidate-render')">
					<option v-for="(val, key) of positionNames" :key="key" :value="key">{{val}}</option>
				</select>
				<button
					@click="++character.pos;$emit('invalidate-render')"
					:disabled="character.pos >= positionNames.length - 1"
				>&gt;</button>
			</div>
			<div v-else>
				<label for="sprite_x">X:</label>
				<input
					id="sprite_x"
					type="number"
					v-model.number="character.x"
					@input="$emit('invalidate-render')"
					@keydown.stop
				/>
				<br />
				<label for="sprite_y">Y:</label>
				<input
					id="sprite_y"
					type="number"
					v-model.number="character.y"
					@input="$emit('invalidate-render')"
					@keydown.stop
				/>
			</div>
		</fieldset>
		<fieldset id="layerfs">
			<legend>Layer:</legend>
			<button
				@click="$emit('shiftLayer', {object: character, move: 'Back'})"
				title="Move to back"
			>&#10515;</button>
			<button
				@click="$emit('shiftLayer', {object: character, move: 'Backward'})"
				title="Move backwards"
			>&#8595;</button>
			<button
				@click="$emit('shiftLayer', {object: character, move: 'Forward'})"
				title="Move forwards"
			>&#8593;</button>
			<button
				@click="$emit('shiftLayer', {object: character, move: 'Front'})"
				title="Move to front"
			>&#10514;</button>
		</fieldset>
		<div>
			<label for="characterOpacity">Opacity:</label>
			<input
				type="number"
				max="100"
				min="0"
				id="characterOpacity"
				v-model.number="character.opacity"
				@input="$emit('invalidate-render')"
				@keydown.stop
			/>
		</div>
		<toggle
			v-model="character.infront"
			@input="$emit('invalidate-render')"
			label="In front of textbox?"
		/>
		<toggle v-model="character.close" @input="$emit('invalidate-render')" label="Close up?" />
		<toggle v-model="character.flip" @input="$emit('invalidate-render')" label="Flipped?" />

		<button @click="$emit('shiftLayer', {object: character, move: 'Delete'});$emit('close')">Delete</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported } from '../../asset-manager';
import { Character } from '../../models/character';
import Toggle from '../Toggle.vue';
import { IRenderable } from '../../models/renderable';
import { positions } from '../../models/constants';

@Component({
	components: {
		Toggle,
	},
})
export default class CharacterPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Character, required: true }) private character!: Character;
	@Prop({ required: true, type: Boolean }) private readonly nsfw!: boolean;

	private isWebPSupported: boolean | null = null;

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get positionNames(): string[] {
		return positions;
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

export interface MoveObject {
	object: IRenderable;
	move: 'Forward' | 'Backward' | 'Back' | 'Front' | 'Delete';
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}

.vertical {
	fieldset {
		box-sizing: border-box;
		width: calc(100% - 4px);
		input {
			width: 60px;
		}
	}
}
</style>