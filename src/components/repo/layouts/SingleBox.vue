<template>
	<div class="pages" @keydown="keydownHandler">
		<div class="page fly-left" :class="{ blured: selected }" v-if="!selected">
			<search-bar
				class="search-bar"
				ref="searchBar"
				v-model="search"
				:disabled="!!selected"
				@focus-list="focusListHandler"
				@leave="$emit('leave')"
			/>
			<list
				class="list"
				ref="list"
				:search="search"
				:repo="repo"
				:disabled="!!selected"
				v-if="!isRepoUrl"
				@selected="onSelect"
				@select-search-bar="$refs.searchBar.focus()"
			/>
			<div class="ask-download">
				Do you want to download the pack from '{{ search }}'?
				<button @click="add_repo_pack">Add package</button>
			</div>
		</div>
		<div class="page fly-right" v-if="selected">
			<pack-display
				ref="dialog"
				class="pack-display"
				:repo="repo"
				:selected="selected"
				show-back
				@leave="leavePackDisplay"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import SearchBar from '../SearchBar.vue';
import List from '../List.vue';
import { SelectedEvent } from '../types';
import PackDisplay from '../PackDisplay.vue';
import { defineComponent } from 'vue';
import { Pack, Repo } from '@/models/repo';
import { DeepReadonly } from 'ts-essentials';
import Button from '@/components/toolbox/tools/background/button.vue';
import eventBus, { VueErrorEvent } from '@/eventbus/event-bus';

export default defineComponent({
	components: {
		SearchBar,
		List,
		PackDisplay,
		Button,
	},
	data: () => ({
		search: '',
		packs: [] as DeepReadonly<Pack[]>,
		authors: {} as IAuthors,
		repo: null as null | Repo,
		selected: null as string | null,
	}),
	computed: {
		isRepoUrl() {
			return (
				this.search.endsWith('.json') &&
				(this.search.startsWith('http://') ||
					this.search.startsWith('https://'))
			);
		},
	},
	methods: {
		focus(): void {},
		setSearch(str: string): void {
			this.selected = null;
			this.search = str;
		},
		leavePackDisplay(moveFocus: boolean) {
			this.selected = null;
			if (moveFocus) {
				this.$nextTick(() => {
					(this.$refs.searchBar as any).focus();
				});
			}
		},
		keydownHandler(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				this.selected = '';
				this.$nextTick(() => {
					(this.$refs.searchBar as any).focus();
				});
			}
		},
		onSelect({ id, source }: SelectedEvent) {
			this.selected = id;
			if (source === 'keyboard') {
				this.$nextTick(() => {
					const dialog = this.$refs.dialog as any;
					dialog.focus();
				});
			}
		},
		focusListHandler() {
			(this.$refs.list as any).focus();
		},
		async add_repo_pack() {
			try {
				const repo = await Repo.getInstance();
				const packId = await repo.loadTempPack(this.search);
				this.search = '';
				if (packId) {
					this.selected = packId;
				}
			} catch (e) {
				eventBus.fire(
					new VueErrorEvent(e as Error, 'Error while loading external pack')
				);
			}
		},
	},
	async created() {
		const repo = await Repo.getInstance();
		this.repo = repo;
		this.packs = repo.getPacks();
		this.authors = repo.getAuthors();
	},
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
	//noinspection CssOverwrittenProperties
	color: $default-text;
	//noinspection CssOverwrittenProperties
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
