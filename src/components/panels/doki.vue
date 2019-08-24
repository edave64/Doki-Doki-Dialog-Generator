<template>
	<div :class="{ panel: true, vertical }">
		<h1>{{girl.name.charAt(0).toUpperCase()}}{{girl.name.substring(1)}}</h1>
		<fieldset>
			<legend>Pose:</legend>
			<table>
				<tbody>
					<tr>
						<td>
							<button @click="girl.headl();$emit('invalidate-render')">&lt;</button>
						</td>
						<td>Head</td>
						<td>
							<button @click="girl.headr();$emit('invalidate-render')">&gt;</button>
						</td>
					</tr>
					<tr v-if="girl.name === 'yuri'">
						<td>
							<button @click="girl.leftl();$emit('invalidate-render')">&lt;</button>
						</td>
						<td>Left</td>
						<td>
							<button @click="girl.leftr();$emit('invalidate-render')">&gt;</button>
						</td>
					</tr>
					<tr v-if="girl.name === 'yuri'">
						<td>
							<button @click="girl.rightl();$emit('invalidate-render')">&lt;</button>
						</td>
						<td>Right</td>
						<td>
							<button @click="girl.rightr();$emit('invalidate-render')">&gt;</button>
						</td>
					</tr>
					<tr v-if="girl.name !== 'yuri'">
						<td>
							<button @click="girl.leftl();girl.rightl();$emit('invalidate-render')">&lt;</button>
						</td>
						<td>Body</td>
						<td>
							<button @click="girl.leftr();girl.rightr();$emit('invalidate-render')">&gt;</button>
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
export default class AddPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
	@Prop({ type: Girl, required: true }) private girl!: Girl;

	private isWebPSupported: boolean | null = null;
	private dokis: string[] = ['Monika', 'Natsuki', 'Sayori', 'Yuri'];

	private async created() {
		this.isWebPSupported = await isWebPSupported();
	}

	private assetPath(doki: string) {
		return `/assets/chibis/${doki.toLowerCase()}.lq.${
			this.isWebPSupported ? 'webp' : 'png'
		}`;
	}

	private onClick(e: MouseEvent): void {
		const girlSel = this.$el as HTMLDivElement;
		const cx = e.clientX - girlSel.offsetLeft;
		const girl =
			cx < 123 ? 'sayori' : cx < 247 ? 'yuri' : cx < 370 ? 'monika' : 'natsuki';
		this.$emit('chosen', girl);
	}
}

export interface MoveGirl {
	girl: Girl;
	move: 'Forward' | 'Backward' | 'Back' | 'Front' | 'Delete';
}
</script>

<style lang="scss" scoped>
textarea {
	flex-grow: 1;
}

.panel {
	&:not(.vertical) {
		justify-content: center;
	}

	&.vertical {
		.doki {
			text-align: center;
		}
	}
}
</style>