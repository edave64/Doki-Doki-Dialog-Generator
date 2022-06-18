import { EnvCapabilities, Folder, IEnvironment, Settings } from './environment';
import { getAsset, registerAssetWithURL } from '@/asset-manager';
import { Background } from '@/renderables/background';
import eventBus, {
	ResolvableErrorEvent,
	ShowMessageEvent,
} from '@/eventbus/event-bus';
import { EnvState } from '@/environments/envState';
import { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { IHistorySupport } from '@/plugins/vuex-history';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { ReplaceContentPackAction } from '@/store/content';
import { reactive } from 'vue';
import { Repo } from '@/models/repo';
import { DeepReadonly } from 'ts-essentials';
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { IPack } from '@edave64/dddg-repo-filters/dist/pack';

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
		downloadLocation: '',
	});
	public readonly localRepositoryUrl = '/repo/';

	public get gameMode(): 'ddlc' | 'ddlc_plus' | null {
		return this._gameMode;
	}

	private _gameMode: 'ddlc' | 'ddlc_plus' | null = null;
	private readonly electron = window as any as IElectronWindow;

	private vuexHistory: IHistorySupport | null = null;
	private $store: Store<DeepReadonly<IRootState>> | null = null;
	private bgInvalidation: number | null = null;
	private readonly pendingContentPacks: string[] = [];
	private readonly pendingContentPacksReplace: ReplaceContentPackAction[] = [];

	private loadingContentPacksAllowed: Promise<void>;
	public loadContentPacks!: () => void;

	constructor() {
		this.loadingContentPacksAllowed = new Promise((resolve, reject) => {
			this.loadContentPacks = () => resolve();
		});

		this.electron.ipcRenderer.on(
			'add-persistent-content-pack',
			async (filePath: string) => {
				await this.loadingContentPacksAllowed;
				if (!this.$store || !this.vuexHistory) {
					this.pendingContentPacks.push(filePath);
					return;
				}
				await this.vuexHistory.transaction(async () => {
					await this.$store!.dispatch('content/loadContentPacks', filePath);
				});
			}
		);
		this.electron.ipcRenderer.on(
			'add-persistent-background',
			async (filepath: string) => {
				const name = 'persistentBg-' + filepath;
				const parts = filepath.split('/');
				await registerAssetWithURL(name, filepath);
				installedBackgroundsPack.backgrounds.push({
					id: name,
					variants: [[name]],
					label: parts[parts.length - 1],
					scaling: 'none',
				});
				this.invalidateInstalledBGs();
			}
		);
		this.electron.ipcRenderer.on('push-message', async (message: string) => {
			eventBus.fire(new ShowMessageEvent(message));
		});
		this.electron.ipcRenderer.on(
			'config.downloadFolderUpdate',
			async (location: string) => {
				this.state.downloadLocation = location;
			}
		);
		this.electron.ipcRenderer.onConversation(
			'load-packs',
			async (packIds: string[]) => {
				const repo = await Repo.getInstance();
				const packUrls = await Promise.all(
					packIds.map(async (compoundId) => {
						const [id, url] = compoundId.split(';', 2) as [string, string?];
						if (url && !repo.hasPack(id)) {
							await repo.loadTempPack(url);
						}
						const pack = repo.getPack(id);
						return pack.dddg2Path || pack.dddg1Path;
					})
				);
				if (!this.$store || !this.vuexHistory) {
					packUrls.forEach((url) => this.pendingContentPacks.push(url));
					return;
				}
				await this.vuexHistory!.transaction(async () => {
					await this.$store!.dispatch('content/loadContentPacks', packUrls);
				});
			}
		);
		this.electron.ipcRenderer.onConversation(
			'auto-load.changed',
			async (packIds: string[]) => {
				this.state.autoAdd = packIds;
			}
		);
		this.electron.ipcRenderer.onConversation('reload-repo', async () => {
			await (await Repo.getInstance()).reloadLocalRepo();
		});
		this.electron.ipcRenderer.onConversation(
			'replace-pack',
			async (contentPack: ContentPack<string>) => {
				const action: ReplaceContentPackAction = {
					processed: false,
					contentPack,
				};
				if (!this.$store || !this.vuexHistory) {
					this.pendingContentPacksReplace.push(action);
				} else {
					await this.vuexHistory!.transaction(async () => {
						await this.$store!.dispatch('content/replaceContentPack', action);
					});
				}
			}
		);
		this.electron.ipcRenderer.onConversation(
			'resolvable-error',
			(message: string, actions: string[]) => {
				return new Promise((resolve, reject) => {
					eventBus.fire(
						new ResolvableErrorEvent(
							message,
							actions.map((action) => ({
								exec: () => resolve(action),
								name: action,
							}))
						)
					);
				});
			}
		);
		let updateNotified = false;
		this.electron.ipcRenderer.on(
			'update.progress',
			(progress: number | 'done') => {
				if (progress === 'done') {
					updateNotified = false;
					eventBus.fire(
						new ShowMessageEvent(
							'An update is ready and will be installed once DDDG closes.'
						)
					);
				} else if (!updateNotified) {
					updateNotified = true;
					eventBus.fire(
						new ShowMessageEvent(
							'An update is ready and will be installed once DDDG closes.'
						)
					);
				}
			}
		);
		this.electron.ipcRenderer.send('init-dddg');
	}

	public updateDownloadFolder(): void {
		this.electron.ipcRenderer.send('config.newDownloadFolder');
	}

	public openFolder(folder: Folder): void {
		this.electron.ipcRenderer.send('open-folder', folder);
	}

	public onPanelChange(_handler: (panel: string) => void): void {}

	public readonly supports: EnvCapabilities = {
		autoLoading: true,
		backgroundInstall: true,
		localRepo: true,
		lq: false,
		optionalSaving: false,
		setDownloadFolder: true,
		openableFolders: new Set(['downloads', 'backgrounds', 'sprites']),
		assetCaching: true,
	};
	public readonly savingEnabled: boolean = true;

	public async saveSettings(settings: Settings): Promise<void> {
		await this.electron.ipcRenderer.sendConvo(
			'config.set',
			'nsfw',
			settings.nsfw
		);
		await this.electron.ipcRenderer.sendConvo(
			'config.set',
			'darkMode',
			settings.darkMode ?? undefined
		);
		await this.electron.ipcRenderer.sendConvo(
			'config.set',
			'defaultCharacterTalkingZoom',
			settings.defaultCharacterTalkingZoom
		);
	}

	public async loadGameMode() {
		this._gameMode =
			(await this.electron.ipcRenderer.sendConvo('config.get', 'gameMode')) ||
			'ddlc';
	}

	public async setGameMode(mode: Electron['gameMode']): Promise<void> {
		await this.electron.ipcRenderer.sendConvo('config.set', 'gameMode', mode);
		this.electron.ipcRenderer.send('reload');
	}

	public async loadSettings(): Promise<Settings> {
		return {
			lq: false,
			nsfw:
				(await this.electron.ipcRenderer.sendConvo('config.get', 'nsfw')) ??
				false,
			darkMode:
				(await this.electron.ipcRenderer.sendConvo('config.get', 'darkMode')) ??
				undefined,
			defaultCharacterTalkingZoom:
				(await this.electron.ipcRenderer.sendConvo(
					'config.get',
					'defaultCharacterTalkingZoom'
				)) ?? undefined,
		};
	}

	public async localRepoInstall(
		url: string,
		repo: IPack,
		authors: IAuthors
	): Promise<void> {
		await this.electron.ipcRenderer.sendConvo(
			'repo.install',
			url,
			repo,
			authors
		);
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
				async (blob) => {
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
			await registerAssetWithURL(background.assets[0].hq, newUrl);
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
		store: Store<DeepReadonly<IRootState>>
	) {
		this.vuexHistory = vuexHistory;
		this.$store = store;
		this.invalidateInstalledBGs();

		this.vuexHistory.transaction(async () => {
			if (this.pendingContentPacks.length > 0) {
				await this.$store!.dispatch(
					'content/loadContentPacks',
					this.pendingContentPacks
				);
			}
			if (this.pendingContentPacksReplace.length > 0) {
				for (const action of this.pendingContentPacksReplace) {
					await this.$store!.dispatch('content/replaceContentPack', action);
				}
			}
		});
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

		this.vuexHistory.transaction(async () => {
			await this.$store!.dispatch('content/replaceContentPack', {
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
	on(channel: string, listener: (...args: any[]) => void): void;

	onConversation(channel: string, listener: (...args: any[]) => void): void;

	send(channel: string, ...args: any[]): void;

	sendConvo<T>(channel: string, ...args: any[]): Promise<T>;
}
