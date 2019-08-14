<template>
	<div id="girl_sel" class="gui">
		<img ref="girl_sel" src="../assets/chibi.png" @click="onClick" />
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class DokiSelector extends Vue {
	private onClick(e: MouseEvent): void {
		const girlSel = this.$el as HTMLDivElement;
		const cx = e.clientX - girlSel.offsetLeft;
		const girl =
			cx < 123 ? 'sayori' : cx < 247 ? 'yuri' : cx < 370 ? 'monika' : 'natsuki';
		this.$emit('chosen', girl);
	}
}
</script>

<style scoped>
#girl_sel {
	position: absolute;
	top: calc(50vh - 86px);
	height: 172px;
	left: calc(50vw - 247px);
	width: 494px;
	border: 3px solid #ffbde1;
	background-color: #ffe6f4;
}
</style>