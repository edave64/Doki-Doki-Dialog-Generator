<template>
	<div :class="{ panel: true, vertical }">
		<h1>{{girl.label}}</h1>
		<fieldset v-if="hasMultiplePoses || parts.length > 0">
			<legend>Pose:</legend>
			<table>
				<tbody>
					<tr v-if="hasMultiplePoses">
						<td>
							<button @click="girl.posel();">&lt;</button>
						</td>
						<td>Pose</td>
						<td>
							<button @click="girl.poser();">&gt;</button>
						</td>
					</tr>
					<tr v-for="part of parts" :key="part">
						<td>
							<button @click="girl.partl(part);">&lt;</button>
						</td>
						<td>{{captialize(part)}}</td>
						<td>
							<button @click="girl.partr(part);">&gt;</button>
						</td>
					</tr>
				</tbody>
			</table>
		</fieldset>
		<fieldset>
			<legend>Position:</legend>
			<button @click="girl.pos=Math.max(1, girl.pos-1);$emit('invalidate-render')">&lt; left</button>
			<button @click="girl.pos=Math.min(7, girl.pos+1);$emit('invalidate-render')">&gt; right</button>
		</fieldset>
		<fieldset id="layerfs">
			<legend>Layer:</legend>
			<button @click="$emit('shiftLayer', {girl: girl, move: 'Back'})" title="Move to back">&#10515;</button>
			<button
				@click="$emit('shiftLayer', {girl: girl, move: 'Backward'})"
				title="Move backwards"
			>&#8595;</button>
			<button @click="$emit('shiftLayer', {girl: girl, move: 'Forward'})" title="Move forwards">&#8593;</button>
			<button @click="$emit('shiftLayer', {girl: girl, move: 'Front'})" title="Move to front">&#10514;</button>
		</fieldset>
		<toggle v-model="girl.infront" @input="$emit('invalidate-render')" label="In front of textbox?" />
		<toggle v-model="girl.close" @input="$emit('invalidate-render')" label="Close up?" />
		<toggle v-model="girl.flip" @input="$emit('invalidate-render')" label="Flipped?" />

		<button @click="$emit('shiftLayer', {girl: girl, move: 'Delete'});$emit('close')">Delete</button>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { isWebPSupported } from '../../asset-manager';
import { Girl } from '../../models/girl';
import Toggle from '../Toggle.vue';

interface IDoki {
	id: string;
	name: string;
}

@Component({
	components: {
		Toggle,
	},
})
export default class CharacterPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Girl, required: true }) private girl!: Girl;

	private isWebPSupported: boolean | null = null;
	private dokis: string[] = ['Monika', 'Natsuki', 'Sayori', 'Yuri'];

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private get parts(): string[] {
		return this.girl.getParts();
	}

	private get hasMultiplePoses(): boolean {
		return this.girl.doki.poses.length > 1;
	}

	private captialize(str: string) {
		return str.charAt(0).toUpperCase() + str.substring(1);
	}
}

export interface MoveGirl {
	girl: Girl;
	move: 'Forward' | 'Backward' | 'Back' | 'Front' | 'Delete';
}
</script>

<style lang="scss" scoped>
fieldset {
	border: 3px solid #ffbde1;
}
</style>