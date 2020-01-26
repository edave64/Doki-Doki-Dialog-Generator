<template>
	<div class="panel">
		<h1>Panels</h1>
		<p>To be implemented</p>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IRootState } from '../../../store';
import { PanelMixin } from './panelMixin';

@Component({
	components: {},
})
export default class PanelsPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;
}
</script>

<style lang="scss" scoped>
</style>
