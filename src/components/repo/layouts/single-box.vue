<template>
	<div class="pages" @keydown="keydownHandler">
		<div
			class="page fly-left"
			:class="{ blured: selected }"
			v-if="!selected"
		>
			<search-bar
				class="search-bar"
				ref="searchBar"
				v-model="search"
				:disabled="!!selected"
				@focus-list="focusListHandler"
				@leave="emit('leave')"
			/>
			<pack-list
				class="list"
				ref="list"
				:search="search"
				:repo="repo"
				:disabled="!!selected"
				v-if="!isRepoUrl"
				@selected="onSelect"
				@select-search-bar="searchBar.focus()"
			/>
			<div class="ask-download" v-else>
				Do you want to download the pack from '{{ search }}'?
				<button @click="add_repo_pack">Add package</button>
			</div>
		</div>
		<div class="page fly-right" v-else>
			<pack-display
				ref="dialog"
				class="pack-display"
				:repo="repo"
				:selected="selected!"
				show-back
				@leave="leavePackDisplay"
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import eventBus, { VueErrorEvent } from '@/eventbus/event-bus';
import { type Pack, Repo } from '@/models/repo';
import { safeAsync } from '@/util/errors';
import type { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import type { DeepReadonly } from 'ts-essentials';
import { computed, nextTick, onActivated, onMounted, ref } from 'vue';
import PackDisplay from '../pack-display.vue';
import PackList from '../pack-list.vue';
import SearchBar from '../search-bar.vue';
import type { SelectedEvent } from '../types';

const emit = defineEmits<{ leave: [] }>();
const searchBar = ref(null! as typeof SearchBar);
const list = ref(null! as typeof PackList);
const dialog = ref(null! as typeof PackDisplay);

const search = ref('');
const packs = ref([] as DeepReadonly<Pack[]>);
const authors = ref({} as IAuthors);
const repo = ref(null as null | Repo);
const selected = ref(null as string | null);

const isRepoUrl = computed(() => {
	return (
		search.value.endsWith('.json') &&
		(search.value.startsWith('http://') ||
			search.value.startsWith('https://'))
	);
});

function setSearch(str: string): void {
	selected.value = null;
	search.value = str;
}
defineExpose({ setSearch });

function leavePackDisplay(moveFocus: boolean) {
	selected.value = null;
	if (moveFocus) {
		focusSearchBar();
	}
}

function keydownHandler(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		selected.value = '';
		nextTick(() => {
			searchBar.value.focus();
		});
	}
}

function onSelect({ id, source }: SelectedEvent) {
	selected.value = id;
	if (source === 'keyboard') {
		nextTick(() => {
			dialog.value.focus();
		});
	}
}

function focusListHandler() {
	nextTick(() => {
		if (list.value) {
			list.value.focus();
		}
	});
}

function focusSearchBar() {
	nextTick(() => {
		if (searchBar.value) {
			searchBar.value.focus();
		}
	});
}

async function add_repo_pack() {
	try {
		const repo = await Repo.getInstance();
		const packId = await repo.loadTempPack(search.value);
		search.value = '';
		if (packId != null) {
			selected.value = packId;
		}
	} catch (e) {
		eventBus.fire(
			new VueErrorEvent(e as Error, 'Error while loading external pack')
		);
		console.error(e);
	}
}

onActivated(focusSearchBar);
onMounted(focusSearchBar);

safeAsync('Initializing repo list', async () => {
	const repo_ = await Repo.getInstance();
	repo.value = repo_;
	packs.value = repo_.getPacks();
	authors.value = repo_.getAuthors();
});
</script>

<style lang="scss" scoped>
.list {
	z-index: 0;
}

.search-bar {
	z-index: 1;
}

.pages,
.page {
	height: 100%;
	width: 100%;
}

.ask-download {
	color: var(--text);
	display: flex;
	justify-content: center;
	align-items: center;
	height: calc(100% - 58px);
	padding: 8px;
	text-align: center;
	flex-direction: column;
}

.fly-right.fly-enter {
	transform: translate(0, 0);
}

.fly-right.fly-enter-active {
	transition: transform 1s;
	transform: translate(-100%, 0);
}

.fly-right.fly-leave {
	transform: translate(0, 0);
}

.fly-right.fly-leave-active {
	transition: transform 20s;
	transform: translate(-100%, 0);
}

.fly-left.fly-enter {
	transform: translate(0, 0);
}

.fly-left.fly-enter-active {
	transition: transform 1s;
	transform: translate(100%, 0);
}

.fly-left.fly-leave {
	transform: translate(0, 0);
}

.fly-left.fly-leave-active {
	transition: transform 20s;
	transform: translate(100%, 0);
}
</style>
