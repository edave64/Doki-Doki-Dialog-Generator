<template>
	<div class="panel">
		<h1>Content Packs</h1>
		<button @click="addNew">Add new Pack</button>
		<fieldset>
			<legend>Installed Packs:</legend>
			<div class="list">
				<div
					v-for="pack in packs"
					:class="{ active: pack.name === name }"
					:key="pack.name"
					@click="select(pack.name)"
				>{{ pack.name }}</div>
			</div>
		</fieldset>
		<label for="pack_name">Name:</label>
		<input id="pack_name" :value="name" readonly />
		<label for="pack_credits">Credits:</label>
		<div id="pack_credits" v-html="credits"></div>
		<button v-if="activatable" @click="activate">Activate</button>
		<button v-if="deactivatable" @click="deactivate">Deactivate</button>
		<button v-if="installable" @click="install">Install</button>
		<button v-if="uninstallable" @click="uninstall">Uninstall</button>
		<div v-if="needRestart">
			The tool need restart for changes to take effect.
			<button @click="restart">Restart Now</button>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Mixins } from 'vue-property-decorator';
import { PanelMixin } from './panelMixin';
import environment from '../../../environments/environment';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { sanitize } from './character-pack-sanitizer';
import { Store } from 'vuex';
import { IRootState } from '../../../store';

interface IPack {
	name: string;
	credits: string;
	installed: boolean;
	queuedUninstall: boolean;
	active: boolean;
	freshInstall: boolean;
	url: string;
}

@Component({
	components: {},
})
export default class CharacterPackPanel extends Mixins(PanelMixin) {
	public $store!: Store<IRootState>;
	private selectedPack: IPack | null = null;
	private needRestart = false;

	private created() {
		const packs = environment.installedCharacterPacks;
		console.log('packs:', packs);
	}

	private get packs(): IPack[] {
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
					} as IPack)
			);
	}

	private select(name: string) {
		this.selectedPack = this.packs.find(pack => pack.name === name) || null;
	}

	private async addNew() {
		const url = await environment.prompt(
			'Enter the URL of the character pack:'
		);
		if (!url) return;
		await this.$store.dispatch('content/loadContentPacks', url);
	}

	private restart() {
		location.reload(true);
	}

	private get name(): string {
		if (!this.selectedPack) return '';
		return this.selectedPack.name;
	}
	private get credits(): string {
		if (!this.selectedPack) return '';
		return sanitize(this.selectedPack.credits || '');
	}
	private get activatable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (!this.selectedPack) return false;
		if (!this.selectedPack.installed) return false;
		if (this.selectedPack.queuedUninstall) return false;
		if (this.selectedPack.freshInstall) return false;
		return !this.selectedPack.active;
	}
	private get deactivatable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (!this.selectedPack) return false;
		if (!this.selectedPack.installed) return false;
		if (this.selectedPack.queuedUninstall) return false;
		if (this.selectedPack.freshInstall) return false;
		return this.selectedPack.active;
	}
	private get installable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (!this.selectedPack) return false;
		return this.selectedPack.queuedUninstall || !this.selectedPack.installed;
	}
	private get uninstallable(): boolean {
		if (!environment.isPackInstallingSupported) return false;
		if (!this.selectedPack) return false;
		if (this.selectedPack.freshInstall) return false;
		return !(this.selectedPack.queuedUninstall || !this.selectedPack.installed);
	}

	private install(): void {
		if (!this.selectedPack) return;
		environment.installContentPack(this.selectedPack.url);
		if (this.selectedPack.queuedUninstall) {
			this.selectedPack.queuedUninstall = false;
		} else {
			this.selectedPack.installed = true;
		}
	}

	private uninstall(): void {
		if (!this.selectedPack) return;
		environment.uninstallContentPack(this.selectedPack.url);
		this.selectedPack.queuedUninstall = true;
		this.needRestart = true;
	}

	private activate(): void {
		if (!this.selectedPack) return;
		environment.activateContentPack(this.selectedPack.url);
		this.selectedPack.active = true;
		this.needRestart = true;
	}

	private deactivate(): void {
		if (!this.selectedPack) return;
		environment.deactivateContentPack(this.selectedPack.url);
		this.selectedPack.active = false;
		this.needRestart = true;
	}
}
</script>

<style lang="scss" scoped>
p {
	margin: 4px;
}
fieldset {
	border: 3px solid #ffbde1;
}

.list {
	overflow-y: auto;
	overflow-x: hidden;
	.active {
		background-color: #ffbde1;
	}
}

.panel.vertical {
	fieldset {
		width: 100%;

		> .list {
			max-height: 200px;
			width: 172px;

			* {
				width: 100%;
				text-overflow: ellipsis;
				padding: 2px;
			}
		}
	}
}

.panel:not(.vertical) {
	.list {
		max-height: 140px;
	}
}
</style>
