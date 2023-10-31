<template>
	<div class="search-area">
		<div class="search-bar">
			<input
				class="input"
				ref="input"
				v-model="message"
				:disabled="disabled"
				@input="onUpdate"
				@click.stop
				@keydown="keydownHandler"
			/>
			<button
				:class="{ help: true, toggled: showHelp }"
				:disabled="disabled"
				@click.stop="showHelp = !showHelp"
			>
				<i class="material-icons">info</i>
			</button>
			<button class="exit-button" @click="emit('leave', true)">
				<i class="material-icons">clear</i>
			</button>
		</div>
		<div class="info-area" v-if="showHelp" @click.stop>
			<p>Enter the text you want to search for. E.g. <code>Monika</code></p>
			<p>
				If multiple words are given, each word must be found. E.g.
				<code>Monika Pose</code>
			</p>
			<p>
				To search phrases with spaces, surround them with double quotes. E.g.
				<code>"Monika R63" Pose</code>
			</p>
			<p>
				To limit your search to specific attributes of a pack, you can use the
				following prefixes:
			</p>
			<table>
				<tr>
					<th>Prefix</th>
					<th>Description</th>
					<th>Example</th>
				</tr>
				<tr>
					<td>Character:</td>
					<td></td>
					<td><code>Character: Monika</code></td>
				</tr>
				<tr>
					<td>Artist:</td>
					<td></td>
					<td><code>Artist: edave64</code></td>
				</tr>
				<tr>
					<td>Type:</td>
					<td>
						<code>Backgrounds</code>, <code>Sprites</code>,
						<code>Expressions</code>, <code>Styles</code>, <code>Poses</code> or
						<code>Characters</code>
					</td>
					<td><code>Type: Poses</code></td>
				</tr>
				<tr>
					<td>Engine:</td>
					<td>
						<code>Doki Doki Dialog Generator</code>, <code>DDDG</code> or
						<code>Doki Doki Comic Club</code>, <code>DDCC</code>
					</td>
					<td><code>Engine: DDCC</code></td>
				</tr>
				<tr>
					<td>Pack:</td>
					<td>The pack itself must contain the text</td>
					<td><code>Pack: Angry</code></td>
				</tr>
			</table>

			<p>
				Prefixes can be shorted, so <code>Character: Monika</code> can be
				shortend to <code>C: Monika</code>
			</p>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';

const debounce = 250;
const props = defineProps({
	disabled: {
		type: Boolean,
		default: false,
	},
	modelValue: {
		type: String,
		default: '',
	},
});
const emit = defineEmits(['leave', 'focus-list', 'update:modelValue']);
const input = ref(null! as HTMLInputElement);

const message = ref('');
const debounceTimeout = ref(null as number | null);
const lastSend = ref('');

function focus() {
	const ele = input.value;
	if (ele) {
		ele.focus();
	}
}
defineExpose({ focus });

function keydownHandler(event: KeyboardEvent) {
	if (event.key === 'ArrowDown') {
		emit('focus-list');
		event.preventDefault();
		event.stopPropagation();
	}
}

function updateInternalValue() {
	if (lastSend.value === props.modelValue) {
		lastSend.value = '';
		return;
	}
	message.value = props.modelValue;
}

function onUpdate() {
	if (debounceTimeout.value != null) clearTimeout(debounceTimeout.value);
	debounceTimeout.value = setTimeout(doUpdate, debounce);
}

function doUpdate() {
	if (debounceTimeout.value != null) clearTimeout(debounceTimeout.value);
	debounceTimeout.value = null;
	const div = document.createElement('div');
	div.innerHTML = message.value;
	lastSend.value = div.innerText;
	emit('update:modelValue', div.innerText);
}

watch(() => props.modelValue, updateInternalValue, { immediate: true });
//#region Help Popup
const showHelp = ref(false);
function documentClickHandler(event: MouseEvent) {
	showHelp.value = false;
}

onMounted(() => {
	document.body.addEventListener('click', documentClickHandler);
});

onUnmounted(() => {
	document.body.removeEventListener('click', documentClickHandler);
});
//#endregion Help Popup
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
	margin: 40px 0 0;
}

ul {
	list-style-type: none;
	padding: 0;
}

li {
	display: inline-block;
	margin: 0 10px;
}

a {
	color: #42b983;
}

.exit-button {
	height: 42px;
	width: 40px;
	border-left: none;
	background-position: center center;
	background-repeat: no-repeat;
	background-size: contain;
}

.search-bar {
	margin: 4px;
	width: calc(100% - 8px);
	display: flex;
}

.info-area {
	position: absolute;
	top: 48px;
	left: 8px;
	right: 8px;
	z-index: 2;
	border: 2px solid $default-border;
	//noinspection CssOverwrittenProperties
	border: 2px solid var(--border);
	//noinspection CssOverwrittenProperties
	background-color: $default-native-background;
	//noinspection CssOverwrittenProperties
	background-color: var(--native-background);
	max-height: calc(100vh - 56px);
	overflow: auto;
	box-shadow: 0 2px 4px 4px var(--accent-background);

	code {
		padding: 2px;
		background: $default-accent-background;
		background: var(--accent-background);
		font-family: monospace;
		white-space: nowrap;
	}
}

.help {
	height: 42px;
	width: 40px;
	border: 2px solid $default-border;
	//noinspection CssOverwrittenProperties
	border: 2px solid var(--border);
	border-left: 0;

	&.toggled {
		//noinspection CssOverwrittenProperties
		background-color: $default-border;
		//noinspection CssOverwrittenProperties
		background-color: var(--border);
	}
}

.input {
	display: block;
	width: calc(100% - 40px);
	border: 2px solid $default-border;
	//noinspection CssOverwrittenProperties
	border: 2px solid var(--border);
	height: 42px;
	overflow: hidden;
	white-space: nowrap;
	background: $default-accent-background;
	//noinspection CssOverwrittenProperties
	background: var(--accent-background);
	background-repeat: no-repeat;
	background-size: contain;
	background-position: right center;
	padding: 8px 64px 8px 8px;
}

.suggestions {
	border: 2px black solid;
	border-top: 0;
	background: $default-native-background;
	background: var(--native-background);

	.suggestion {
		border: 0;
		line-height: 24px;
		padding: 4px;
	}

	.suggestion {
		border: 0;
		line-height: 24px;
		padding: 4px;
		border-radius: 4px;

		.primary {
			font-weight: bolder;
		}

		.secondary {
			color: #222;
		}

		&.active {
			background: cyan;
		}

		&:hover {
			background: lightcyan;
		}
	}
}
</style>

<style lang="scss">
body .search-area .input {
	background-image: url(./search.svg);
}
body.dark-theme .search-area .input {
	background-image: url(./search-bright.svg);
}
</style>
