<template>
	<div id="g_opt" class="gui" :style="{ float: girl.pos > 4 ? 'left' : 'right' }">
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
		<br />
		<fieldset>
			<legend>Position:</legend>
			<button @click="girl.pos=Math.max(1, girl.pos-1);$emit('invalidate-render')">&lt; left</button>
			<button @click="girl.pos=Math.min(7, girl.pos+1);$emit('invalidate-render')">&gt; right</button>
		</fieldset>
		<br />
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
		<br />
		<toggle v-model="girl.infront" @input="$emit('invalidate-render')" label="In front of textbox?" />
		<toggle v-model="girl.close" @input="$emit('invalidate-render')" label="Close up?" />

		<br />
		<br />
		<br />
		<button @click="$emit('shiftLayer', {girl: girl, move: 'Delete'});$emit('close')">Delete</button>
		<br />
		<br />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Toggle from './Toggle.vue';
import { Girl } from '../models/girl';

@Component({
	components: {
		Toggle,
	},
})
export default class DokiSettings extends Vue {
	@Prop({ type: Girl, required: true }) private girl!: Girl;
}

export interface MoveGirl {
	girl: Girl;
	move: 'Forward' | 'Backward' | 'Back' | 'Front' | 'Delete';
}
</script>

<style lang="scss">
#g_opt {
	border: 3px solid #ffbde1;
	background-color: #ffe6f4;
	padding: 1em;
	width: 15em;
	height: calc(39.375vw - 12em);
	overflow: auto;
	z-index: 16000;
	position: relative;
	top: 0;
	left: 0;

	> h1 {
		color: white;
		font-family: riffic;
		text-shadow: 0 0 7px black;
		text-align: center;
		margin-bottom: 2em;
	}
}

#layerfs > button {
	width: 1.2em;
	padding: 0;
	text-align: center;
}

#layerfs > button::-moz-focus-inner {
	padding: 0;
	border: 0;
}
</style>
