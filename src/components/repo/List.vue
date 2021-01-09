<template>
	<div class="list">
		<table>
			<thead>
				<tr ref="header">
					<th
						v-for="(header, idx) of [
							['name', 'Pack'],
							['characters', 'Character'],
							['kind', 'Type'],
							['authors', 'Authors'],
							['state', 'Status'],
						]"
						:key="idx"
						:tabindex="disabled ? -1 : 0"
						@click="sortBy(header[0])"
						@keydown="headerKeydownListener($event, header[0])"
					>
						<div>
							<div>{{ header[1] }}</div>
							<div v-if="sort === header[0]">{{ desc ? '▼' : '▲' }}</div>
						</div>
					</th>
				</tr>
			</thead>
			<transition-group
				name="tbody-group"
				tag="tbody"
				ref="tbody"
				:tabindex="disabled ? -1 : 0"
				@keydown="keydownHandler"
				@focus="updateFocusedItem"
			>
				<tr
					v-for="pack of list"
					:key="pack.id"
					:class="{
						'tbody-group-item': true,
						focused: focusedItem === pack.id,
					}"
					@mousedown="focusedItem = pack.id"
					@click="$emit('selected', { id: pack.id, source: 'pointer' })"
				>
					<td>{{ pack.name }}</td>
					<td>{{ pack.characters.join(', ') }}</td>
					<td>{{ pack.kind.join(', ') }}</td>
					<td>{{ pack.authors.join(', ') }}</td>
					<td>{{ translatePackState(pack.state) }}</td>
				</tr>
			</transition-group>
		</table>
	</div>
</template>

<script lang="ts">
import { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import run from '@edave64/dddg-repo-filters/dist/main';
import { PackStates, IPackWithState } from './types';
import { exhaust } from '@/util/exhaust';
import { defineComponent, PropType } from 'vue';

const pageKeyMoveBy = 10;

export default defineComponent({
	props: {
		search: { type: String, required: true },
		authors: { type: Object as PropType<IAuthors>, required: true },
		packs: { type: Object as PropType<IPackWithState[]>, required: true },
		disabled: {
			type: Boolean,
			default: false,
		},
	},
	data: () => ({
		sort: '' as keyof IPack | '',
		desc: false,
		focusedItem: '',
		wordCache: {} as { [id: string]: Set<string> },
	}),
	computed: {
		list(): IPackWithState[] {
			const filtered = this.filterList(this.packs, this.search);
			if (this.sort && filtered.length > 0) {
				const sort = this.sort as keyof IPack;
				let sortFunc: ((a: IPack, b: IPack) => number) | undefined;
				if (typeof filtered[0][sort] === 'string') {
					sortFunc = (a, b) => a.name.localeCompare(b.name);
				} else if (filtered[0][sort] instanceof Array) {
					sortFunc = (a, b) =>
						(a as any)[sort]
							.join(', ')
							.localeCompare((b as any)[sort].join(', '));
				}
				if (sortFunc) {
					if (this.desc) {
						const oldSort = sortFunc;
						sortFunc = (b, a) => oldSort(a, b);
					}
					filtered.sort(sortFunc);
				}
			}
			return filtered;
		},
		listById(): Map<string, IPack> {
			return new Map(this.packs.map(pack => [pack.id, pack]));
		},
		uniqueCharacters(): string[] {
			return Array.from(
				new Set(
					this.packs.flatMap(pack =>
						pack.characters.map(char => char.toLowerCase())
					)
				)
			);
		},
	},
	methods: {
		focus(): void {
			((this.$refs.tbody as any).$el as HTMLElement).focus();
		},
		keydownHandler(event: KeyboardEvent) {
			const indexOf = this.list.findIndex(pack => pack.id === this.focusedItem);
			console.log(indexOf);
			switch (event.key) {
				case 'Enter':
					this.$emit('selected', { id: this.focusedItem, source: 'keyboard' });
					event.stopPropagation();
					event.preventDefault();
					break;
				case 'ArrowUp':
					event.preventDefault();
					event.stopPropagation();
					if (indexOf === 0) {
						this.$emit('select-search-bar');
					} else {
						this.focusedItem = this.list[indexOf - 1].id;
					}
					break;
				case 'ArrowDown':
					event.preventDefault();
					event.stopPropagation();
					if (indexOf < this.list.length - 1) {
						this.focusedItem = this.list[indexOf + 1].id;
					}
					break;
				case 'PageUp': {
					event.preventDefault();
					event.stopPropagation();
					let newIdx = indexOf - pageKeyMoveBy;
					if (newIdx < 0) {
						newIdx = 0;
					}
					this.focusedItem = this.list[newIdx].id;
					break;
				}
				case 'PageDown': {
					event.preventDefault();
					event.stopPropagation();
					let newIdx = indexOf + pageKeyMoveBy;
					const max = this.list.length - 1;
					if (newIdx > max) {
						newIdx = max;
					}
					this.focusedItem = this.list[newIdx].id;
					break;
				}
			}
		},
		headerKeydownListener(event: KeyboardEvent, headerId: keyof IPack) {
			switch (event.key) {
				case 'Enter':
				case ' ':
					this.sortBy(headerId);
					event.preventDefault();
					event.stopPropagation();
					break;
				case 'ArrowDown':
					this.focus();
					event.stopPropagation();
					event.preventDefault();
					break;
				case 'ArrowUp':
					this.$emit('select-search-bar');
					event.stopPropagation();
					event.preventDefault();
					break;
			}
		},
		updateFocusedItem() {
			if (this.list.length === 0) {
				this.focusedItem = '';
				return;
			}
			if (this.focusedItem === '') {
				this.focusedItem = this.list[0].id;
			}

			this.$nextTick(() => {
				const header = this.$refs.header as HTMLElement;
				const element = document.querySelector(
					'.list tbody .focused'
				) as HTMLDivElement;

				const containerHeight =
					(this.$el as HTMLElement).offsetHeight - header.offsetHeight;
				const scrollTop = this.$el.scrollTop;
				const scrollBottom = scrollTop + containerHeight;

				if (element) {
					const itemTop = element.offsetTop - header.offsetHeight;
					const itemBottom = itemTop + element.offsetHeight;

					if (itemBottom > scrollBottom) {
						this.$el.scrollTop = itemBottom - containerHeight;
					} else if (itemTop < scrollTop) {
						this.$el.scrollTop = itemTop;
					}
				}
			});
		},
		sortBy(by: keyof IPack) {
			if (this.sort === by) {
				if (!this.desc) {
					this.desc = true;
				} else {
					this.sort = '';
					this.desc = false;
				}
			} else {
				this.sort = by;
				this.desc = false;
			}
		},
		filterList(list: IPackWithState[], search: string): IPackWithState[] {
			if (!search) return [...list];
			return run(search, this.authors, list) as IPackWithState[];
		},
		translatePackState(state: PackStates) {
			switch (state) {
				case PackStates.Unknown:
					return 'Not added';
				case PackStates.Installed:
					return 'Installed';
				case PackStates.Active:
					return 'Active';
				default:
					exhaust(state);
			}
		},
	},
	watch: {
		focusedItem() {
			this.updateFocusedItem();
		},
	},
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.list {
	width: 100%;
	height: calc(100% - 64px);
	overflow: auto;
	display: flex;
	flex-direction: column;
}

.tbody-group-item {
	opacity: 1;
	transition: all 0.15s;
}
.tbody-group-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
	opacity: 0;
}

.spacer {
	flex-grow: 1;
}
table {
	text-align: left;
	border-collapse: collapse;
	min-width: 100%;
	user-select: none;
	color: $default-text;
	color: var(--text);
	.focused {
		background: $default-accent-background;
		background: var(--accent-background);
	}
}
tbody:focus {
	outline: 0;
	.focused {
		background: $default-border;
		background: var(--border);
	}
}
tr:hover,
th:hover {
	background: $default-accent-background;
	background: var(--accent-background);
	cursor: pointer;
}
th,
td {
	padding: 0.25rem;
	min-height: 42px;
}
th {
	background: $default-native-background;
	background: var(--native-background);
	position: sticky;
	top: 0;
	color: $default-text;
	color: var(--text);
	box-shadow: 0 2px 2px -1px $default-text;
	box-shadow: 0 2px 2px -1px var(--text);

	> div {
		display: flex;
		justify-content: space-between;
	}
}
footer {
	padding-top: 8px;
	color: #444;
}
</style>
