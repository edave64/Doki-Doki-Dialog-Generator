<template>
	<div :class="{ panel: true, vertical }">
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
				>{{pack.name}}</div>
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
import environment from '../../environments/environment';
import { IJSONCharacter, JSONHeads } from '../../models/json-config';
import { loadCharacterPack } from '../../asset-manager';

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
export default class AddPanel extends Mixins(PanelMixin) {
	@Prop({ required: true, type: Boolean }) private readonly vertical!: boolean;

	private selectedPack: IPack | null = null;
	private temporaryPacks: IPack[] = [];
	private installedPacks: IPack[] = [];
	private needRestart = false;

	private created() {
		const packs = environment.installedCharacterPacks;
		console.log('packs:', packs);
		for (const pack of packs) {
			this.installedPacks.push({
				name: pack.id,
				credits: pack.credits,
				url: pack.url,
				installed: true,
				queuedUninstall: pack.queuedUninstall,
				active: pack.active,
				freshInstall: false,
			});
		}
	}

	private get packs(): IPack[] {
		return [...this.temporaryPacks, ...this.installedPacks];
	}

	private select(name: string) {
		this.selectedPack = this.packs.find(pack => pack.name === name) || null;
	}

	private async addNew() {
		const url = await environment.prompt(
			'Enter the URL of the character pack:'
		);
		if (!url) return;
		const json = await loadCharacterPack(url);
		if (!json) {
			return;
		}
		this.temporaryPacks.push({
			name: json.packId,
			credits: json.packCredits,
			installed: false,
			queuedUninstall: false,
			active: true,
			url,
			freshInstall: true,
		});
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
		return this.selectedPack.credits;
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
.panel.vertical {
	fieldset {
		> .list {
			width: 146px;

			* {
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				padding: 2px;
			}

			.active {
				background-color: #ffbde1;
			}
		}
	}
}
</style>