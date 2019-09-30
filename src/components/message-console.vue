<template>
	<div class="messageConsole">
		<p v-if="showLoading">Loading...</p>
		<p v-for="(message, i) in messages" :key="message + '_' + i">{{message}}</p>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import EventBus, {
	AssetFailureEvent,
	CustomAssetFailureEvent,
} from '../eventbus/event-bus';

@Component({
	components: {},
})
export default class DokiButton extends Vue {
	@Prop({ required: true, type: Boolean }) private readonly loading!: boolean;

	private showLoading: boolean = false;
	private showLoadingTimeout: number = 0;
	private hideLoadingTimeout: number = 0;

	public messages: string[] = [];

	private created() {
		this.onLoadingChange(this.loading);
		EventBus.subscribe(AssetFailureEvent, ev => {
			this.messages.push(`Failed to load asset '${ev.path}'`);
			setTimeout(() => {
				this.messages.pop();
			}, 5000);
		});

		EventBus.subscribe(CustomAssetFailureEvent, ev => {
			this.messages.push(
				`Failed to load custom asset. Try to download it manually and then upload it.`
			);
			setTimeout(() => {
				this.messages.pop();
			}, 50000);
		});
	}

	@Watch('loading')
	private onLoadingChange(newValue: boolean) {
		if (newValue) {
			if (this.hideLoadingTimeout) {
				clearTimeout(this.hideLoadingTimeout);
				this.hideLoadingTimeout = 0;
			}
			if (!this.showLoading && !this.showLoadingTimeout) {
				this.showLoadingTimeout = setTimeout(() => {
					this.showLoading = true;
					this.showLoadingTimeout = 0;
				}, 100);
			}
		} else {
			if (this.showLoadingTimeout) {
				clearTimeout(this.showLoadingTimeout);
				this.showLoadingTimeout = 0;
			}
			if (this.showLoading && !this.hideLoadingTimeout) {
				this.hideLoadingTimeout = setTimeout(() => {
					this.showLoading = false;
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