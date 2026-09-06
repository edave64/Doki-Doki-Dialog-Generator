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
							<div v-if="sort === header[0]">
								{{ desc ? '▼' : '▲' }}
							</div>
						</div>
					</th>
				</tr>
			</thead>
			<transition-group
				name="tbody-group"
				key="list-transition"
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
					@click="
						emit('selected', { id: pack.id, source: 'pointer' })
					"
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
import { type IPackWithState, PackStates } from '@/components/repo/types';
import { type Pack, Repo } from '@/models/repo';
import { state } from '@/store/root';
import run from '@edave64/dddg-repo-filters/dist/main';
import {
	type ComponentPublicInstance,
	computed,
	type DeepReadonly,
	nextTick,
	ref,
	watch,
} from 'vue';

const props = withDefaults(
	defineProps<{
		search: string;
		repo: DeepReadonly<Repo> | null;
		disabled?: boolean;
	}>(),
	{ disabled: false }
);
const emit = defineEmits<{
	selected: [{ id: string; source: 'pointer' | 'keyboard' }];
	'select-search-bar': [];
}>();

const pageKeyMoveBy = 10;
const root = ref(null! as HTMLDivElement);
const tbody = ref(null! as ComponentPublicInstance);
const header = ref(null! as HTMLTableRowElement);
const sort = ref('' as keyof IPackWithState | '');
const desc = ref(false);
const focusedItem = ref('');

const packs = computed<DeepReadonly<IPackWithState[]>>(() => {
	if (!props.repo) return [];
	return props.repo.getPacks().map((x) => ({
		...x,
		state: loadedPacks.has(x.id)
			? PackStates.Active
			: x.installed
				? PackStates.Installed
				: PackStates.Unknown,
	}));
});

const loadedPacks = state.content.loadedContentPacks;

const list = computed((): DeepReadonly<IPackWithState[]> => {
	// Push loaded packs to the top
	const presorted = [...packs.value].sort((a, b) => b.state - a.state);
	const filtered = filterList(presorted, props.search);
	if (sort.value && filtered.length > 0) {
		const sort_ = sort.value as keyof IPackWithState;
		let sortFunc:
			| ((
					a: DeepReadonly<IPackWithState>,
					b: DeepReadonly<IPackWithState>
			  ) => number)
			| undefined;
		if (typeof filtered[0][sort_] === 'string') {
			sortFunc = (a, b) =>
				(a[sort_] as string).localeCompare(b[sort_] as string);
		} else if (typeof filtered[0][sort_] === 'number') {
			sortFunc = (a, b) => (b[sort_] as number) - (a[sort_] as number);
		} else if (filtered[0][sort_] instanceof Array) {
			sortFunc = (a, b) =>
				(a[sort_] as string[])
					.join(', ')
					.localeCompare((b[sort_] as string[]).join(', '));
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
	const indexOf = list.value.findIndex(
		(pack) => pack.id === focusedItem.value
	);
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

		const containerHeight =
			root.value.offsetHeight - header.value.offsetHeight;
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

function filterList(
	list: DeepReadonly<IPackWithState[]>,
	search: string
): DeepReadonly<IPackWithState>[] {
	if (!search) return [...list];
	return run(
		search,
		props.repo ? props.repo!.getAuthors() : {},
		list as unknown as Pack[]
	) as IPackWithState[];
}

function translatePackState(pack: DeepReadonly<IPackWithState>) {
	if (pack.state === PackStates.Active) return 'Active';
	if (pack.state === PackStates.Installed) return 'Installed';
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
	color: var(--text);

	.focused {
		background: var(--accent-background);
	}
}

tbody:focus {
	outline: 0;

	.focused {
		background: var(--border);
	}
}

tr:hover,
th:hover {
	background: var(--accent-background);
	cursor: pointer;
}

th,
td {
	padding: 0.25rem;
	min-height: 42px;
}

th {
	background: var(--native-background);
	position: sticky;
	top: 0;
	color: var(--text);
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
