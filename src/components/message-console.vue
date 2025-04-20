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

<script lang="ts" setup>
import EventBus, {
	AssetFailureEvent,
	CustomAssetFailureEvent,
	FailureEvent,
	ResolvableErrorEvent,
	ShowMessageEvent,
	VueErrorEvent,
} from '@/eventbus/event-bus';
import { useStore } from '@/store';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
	loading?: boolean;
}>();

const shortHidingTime = 5000;
const longHidingTime = 20000;
const hideShowTimeouts = 100;

const store = useStore();
const messages = ref([] as string[]);
const errors = ref([] as string[]);
const resolvableErrors = ref([] as ResolvableErrorEvent[]);
const showLoading = ref(false);
const showLoadingTimeout = ref(0);
const hideLoadingTimeout = ref(0);

const vertical = computed(() => store.state.ui.vertical);

onLoadingChange(props.loading);
EventBus.subscribe(AssetFailureEvent, (ev) => {
	messages.value.push(`Failed to load asset '${ev.path}'`);
	setTimeout(() => {
		messages.value.shift();
	}, shortHidingTime);
});

EventBus.subscribe(CustomAssetFailureEvent, () => {
	messages.value.push(
		'Failed to load custom asset. Try to download it manually and then upload it.'
	);
	setTimeout(() => {
		messages.value.shift();
	}, longHidingTime);
});

EventBus.subscribe(FailureEvent, (ev) => {
	errors.value.push(ev.message);
});

EventBus.subscribe(ResolvableErrorEvent, (ev) => {
	resolvableErrors.value.push(ev);
});

EventBus.subscribe(ShowMessageEvent, (ev) => {
	messages.value.push(ev.message);
	setTimeout(() => {
		messages.value.shift();
	}, longHidingTime);
});

EventBus.subscribe(VueErrorEvent, (ev) => {
	messages.value.push(ev.error.name);
	messages.value.push(JSON.stringify(ev.error.stack));
	messages.value.push(ev.info);
	setTimeout(() => {
		messages.value.shift();
		messages.value.shift();
		messages.value.shift();
	}, longHidingTime);
});

function onLoadingChange(newValue: boolean) {
	if (newValue) {
		if (hideLoadingTimeout.value) {
			clearTimeout(hideLoadingTimeout.value);
			hideLoadingTimeout.value = 0;
		}
		if (!showLoading.value && !showLoadingTimeout.value) {
			showLoadingTimeout.value = setTimeout(() => {
				showLoading.value = true;
				showLoadingTimeout.value = 0;
			}, hideShowTimeouts);
		}
	} else {
		if (showLoadingTimeout.value) {
			clearTimeout(showLoadingTimeout.value);
			showLoadingTimeout.value = 0;
		}
		if (showLoading.value && !hideLoadingTimeout.value) {
			hideLoadingTimeout.value = setTimeout(() => {
				showLoading.value = false;
				hideLoadingTimeout.value = 0;
			}, hideShowTimeouts);
		}
	}
}
function dismissError(i: number) {
	errors.value.splice(i, 1);
}
async function resolvableAction(i: number, actionName: string) {
	const error = resolvableErrors.value[i];
	resolvableErrors.value.splice(i, 1);
	const action = error.actions.find((a) => a.name === actionName)!;
	await action.exec();
}

watch(
	() => props.loading,
	(newValue: boolean) => {
		onLoadingChange(newValue);
	}
);
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
