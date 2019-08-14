<template>
	<div id="ip">All assets used are IP of Team Salvato</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class Ip extends Vue {}
</script>

<style scoped>
#ip {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	font-size: 70%;
	font-family: monospace;
	text-align: center;
}
</style>