<template>
	<div ref="root" class="list">
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
						] as const"
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
					@click="emit('selected', { id: pack.id, source: 'pointer' })"
				>
					<td>{{ pack.name }}</td>
					<td>{{ pack.characters.join(', ') }}</td>
					<td>{{ pack.kind.join(', ') }}</td>
					<td>{{ pack.authors.join(', ') }}</td>
					<td>{{ translatePackState(pack) }}</td>
				</tr>
			</transition-group>
		</table>
	</div>
</template>

<script lang="ts" setup>
import { Pack, Repo } from '@/models/repo';
import run from '@edave64/dddg-repo-filters/dist/main';
import { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import { DeepReadonly } from 'ts-essentials';
import {
	ComponentPublicInstance,
	computed,
	nextTick,
	PropType,
	ref,
	watch,
} from 'vue';
import { IPackWithState } from '@/components/repo/types';

const pageKeyMoveBy = 10;
const props = defineProps({
	search: { type: String, required: true },
	repo: {
		type: Object as PropType<Repo | null>,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
});
const emit = defineEmits(['selected', 'select-search-bar']);
const root = ref(null! as HTMLDivElement);
const tbody = ref(null! as ComponentPublicInstance);
const header = ref(null! as HTMLTableRowElement);
const sort = ref('' as keyof IPackWithState | '');
const desc = ref(false);
const focusedItem = ref('');

const packs = computed(() => {
	if (!props.repo) return [];
	return props.repo.getPacks();
});

const list = computed((): DeepReadonly<Pack[]> => {
	const filtered = filterList(packs.value, props.search);
	if (sort.value && filtered.length > 0) {
		const sort_ = sort.value as keyof IPack;
		let sortFunc:
			| ((a: DeepReadonly<IPack>, b: DeepReadonly<IPack>) => number)
			| undefined;
		if (typeof filtered[0][sort_] === 'string') {
			sortFunc = (a, b) => a.name.localeCompare(b.name);
		} else if (filtered[0][sort_] instanceof Array) {
			sortFunc = (a, b) =>
				(a as any)[sort_]
					.join(', ')
					.localeCompare((b as any)[sort_].join(', '));
		}
		if (sortFunc) {
			if (desc.value) {
				const oldSort = sortFunc;
				sortFunc = (b, a) => oldSort(a, b);
			}
			filtered.sort(sortFunc);
		}
	}
	return filtered;
});

function focus(): void {
	tbody.value.$el.focus();
}

function keydownHandler(event: KeyboardEvent) {
	const indexOf = list.value.findIndex((pack) => pack.id === focusedItem.value);
	switch (event.key) {
		case 'Enter':
			emit('selected', { id: focusedItem.value, source: 'keyboard' });
			event.stopPropagation();
			event.preventDefault();
			break;
		case 'ArrowUp':
			event.preventDefault();
			event.stopPropagation();
			if (indexOf === 0) {
				emit('select-search-bar');
			} else {
				focusedItem.value = list.value[indexOf - 1].id;
			}
			break;
		case 'ArrowDown':
			event.preventDefault();
			event.stopPropagation();
			if (indexOf < list.value.length - 1) {
				focusedItem.value = list.value[indexOf + 1].id;
			}
			break;
		case 'PageUp': {
			event.preventDefault();
			event.stopPropagation();
			let newIdx = indexOf - pageKeyMoveBy;
			if (newIdx < 0) {
				newIdx = 0;
			}
			focusedItem.value = list.value[newIdx].id;
			break;
		}
		case 'PageDown': {
			event.preventDefault();
			event.stopPropagation();
			let newIdx = indexOf + pageKeyMoveBy;
			const max = list.value.length - 1;
			if (newIdx > max) {
				newIdx = max;
			}
			focusedItem.value = list.value[newIdx].id;
			break;
		}
	}
}

function headerKeydownListener(
	event: KeyboardEvent,
	headerId: keyof IPackWithState
) {
	switch (event.key) {
		case 'Enter':
		case ' ':
			sortBy(headerId);
			event.preventDefault();
			event.stopPropagation();
			break;
		case 'ArrowDown':
			focus();
			event.stopPropagation();
			event.preventDefault();
			break;
		case 'ArrowUp':
			emit('select-search-bar');
			event.stopPropagation();
			event.preventDefault();
			break;
	}
}

function updateFocusedItem() {
	if (list.value.length === 0) {
		focusedItem.value = '';
		return;
	}
	if (focusedItem.value === '') {
		focusedItem.value = list.value[0].id;
	}

	nextTick(() => {
		const element = document.querySelector('.list tbody .focused') as
			| HTMLDivElement
			| undefined;

		const containerHeight = root.value.offsetHeight - header.value.offsetHeight;
		const scrollTop = root.value.scrollTop;
		const scrollBottom = scrollTop + containerHeight;

		if (element) {
			const itemTop = element.offsetTop - header.value.offsetHeight;
			const itemBottom = itemTop + element.offsetHeight;

			if (itemBottom > scrollBottom) {
				root.value.scrollTop = itemBottom - containerHeight;
			} else if (itemTop < scrollTop) {
				root.value.scrollTop = itemTop;
			}
		}
	});
}

function sortBy(by: keyof IPackWithState) {
	if (sort.value === by) {
		if (!desc.value) {
			desc.value = true;
		} else {
			sort.value = '';
			desc.value = false;
		}
	} else {
		sort.value = by;
		desc.value = false;
	}
}

function filterList(list: DeepReadonly<Array<Pack>>, search: string) {
	if (!search) return [...list];
	return run(
		search,
		props.repo ? props.repo!.getAuthors() : {},
		list as any
	) as Pack[];
}

function translatePackState(state: DeepReadonly<Pack>) {
	if (state.loaded) return 'Active';
	if (state.installed) return 'Installed';
	return '';
}

watch(() => focusedItem.value, updateFocusedItem);
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
	//noinspection CssOverwrittenProperties
	color: $default-text;
	//noinspection CssOverwrittenProperties
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
	//noinspection CssOverwrittenProperties
	color: $default-text;
	//noinspection CssOverwrittenProperties
	color: var(--text);
	//noinspection CssOverwrittenProperties
	box-shadow: 0 2px 2px -1px $default-text;
	//noinspection CssOverwrittenProperties
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
