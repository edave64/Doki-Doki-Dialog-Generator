<!--
	A transparent overlay over the preview render, displaying important messages to the player, such as network errors while loading assets.
-->
<template>
	<div id="messageConsole" :class="{ vertical }">
		<p v-if="showLoading">Loading...</p>
		<p v-for="(message, i) in messages" :key="message + '_' + i">
			{{ message }}
		</p>
		<p
			v-for="(error, i) in resolvableErrors"
			class="error"
			:key="'resolvableError_' + i"
		>
			{{ error.message }}
			<a
				href="#"
				v-for="action in error.actions"
				:key="'resolvableError_' + i + action.name"
				@click="resolvableAction(i, action.name)"
				>[{{ action.name }}]</a
			>
		</p>
		<p v-for="(error, i) in errors" class="error" :key="'error_' + i">
			{{ error }} <a href="#" @click="dismissError(i)">[Dismiss]</a>
		</p>
	</div>
</template>

<script lang="ts">
import EventBus, {
	AssetFailureEvent,
	CustomAssetFailureEvent,
	FailureEvent,
	ResolvableErrorEvent,
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
		errors: [] as string[],
		resolvableErrors: [] as ResolvableErrorEvent[],
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
		EventBus.subscribe(AssetFailureEvent, (ev) => {
			this.messages.push(`Failed to load asset '${ev.path}'`);
			setTimeout(() => {
				this.messages.shift();
			}, shortHidingTime);
		});

		EventBus.subscribe(CustomAssetFailureEvent, (_ev) => {
			this.messages.push(
				'Failed to load custom asset. Try to download it manually and then upload it.'
			);
			setTimeout(() => {
				this.messages.shift();
			}, longHidingTime);
		});

		EventBus.subscribe(FailureEvent, (ev) => {
			this.errors.push(ev.message);
		});

		EventBus.subscribe(ResolvableErrorEvent, (ev) => {
			this.resolvableErrors.push(ev);
		});

		EventBus.subscribe(ShowMessageEvent, (ev) => {
			this.messages.push(ev.message);
			setTimeout(() => {
				this.messages.shift();
			}, longHidingTime);
		});

		EventBus.subscribe(VueErrorEvent, (ev) => {
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
		dismissError(i: number) {
			this.errors.splice(i, 1);
		},
		async resolvableAction(i: number, actionName: string) {
			const error = this.resolvableErrors[i];
			this.resolvableErrors.splice(i, 1);
			const action = error.actions.find((a) => a.name === actionName)!;
			await action.exec();
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
	color: #000;
	text-shadow: 0 0 4px #ffffff;
	position: absolute;

	&.vertical {
		right: 200px;
		top: 0;
	}

	&:not(.vertical) {
		bottom: 200px;
		left: 0;
	}

	p {
		color: #000;
		word-break: normal;
	}

	.error {
		color: #660000;
		font-weight: bolder;

		a {
			user-select: none;
		}
	}
}
</style>
