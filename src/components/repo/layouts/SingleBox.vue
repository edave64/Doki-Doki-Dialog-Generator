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
				:authors="authors"
				:packs="packsArgmented"
				:disabled="!!selected"
				@selected="onSelect"
				@select-search-bar="$refs.searchBar.focus()"
			/>
		</div>
		<div class="page fly-right" v-if="selected">
			<pack-display
				ref="dialog"
				class="pack-display"
				:authors="authors"
				:packs="packsArgmented"
				:selected="selected"
				show-back
				@leave="leavePackDisplay"
			/>
		</div>
	</div>
</template>

<script lang="ts">
/* tslint:disable:no-bitwise */
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import SearchBar from '../SearchBar.vue';
import List from '../List.vue';
import { SelectedEvent, IPackWithState, PackStates } from '../types';
import PackDisplay from '../PackDisplay.vue';
import environment from '@/environments/environment';
import { defineComponent } from 'vue';

const repoUrl = 'https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/';

export default defineComponent({
	components: {
		SearchBar,
		List,
		PackDisplay,
	},
	data: () => ({
		search: '',
		authors: {} as IAuthors,
		packs: [] as IPack[],
		localPacks: [] as IPack[],
		selected: null as string | null,
	}),
	computed: {
		packsArgmented(): IPackWithState[] {
			const loadedPacks = this.$store.state.content.contentPacks;
			const repoPacks = this.packs;

			const repoLookup = new Map(repoPacks.map(pack => [pack.id, pack]));
			const loadedLookup = new Map(
				loadedPacks.map(pack => [pack.packId, pack])
			);
			const localLookup = new Map(this.localPacks.map(pack => [pack.id, pack]));

			const installedRet: IPackWithState[] = loadedPacks.map(pack => {
				const repoPack = repoLookup.get(pack.packId!);
				const isLoaded = loadedLookup.has(pack.packId!)
					? PackStates.Active
					: PackStates.Unknown;
				const isInstalled = localLookup.has(pack.packId!)
					? PackStates.Installed
					: PackStates.Unknown;
				const state: PackStates = isLoaded | isInstalled;

				if (repoPack) {
					return {
						...repoPack,
						state,
					} as IPackWithState;
				} else {
					return {
						state,
						id: pack.packId,
						characters: [],
						name: pack.packId,
						inLocalRepo: false,
						preview: [],
						kind: [],
						description: '',
						dddg1Path: '',
						dddg2Path: '',
						searchWords: [],
						authors: [],
					} as IPackWithState;
				}
			});

			const notInstalledPacks = repoPacks
				.filter(pack => !loadedLookup.has(pack.id))
				.map(pack => {
					return {
						...pack,
						state: PackStates.Unknown,
					} as IPackWithState;
				});

			return [
				...installedRet.filter(ret => !ret.id.startsWith('dddg.buildin.')),
				...notInstalledPacks,
			];
		},
	},
	methods: {
		focus(): void {},
		setSearch(str: string): void {
			this.selected = null;
			this.search = str;
		},
		async fetchJSON<A>(path: string): Promise<A> {
			const req = await fetch(path);
			return await req.json();
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
	},
	async created() {
		let localPacksPromise: Promise<IPack[]> | [] = [];

		if (environment.supports.localRepo) {
			localPacksPromise = this.fetchJSON(environment.localRepositoryUrl);
		}

		[this.packs, this.authors, this.localPacks] = await Promise.all([
			this.fetchJSON<IPack[]>(repoUrl + 'repo.json'),
			this.fetchJSON<IAuthors>(repoUrl + 'people.json'),
			localPacksPromise,
		]);
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
