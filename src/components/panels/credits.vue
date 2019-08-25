<template>
	<div :class="{ panel: true, vertical }">
		<h1>Credits</h1>
		<p>All assets used are IP of Team Salvato</p>
		<p>Doki Doki Dialog Generator developed by EDave64</p>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({
	components: {},
})
export default class AddPanel extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;
}
</script>

<style lang="scss" scoped>
</style>