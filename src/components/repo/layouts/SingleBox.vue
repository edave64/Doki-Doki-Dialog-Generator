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
import { Component, Vue } from 'vue-property-decorator';
import { Store } from 'vuex';
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import SearchBar from '../SearchBar.vue';
import List from '../List.vue';
import { SelectedEvent, IPackWithState } from '../types';
import PackDisplay from '../PackDisplay.vue';
import { IRootState } from '@/store';

const repoUrl = 'https://edave64.github.io/Doki-Doki-Dialog-Generator-Packs/';

@Component({
	components: {
		SearchBar,
		List,
		PackDisplay,
	},
})
export default class SingleBox extends Vue {
	private search = '';
	private authors: IAuthors = {};
	private packs: IPack[] = [];
	public $store!: Store<IRootState>;

	private selected: string | null = null;

	public async created() {
		[this.packs, this.authors] = await Promise.all([
			this.fetchJSON<IPack[]>(repoUrl + 'repo.json'),
			this.fetchJSON<IAuthors>(repoUrl + 'people.json'),
		]);
	}

	public focus(): void {}
	public setSearch(str: string): void {
		this.selected = null;
		this.search = str;
	}

	private async fetchJSON<A>(path: string): Promise<A> {
		const req = await fetch(path);
		return await req.json();
	}

	private leavePackDisplay(moveFocus: boolean) {
		this.selected = null;
		if (moveFocus) {
			this.$nextTick(() => {
				(this.$refs.searchBar as any).focus();
			});
		}
	}

	private keydownHandler(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			this.selected = '';
			this.$nextTick(() => {
				(this.$refs.searchBar as any).focus();
			});
		}
	}

	private onSelect({ id, source }: SelectedEvent) {
		this.selected = id;
		if (source === 'keyboard') {
			this.$nextTick(() => {
				const dialog = this.$refs.dialog as any;
				dialog.focus();
			});
		}
	}

	private focusListHandler() {
		(this.$refs.list as any).focus();
	}

	private get packsArgmented(): IPackWithState[] {
		const repoPacks = this.packs;
		const installedPacks = this.$store.state.content.contentPacks;

		const repoLookup = new Map(repoPacks.map(pack => [pack.id, pack]));
		const installedLookup = new Map(
			installedPacks.map(pack => [pack.packId, pack])
		);

		const installedRet: IPackWithState[] = installedPacks.map(pack => {
			const repoPack = repoLookup.get(pack.packId!);
			if (repoPack) {
				return {
					...repoPack,
					state: pack.state,
				} as IPackWithState;
			} else {
				return {
					state: pack.state,
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
			.filter(pack => !installedLookup.has(pack.id))
			.map(pack => {
				return {
					...pack,
					state: 'Unknown',
				} as IPackWithState;
			});

		return [
			...installedRet.filter(ret => !ret.id.startsWith('dddg.buildin.')),
			...notInstalledPacks,
		];
	}
}
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
