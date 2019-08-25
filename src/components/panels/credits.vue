<template>
	<div :class="{ panel: true, vertical }">
		<h1>Credits</h1>All assets used are IP of Team Salvato
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