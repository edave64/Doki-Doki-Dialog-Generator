<template>
	<div id="messageConsole" :class="{ vertical }">
		<p v-if="showLoading">Loading...</p>
		<p v-for="(message, i) in messages" :key="message + '_' + i">
			{{ message }}
		</p>
	</div>
</template>

<script lang="ts">
import EventBus, {
	AssetFailureEvent,
	CustomAssetFailureEvent,
	ShowMessageEvent,
	VueErrorEvent,
} from '@/eventbus/event-bus';
import { defineComponent } from 'vue';

const shortHidingTime = 5000;
const longHidingTime = 20000;
const hideShowTimeouts = 100;

export default defineComponent({
	props: {
		loading: {
			default: false,
			type: Boolean,
		},
	},
	data: () => ({
		messages: [] as string[],
		showLoading: false,
		showLoadingTimeout: 0,
		hideLoadingTimeout: 0,
	}),
	computed: {
		vertical(): boolean {
			return this.$store.state.ui.vertical;
		},
	},
	created() {
		this.onLoadingChange(this.loading);
		EventBus.subscribe(AssetFailureEvent, ev => {
			this.messages.push(`Failed to load asset '${ev.path}'`);
			setTimeout(() => {
				this.messages.shift();
			}, shortHidingTime);
		});

		EventBus.subscribe(CustomAssetFailureEvent, ev => {
			this.messages.push(
				'Failed to load custom asset. Try to download it manually and then upload it.'
			);
			setTimeout(() => {
				this.messages.shift();
			}, longHidingTime);
		});

		EventBus.subscribe(ShowMessageEvent, ev => {
			this.messages.push(ev.message);
			setTimeout(() => {
				this.messages.shift();
			}, longHidingTime);
		});

		EventBus.subscribe(VueErrorEvent, ev => {
			this.messages.push(ev.error.name);
			this.messages.push(JSON.stringify(ev.error.stack));
			this.messages.push(ev.info);
			setTimeout(() => {
				this.messages.shift();
				this.messages.shift();
				this.messages.shift();
			}, longHidingTime);
		});
	},

	methods: {
		onLoadingChange(newValue: boolean) {
			if (newValue) {
				if (this.hideLoadingTimeout) {
					clearTimeout(this.hideLoadingTimeout);
					this.hideLoadingTimeout = 0;
				}
				if (!this.showLoading && !this.showLoadingTimeout) {
					this.showLoadingTimeout = setTimeout(() => {
						this.showLoading = true;
						this.showLoadingTimeout = 0;
					}, hideShowTimeouts);
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
					}, hideShowTimeouts);
				}
			}
		},
	},

	watch: {
		loading(newValue: boolean) {
			this.onLoadingChange(newValue);
		},
	},
});
</script>

<style lang="scss" scoped>
#messageConsole {
	font-family: monospace;
	text-shadow: 0px 0px 4px #ffffff;
	position: absolute;

	&.vertical {
		right: 200px;
		top: 0;
	}

	&:not(.vertical) {
		bottom: 200px;
		left: 0;
	}
}
</style>
