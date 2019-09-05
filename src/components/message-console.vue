<template>
	<div class="messageConsole">
		<p v-if="showLoading">Loading...</p>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import EventBus, { AssetFailureEvent } from '../event-bus';

@Component({
	components: {},
})
export default class DokiButton extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly loading!: boolean;

	private showLoading: boolean = false;
	private showLoadingTimeout: number = 0;
	private hideLoadingTimeout: number = 0;

	private created() {
		this.onLoadingChange(this.loading);
	}

	@Watch('loading')
	private onLoadingChange(newValue: boolean) {
		console.log('onLoadingChange', newValue);
		if (newValue) {
			debugger;
			if (this.hideLoadingTimeout) {
				clearTimeout(this.hideLoadingTimeout);
				this.hideLoadingTimeout = 0;
			}
			if (!this.showLoading && !this.showLoadingTimeout) {
				console.log('setting show Timeout');
				this.showLoadingTimeout = setTimeout(() => {
					this.showLoading = true;
					console.log('showingLoading');
					this.showLoadingTimeout = 0;
				}, 100);
			}
		} else {
			if (this.showLoadingTimeout) {
				clearTimeout(this.showLoadingTimeout);
				this.showLoadingTimeout = 0;
			}
			if (this.showLoading && !this.hideLoadingTimeout) {
				console.log('setting hide Timeout');
				this.hideLoadingTimeout = setTimeout(() => {
					this.showLoading = false;
					console.log('hideLoading');
					this.hideLoadingTimeout = 0;
				}, 100);
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.messageConsole {
	font-family: monospace;
	text-shadow: 0px 0px 4px #ffffff;
}
</style>