<template>
	<div class="pack-display" :style="{ backgroundImage }" @click.stop>
		<header>
			<h1>
				<button
					v-if="showBack"
					class="exit-button"
					@click="$emit('leave', true)"
				>
					<i class="material-icons">arrow_back</i>
				</button>
				{{ pack.name }}
			</h1>
			<h2>{{ pack.id }}</h2>
		</header>
		<section
			class="disclaimer"
			v-if="pack.disclaimer"
			v-html="sanitize(pack.disclaimer as string)"
		/>
		<section v-if="pack.source">
			<l :to="pack.source as string">Source</l>
		</section>
		<section>
			<button v-if="addable" @click="add">
				<i class="material-icons">add</i>
				Activate
			</button>
			<button v-if="removable" @click="remove">
				<i class="material-icons">remove</i>
				Deactivate
			</button>
			<button v-if="installable" @click="install">
				<i class="material-icons">add</i>
				Store locally
			</button>
			<button v-if="uninstallable" @click="uninstall">
				<i class="material-icons">remove</i>
				Remove locally
			</button>
			<toggle
				v-if="autoloadEnabled"
				label="Load on startup"
				v-model="autoload"
			/>
		</section>
		<section>
			<h3>Authors</h3>
			<table>
				<tbody>
					<tr v-for="authorId of pack.authors" :key="authorId">
						<td>{{ authorName(authorId) }}</td>
						<td>
							<l
								v-for="link of authorsLinks(authorId)"
								:key="link.target"
								:to="link.target"
								class="platform_button"
								><img
									:title="link.platform"
									:src="link.icon"
									height="32"
									width="32"
									alt=""
							/></l>
						</td>
					</tr>
				</tbody>
			</table>
		</section>
		<section v-if="pack.description">
			<h3>Credits</h3>
			<p v-html="sanitize(pack.description)"></p>
		</section>
	</div>
</template>

<script lang="ts" setup>
import { sanitize } from '@/components/toolbox/tools/character-pack-sanitizer';
import L from '@/components/ui/link.vue';
import environment from '@/environments/environment';
import { Repo } from '@/models/repo';
import { IRemovePacksAction, useStore } from '@/store';
import { IAuthor, IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { DeepReadonly } from 'ts-essentials';
import { computed, defineComponent, PropType } from 'vue';
import Toggle from '../toggle.vue';

const linkablePlatforms: Array<[keyof IAuthor, string, string]> = [
	['reddit', 'https://reddit.com/u/%1', 'reddit.png'],
	['deviantart', 'https://www.deviantart.com/%1', 'deviantart.png'],
	['twitter', 'https://twitter.com/%1', 'twitter.svg'],
	['pixiv', 'https://www.pixiv.net/users/%1', 'pixiv.ico'],
	['patreon', 'https://www.patreon.com/%1', 'patreon.png'],
	['facebook', 'https://www.facebook.com/%1', 'facebook.png'],
	['github', 'https://github.com/%1', 'github.png'],
	['website', '%1', 'website.svg'],
];

const store = useStore();
const props = defineProps({
	selected: {
		type: String,
		required: true,
	},
	repo: {
		type: Object as PropType<DeepReadonly<Repo> | null>,
		require: true,
	},
	showBack: {
		type: Boolean,
		require: false,
	},
});

const pack = computed(() => props.repo!.getPack(props.selected)!);
const backgroundImage = computed(() =>
	pack.value.preview.map((preview) => `url('${preview}')`).join(',')
);
const removable = computed(() => pack.value.loaded);
const addable = computed(() => !pack.value.loaded);
const autoloadEnabled = computed(() => environment.supports.autoLoading);
const installable = computed(() => {
	if (!environment.supports.localRepo) return false;
	return !pack.value.installed;
});
const uninstallable = computed(() => {
	if (!environment.supports.localRepo) return false;
	return pack.value.installed;
});
const autoload = computed({
	get(): boolean {
		return environment.state.autoAdd.includes(props.selected);
	},
	set(val: boolean): void {
		let loadId = props.selected;
		const pack_ = pack.value;
		if (pack_.repoUrl != null) loadId += `;${pack_.repoUrl}`;
		if (val) {
			environment.autoLoadAdd(loadId);
		} else {
			environment.autoLoadRemove(loadId);
		}
	},
});

function authorName(authorId: string) {
	const author = props.repo!.getAuthor(authorId);
	if (author && author.currentName != null) return author.currentName;
	return authorId;
}

function authorsLinks(authorId: string): AuthorLink[] {
	const author = props.repo!.getAuthor(authorId);
	if (!author) return [];
	return linkablePlatforms
		.filter((platform) => author[platform[0]])
		.map((platform) => {
			const value = author[platform[0]]!;
			const target = platform[1].replace('%1', value);
			return {
				target,
				platform: platform[0][0].toUpperCase() + platform[0].slice(1),
				icon: 'icons/' + platform[2],
			};
		});
}

function install(): void {
	if (pack.value.installed) return;
	const authors: IAuthors = {};
	for (const key of pack.value.authors) {
		authors[key] = { ...props.repo!.getAuthor(key) };
	}

	const pack_: any = JSON.parse(JSON.stringify(pack.value));
	delete pack_.autoloading;
	delete pack_.online;
	delete pack_.loaded;
	delete pack_.installed;

	environment.localRepoInstall(
		pack.value.dddg2Path || pack.value.dddg1Path,
		pack_,
		authors
	);
}

async function uninstall(): Promise<void> {
	const pack_ = pack.value;
	if (!pack_.installed) return;
	if (pack_.repoUrl && !props.repo?.hasPack(pack_.id, true)) {
		await props.repo!.loadTempPack(pack_.repoUrl);
	}
	environment.localRepoUninstall(pack_.id);
}

async function remove(): Promise<void> {
	await store.dispatch('removePacks', {
		packs: new Set([pack.value.id]),
	} as IRemovePacksAction);
}

async function add(): Promise<void> {
	await store.dispatch(
		'content/loadContentPacks',
		pack.value.dddg2Path || pack.value.dddg1Path
	);
}

interface AuthorLink {
	readonly target: string;
	readonly platform: string;
	readonly icon: string;
}
</script>

<style scoped lang="scss">
.platform_button {
	margin-right: 6px;
}

.exit-button {
	height: 32px;
	width: 32px;
	text-align: center;
	background-position: center center;
	background-repeat: no-repeat;
	background-size: contain;
}

.pack-display {
	width: 100%;
	height: 100%;
	background-attachment: scroll;
	//noinspection CssOverwrittenProperties
	background-color: $default-native-background;
	//noinspection CssOverwrittenProperties
	background-color: var(--native-background);
	background-position: right center;
	background-repeat: no-repeat;
	background-size: contain;
	display: flex;
	flex-direction: column;
	align-self: center;
	overflow: auto;
	padding: 0;

	h1 {
		font-size: 24px;
	}

	h2 {
		font-size: 14px;
		//noinspection CssOverwrittenProperties
		color: $default-text;
		//noinspection CssOverwrittenProperties
		color: var(--text);
	}

	section,
	header,
	footer {
		padding: 16px;
		//noinspection CssOverwrittenProperties
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 1) 25%,
			rgba(255, 255, 255, 0) 75%
		);
		//noinspection CssOverwrittenProperties
		background: linear-gradient(
			90deg,
			var(--pack-display-start) 25%,
			var(--pack-display-end) 75%
		);
		width: 100%;
		//noinspection CssOverwrittenProperties
		color: $default-text;
		//noinspection CssOverwrittenProperties
		color: var(--text);

		//noinspection CssOverwrittenProperties
		text-shadow: 0 0 4px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff,
			-1px 1px 0 #fff, 1px 1px 0 #fff;
		//noinspection CssOverwrittenProperties
		text-shadow: 0 0 4px var(--native-background),
			-1px -1px 0 var(--native-background), 1px -1px 0 var(--native-background),
			-1px 1px 0 var(--native-background), 1px 1px 0 var(--native-background);
	}

	footer:last-child,
	section:last-child {
		flex-grow: 1;
	}

	section.disclaimer {
		background: linear-gradient(
			90deg,
			rgba(255, 51, 51, 1) 25%,
			rgba(255, 51, 51, 0) 75%
		);
	}

	.copy-wrapper {
		display: block;
		width: 1px;
		overflow: hidden;
		height: 1px;
		opacity: 0;

		input {
			position: relative;
		}
	}

	> ul {
		margin-left: 20px;
	}
}
</style>

<style lang="scss">
body {
	--pack-display-start: rgba(255, 255, 255, 1);
	--pack-display-end: rgba(255, 255, 255, 0);
}

body.dark-theme {
	--pack-display-start: rgba(23, 23, 23, 1);
	--pack-display-end: rgba(23, 23, 23, 0);
}
</style>
