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
		<section class="disclaimer" v-if="pack.disclaimer">
			{{ pack.disclaimer }}
		</section>
		<section v-if="pack.source">
			<a :href="pack.source" target="_blank" rel="noopener noreferrer"
				>Source</a
			>
		</section>
		<section>
			<button v-if="addable" class="clipboard" ref="toFocus" @click="add">
				<i class="material-icons">add</i>
				Add {{ installable ? 'Temporarily' : '' }}
			</button>
			<button v-if="removable" class="clipboard" ref="toFocus" @click="remove">
				<i class="material-icons">remove</i>
				Remove {{ uninstallable ? 'Temporarily' : '' }}
			</button>
		</section>
		<section>
			<h3>Authors</h3>
			<table>
				<tbody>
					<tr v-for="authorId of pack.authors" :key="authorId">
						<td>{{ authorName(authorId) }}</td>
						<td>
							<a
								v-for="link of authorsLinks(authorId)"
								:key="link.target"
								:href="link.target"
								target="_blank"
								rel="noopener noreferrer"
								class="platform_button"
								><img
									:title="link.platform"
									:src="link.icon"
									height="32"
									width="32"
							/></a>
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

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { IAuthor, IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { sanitize } from '@/components/toolbox/panels/character-pack-sanitizer';
import environment from '@/environments/environment';
import { IRootState, IRemovePacksAction } from '../../store';
import { Store } from 'vuex';
import { PackState, ContentPackWithState } from '../../store/content';
import { IPackWithState } from './types';

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

@Component({})
export default class PackDisplay extends Vue {
	@Prop() private selected!: string;
	@Prop() private authors!: IAuthors;
	@Prop() private packs!: IPackWithState[];
	@Prop({ type: Boolean, default: false }) private showBack!: boolean;
	public $store!: Store<IRootState>;

	public focus() {
		(this.$refs.toFocus as HTMLElement).focus();
	}

	private authorName(authorId: string) {
		const author = this.authors[authorId];
		if (author && author.currentName) return author.currentName;
		return authorId;
	}

	private authorsLinks(authorId: string): AuthorLink[] {
		const author = this.authors[authorId];
		if (!author) return [];
		return linkablePlatforms
			.filter(platform => author[platform[0]])
			.map(platform => {
				const value = author[platform[0]]!;
				const target = platform[1].replace('%1', value);
				return {
					target,
					platform: platform[0][0].toUpperCase() + platform[0].slice(1),
					icon: 'icons/' + platform[2],
				};
			});
	}

	private sanitize(credits: string) {
		return sanitize(credits);
	}

	private get pack(): IPackWithState {
		return this.packs.find(pack => pack.id === this.selected)!;
	}

	private get backgroundImage(): string {
		return this.pack.preview.map(preview => `url('${preview}')`).join(',');
	}

	/*
	private get knownPacks(): IInstalledPack[] {
		const packs = this.$store.state.content.contentPacks;
		return packs
			.filter(pack => pack.packId && !pack.packId.startsWith('dddg.buildin.'))
			.map(
				pack =>
					({
						name: pack.packId,
						credits: pack.packCredits,
						installed: true,
						active: true,
						queuedUninstall: false,
						freshInstall: false,
						url: '',
					} as IInstalledPack)
			);
	}

	private get activatable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (!this.installedPack) return false;
		if (!this.installedPack.installed) return false;
		if (this.installedPack.queuedUninstall) return false;
		if (this.installedPack.freshInstall) return false;
		return !this.installedPack.active;
	}
	private get deactivatable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (!this.installedPack) return false;
		if (!this.installedPack.installed) return false;
		if (this.installedPack.queuedUninstall) return false;
		if (this.installedPack.freshInstall) return false;
		return this.installedPack.active;
	}
	*/
	private get installable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (this.pack.state === 'Installed') return false;
		return true;
	}
	private get uninstallable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (this.pack.state !== 'Installed') return false;
		return true;
	}
	/*
	private install(): void {
		if (!this.installedPack) return;
		environment.installContentPack(this.pack.dddg2Path || this.pack.dddg1Path);
		if (this.installedPack.queuedUninstall) {
			this.installedPack.queuedUninstall = false;
		} else {
			this.installedPack.installed = true;
		}
	}

	private uninstall(): void {
		if (!this.installedPack) return;
		environment.uninstallContentPack(this.installedPack.url);
		this.installedPack.queuedUninstall = true;
	}

	private activate(): void {
		if (!this.installedPack) return;
		environment.activateContentPack(this.installedPack.url);
		this.installedPack.active = true;
	}

	private deactivate(): void {
		if (!this.installedPack) return;
		environment.deactivateContentPack(this.installedPack.url);
		this.installedPack.active = false;
	}

*/
	private get removable(): boolean {
		return this.pack.state === 'Added' || this.pack.state === 'Installed';
	}

	private async remove(): Promise<void> {
		await this.$store.dispatch('removePacks', {
			packs: new Set([this.pack.id]),
		} as IRemovePacksAction);
	}

	private get addable(): boolean {
		return this.pack.state === 'Unknown';
	}

	private async add(): Promise<void> {
		await this.$store.dispatch(
			'content/loadContentPacks',
			this.pack.dddg2Path || this.pack.dddg1Path
		);
	}

	private isAdded() {
		this.$store.state;
	}
}

interface AuthorLink {
	readonly target: string;
	readonly platform: string;
	readonly icon: string;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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
	background-color: #ffffff;
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
	}

	section,
	header,
	footer {
		padding: 16px;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 1) 25%,
			rgba(255, 255, 255, 0) 75%
		);
		width: 100%;

		text-shadow: 0 0 4px #fff, -1px -1px 0 #fff, 1px -1px 0 #fff,
			-1px 1px 0 #fff, 1px 1px 0 #fff;
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
}
</style>
