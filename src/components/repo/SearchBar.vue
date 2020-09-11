<template>
	<div class="search-area">
		<div class="search-bar">
			<input
				class="input"
				ref="input"
				v-model="message"
				:disabled="disabled"
				@input="onUpdate"
				@click="$event.dontCloseHelp = true"
				@keydown="keydownHandler"
			/>
			<button
				:class="{ help: true, toggled: showHelp }"
				:disabled="disabled"
				@click.stop="
					showHelp = !showHelp;
					$event.dontCloseHelp = true;
				"
			>
				<i class="material-icons">info</i>
			</button>
			<button class="exit-button" @click="$emit('leave', true)">
				<i class="material-icons">clear</i>
			</button>
		</div>
		<div class="info-area" v-if="showHelp" @click="$event.dontCloseHelp = true">
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

<script lang="ts">
import { defineComponent } from 'vue';

const debounce = 250;

export default defineComponent({
	props: {
		disabled: {
			type: Boolean,
			default: false,
		},
		modelValue: {
			type: String,
			default: '',
		},
	},
	data: () => ({
		showHelp: false,
		message: '',
		debounceTimeout: null as number | null,
		lastSend: '',
	}),
	methods: {
		focus() {
			(this.$refs.input as HTMLElement).focus();
		},
		documentClickHandler(event: MouseEvent & { dontCloseHelp?: boolean }) {
			if (event.dontCloseHelp) return;
			this.showHelp = false;
		},
		keydownHandler(event: KeyboardEvent) {
			if (event.key === 'ArrowDown') {
				this.$emit('focus-list');
				event.preventDefault();
				event.stopPropagation();
			}
		},
		updateInternalValue() {
			if (this.lastSend === this.modelValue) {
				this.lastSend = '';
				return;
			}
			this.message = this.modelValue;
		},
		onUpdate() {
			if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
			this.debounceTimeout = setTimeout(this.doUpdate, debounce);
		},
		doUpdate() {
			if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
			this.debounceTimeout = null;
			const div = document.createElement('div');
			div.innerHTML = this.message;
			this.lastSend = div.innerText;
			this.$emit('update:modelValue', div.innerText);
		},
	},
	mounted() {
		document.body.addEventListener('click', this.documentClickHandler);
		this.updateInternalValue();
	},
	unmounted() {
		document.body.removeEventListener('click', this.documentClickHandler);
	},
	watch: {
		modelValue() {
			this.updateInternalValue();
		},
	},
});
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
	border: 2px solid #ffbde1;
	background: #fff;
	max-height: calc(100vh - 56px);
	overflow: auto;
	box-shadow: 0px 2px 4px 4px rgba(255, 189, 225, 1);

	code {
		padding: 2px;
		background: #ffe6f4;
		font-family: monospace;
		white-space: nowrap;
	}
}

.help {
	height: 42px;
	width: 40px;
	border: 2px solid #ffbde1;
	border-left: 0;

	&.toggled {
		background-color: #ffbde1;
	}
}

.input {
	display: block;
	width: calc(100% - 40px);
	border: 2px solid #ffbde1;
	padding: 8px;
	height: 42px;
	overflow: hidden;
	white-space: nowrap;
	background: #ffe6f4 url(./search.svg);
	background-repeat: no-repeat;
	background-size: contain;
	background-position: right center;
	padding-right: 64px;
}

.suggestions {
	border: 2px black solid;
	border-top: 0;
	background: white;

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
