import { EnvCapabilities, IEnvironment, IPack, Settings } from './environment';
import { registerAssetWithURL, getAsset } from '@/asset-manager';
import { Background } from '@/renderables/background';
import eventBus, { ShowMessageEvent } from '@/eventbus/event-bus';
import { EnvState } from '@/environments/envState';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IHistorySupport } from '@/plugins/vuex-history';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { ReplaceContentPackAction } from '@/store/content';
import { reactive } from 'vue';

const packs: IPack[] = [];

const installedBackgroundsPack: ContentPack<string> = {
	packId: 'dddg.buildin.installedBackgrounds',
	dependencies: [],
	packCredits: [],
	characters: [],
	fonts: [],
	sprites: [],
	poemStyles: [],
	poemBackgrounds: [],
	backgrounds: [],
	colors: [],
};

export class Electron implements IEnvironment {
	public readonly state: EnvState = reactive({
		autoAdd: [],
		installed: [],
	});
	public readonly localRepositoryUrl = '/repo/repo.json';

	private readonly electron = (window as any) as IElectronWindow;

	private vuexHistory: IHistorySupport | null = null;
	private $store: Store<IRootState> | null = null;
	private bgInvalidation: number | null = null;
	private readonly pendingContentPacks: string[] = [];

	constructor() {
		this.electron.ipcRenderer.on(
			'add-persistent-content-pack',
			async (e, filePath: string) => {
				if (!this.$store || !this.vuexHistory) {
					this.pendingContentPacks.push(filePath);
					return;
				}
				this.vuexHistory.transaction(async () => {
					await this.$store!.dispatch('content/loadContentPacks', filePath);
				});
			}
		);
		this.electron.ipcRenderer.on(
			'add-persistent-background',
			async (e, filepath: string) => {
				const name = 'persistentBg-' + filepath;
				const parts = filepath.split('/');
				registerAssetWithURL(name, filepath);
				installedBackgroundsPack.backgrounds.push({
					id: name,
					variants: [[name]],
					label: parts[parts.length - 1],
				});
				this.invalidateInstalledBGs();
			}
		);
		this.electron.ipcRenderer.on('push-message', async (e, message: string) => {
			eventBus.fire(new ShowMessageEvent(message));
		});
		this.electron.ipcRenderer.send('find-customs');
	}
	public onPanelChange(handler: (panel: string) => void): void {}
	public readonly supports: EnvCapabilities = {
		autoLoading: true,
		backgroundInstall: true,
		localRepo: true,
		lq: false,
		optionalSaving: false,
	};
	public readonly savingEnabled: boolean = true;
	public async saveSettings(settings: Settings): Promise<void> {
		await this.electron.ipcRenderer.sendConvo(
			'config.set',
			'nsfw',
			settings.nsfw
		);
	}
	public async loadSettings(): Promise<Settings> {
		return {
			lq: await this.electron.ipcRenderer.sendConvo('config.get', 'lq'),
			nsfw: await this.electron.ipcRenderer.sendConvo('config.get', 'nsfw'),
			darkMode: await this.electron.ipcRenderer.sendConvo(
				'config.get',
				'darkMode'
			),
		};
	}

	public async localRepoInstall(url: string): Promise<void> {
		await this.electron.ipcRenderer.sendConvo('repo.install', url);
	}
	public async localRepoUninstall(id: string): Promise<void> {
		await this.electron.ipcRenderer.sendConvo('repo.uninstall', id);
	}
	public async autoLoadAdd(id: string): Promise<void> {
		await this.electron.ipcRenderer.sendConvo('auto-load.add', id);
	}
	public async autoLoadRemove(id: string): Promise<void> {
		await this.electron.ipcRenderer.sendConvo('auto-load.remove', id);
	}

	public saveToFile(
		downloadCanvas: HTMLCanvasElement,
		filename: string,
		format = 'image/png',
		quality = 1
	): Promise<string> {
		return new Promise((resolve, reject) => {
			downloadCanvas.toBlob(
				async blob => {
					if (!blob) {
						reject();
						return;
					}
					const buffer = await (blob as any).arrayBuffer();
					await this.electron.ipcRenderer.sendConvo(
						'save-file',
						filename,
						new Uint8Array(buffer)
					);
					resolve(URL.createObjectURL(blob));
				},
				format,
				quality
			);
		});
	}

	public async installBackground(background: Background): Promise<void> {
		if (background.assets.length !== 1) return;
		if (
			background.assets[0].sourcePack !== 'dddg.buildin.uploadedBackgrounds'
		) {
			return;
		}

		const asset = await getAsset(background.assets[0].hq, true);
		if (!(asset instanceof HTMLImageElement)) return;
		const img = await fetch(asset.src);
		const array = new Uint8Array(await img.arrayBuffer());
		this.electron.ipcRenderer.send('install-background', array);
	}

	public async uninstallBackground(background: Background): Promise<void> {
		if (background.assets.length !== 1) return;
		if (
			background.assets[0].sourcePack !== 'dddg.buildin.installedBackgrounds'
		) {
			return;
		}

		const asset = await getAsset(background.assets[0].hq, true);
		if (!(asset instanceof HTMLImageElement)) return;
		if (!asset.src.startsWith('blob:')) {
			const img = await fetch(asset.src);
			const blob = await img.blob();
			const newUrl = URL.createObjectURL(blob);
			registerAssetWithURL(background.assets[0].hq, newUrl);
		}
		this.electron.ipcRenderer.send('uninstall-background', background.id);
	}

	public async prompt(
		message: string,
		defaultValue?: string
	): Promise<string | null> {
		return await this.electron.ipcRenderer.sendConvo(
			'show-prompt',
			message,
			defaultValue
		);
	}

	public connectToStore(
		vuexHistory: IHistorySupport,
		store: Store<IRootState>
	) {
		this.vuexHistory = vuexHistory;
		this.$store = store;
		this.invalidateInstalledBGs();

		if (this.pendingContentPacks.length > 0) {
			this.vuexHistory.transaction(async () => {
				await this.$store!.dispatch(
					'content/loadContentPacks',
					this.pendingContentPacks
				);
			});
		}
	}

	private invalidateInstalledBGs() {
		if (!this.vuexHistory || !this.$store) return;
		if (this.bgInvalidation !== null) return;
		this.bgInvalidation = requestAnimationFrame(() => {
			this.updateInstalledBGs();
		});
	}

	private updateInstalledBGs() {
		if (this.bgInvalidation) {
			cancelAnimationFrame(this.bgInvalidation);
			this.bgInvalidation = null;
		}
		if (!this.vuexHistory || !this.$store) return;

		this.vuexHistory.transaction(() => {
			this.$store!.dispatch('content/replaceContentPack', {
				contentPack: installedBackgroundsPack,
			} as ReplaceContentPackAction);
		});
	}
}

interface IElectronWindow {
	isElectron: boolean;
	ipcRenderer: IpcRenderer;
}

interface IpcRenderer {
	on(
		channel: string,
		listener: (event: IpcRendererEvent, ...args: any[]) => void
	): void;
	onConversation(
		channel: string,
		listener: (event: IpcRendererEvent, ...args: any[]) => void
	): void;
	send(channel: string, ...args: any[]): void;
	sendConvo<T>(channel: string, ...args: any[]): Promise<T>;
}

interface IpcRendererEvent extends Event {
	sender: IpcRenderer;
	senderId: number;
}
