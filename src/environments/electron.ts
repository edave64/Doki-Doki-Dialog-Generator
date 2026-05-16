/**
 * This file implements the environment for the dddg-desktop electron app.
 * https://github.com/edave64/dddg-desktop-version
 */

import { registerAssetWithURL } from '@/asset-manager';
import eventBus, {
	FailureEvent,
	ResolvableErrorEvent,
	ShowMessageEvent,
} from '@/eventbus/event-bus';
import { transaction } from '@/history-engine/transaction';
import { Repo } from '@/models/repo';
import type { ReplaceContentPackAction } from '@/store/content';
import { state } from '@/store/root';
import type { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import type { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { reactive, ref } from 'vue';
import type {
	EnvCapabilities,
	EnvState,
	EnvStorageEntry,
	Folder,
	IEnvironment,
	Settings,
} from './environment';

export class Electron implements IEnvironment {
	public readonly state: EnvState = reactive({
		looseTextParsing: true,
		autoAdd: [],
		downloadLocation: '',
		hasTemplate: false,
	} as EnvState);
	public readonly localRepositoryUrl = '/repo/';

	public get gameMode(): 'ddlc' | 'ddlc_plus' | null {
		return this._gameMode;
	}

	private _gameMode: 'ddlc' | 'ddlc_plus' | null = null;
	private readonly electron = window as unknown as IElectronWindow;

	private bgInvalidation: number | null = null;

	private readonly loadingContentPacksAllowed: Promise<void>;
	public loadContentPacks!: () => void;

	public updateProgress = ref('wait' as const) as Exclude<
		IEnvironment['updateProgress'],
		null
	>;

	public storage = (() => {
		const tempSaves = ref([] as EnvStorageEntry[]);
		const electron = window as unknown as IElectronWindow;

		(async () => {
			tempSaves.value = await electron.ipcRenderer.sendConvo(
				'save-states.get-all'
			);
		})();

		return {
			getSaves() {
				return tempSaves.value;
			},
			async save(name: string) {
				await electron.ipcRenderer.sendConvo('save-states.begin', name);
				const entry = await sendSaveToElectron(
					name,
					electron.ipcRenderer
				);
				tempSaves.value.push(entry);
				return entry;
			},
			async load(name: string): Promise<void> {
				const files = (await electron.ipcRenderer.sendConvo(
					'save-states.load',
					name
				)) as { name: string; data: ArrayBuffer }[];

				await loadFromFiles(files);
			},
			async downloadAsZip(name: string): Promise<void> {
				await electron.ipcRenderer.sendConvo(
					'save-states.download-zip',
					name
				);
			},
			async uploadFromZip(name: string, zip: Blob): Promise<void> {
				await electron.ipcRenderer.sendConvo(
					'save-states.upload-zip',
					name,
					await zip.arrayBuffer()
				);
			},

			async delete(name: string) {
				await electron.ipcRenderer.sendConvo(
					'save-states.delete',
					name
				);
				tempSaves.value.splice(
					tempSaves.value.findIndex((x) => x.name === name),
					1
				);
			},
			async requestPersistance(): Promise<boolean> {
				// Persistance is always supported on desktop
				return true;
			},
			isPersisted(): boolean {
				return true;
			},
		};
	})();

	constructor() {
		this.loadingContentPacksAllowed = new Promise((resolve) => {
			this.loadContentPacks = () => resolve();
		});

		this.electron.ipcRenderer.on(
			'add-persistent-content-pack',
			async (filePath: string) => {
				await this.loadingContentPacksAllowed;
				await transaction(async () => {
					await state.content.loadContentPacks(filePath);
				});
			}
		);
		this.electron.ipcRenderer.on(
			'add-persistent-background',
			async (filepath: string) => {
				const name = 'persistentBg-' + filepath;
				const parts = filepath.split('/');
				registerAssetWithURL(name, filepath);
				installedBackgroundsPack.backgrounds.push({
					id: name,
					variants: [[name]],
					label: parts[parts.length - 1],
					scaling: 'none',
				});
				this.invalidateInstalledBGs();
			}
		);
		this.electron.ipcRenderer.on('push-message', (message: string) => {
			eventBus.fire(new ShowMessageEvent(message));
		});
		this.electron.ipcRenderer.on(
			'config.downloadFolderUpdate',
			(location: string) => {
				this.state.downloadLocation = location;
			}
		);
		this.electron.ipcRenderer.onConversation(
			'load-packs',
			async (packIds: string[]) => {
				const repo = await Repo.getInstance();
				const packUrls = await Promise.all(
					packIds.map(async (compoundId) => {
						const [id, url] = compoundId.split(';', 2) as [
							string,
							string?,
						];
						if (url != null && !repo.hasPack(id)) {
							await repo.loadTempPack(url);
						}
						const pack = repo.getPack(id)!;
						return pack.dddg2Path || pack.dddg1Path;
					})
				);

				await transaction(async () => {
					await state.content.loadContentPacks(packUrls);
				});
			}
		);
		this.electron.ipcRenderer.onConversation(
			'auto-load.changed',
			(packIds: string[]) => {
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
				await transaction(async () => {
					await state.content.replaceContentPack(action);
				});
			}
		);
		this.electron.ipcRenderer.onConversation(
			'resolvable-error',
			(message: string, actions: string[]) => {
				return new Promise((resolve) => {
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
				this.updateProgress.value = progress;
				if (progress === 'done') {
					updateNotified = false;
					eventBus.fire(
						new ShowMessageEvent(
							'An update is downloaded and will be installed once DDDG closes.'
						)
					);
				} else if (!updateNotified) {
					updateNotified = true;
					eventBus.fire(
						new ShowMessageEvent(
							'An update was found and will download in the background.'
						)
					);
				}
			}
		);
		this.electron.ipcRenderer.on('update.checkStopped', () => {
			this.updateProgress.value = 'none';
		});
		this.electron.ipcRenderer.send('init-dddg');
	}
	async loadDefaultTemplate(): Promise<boolean> {
		const files = (await this.electron.ipcRenderer.sendConvo(
			'save-states.load-default'
		)) as { name: string; data: ArrayBuffer }[] | null;

		if (files == null) return false;
		try {
			await loadFromFiles(files);
			this.state.hasTemplate = true;
		} catch (e) {
			eventBus.fire(
				new FailureEvent(
					`Error loading default save: ${e && typeof e === 'object' && 'message' in e ? e.message : e}`
				)
			);
			return false;
		}
		return true;
	}
	async saveDefaultTemplate(): Promise<void> {
		await this.electron.ipcRenderer.sendConvo('save-states.default-begin');
		// For default saves, we must send the name 'default'.
		// Otherwise electron will reject the save.
		await sendSaveToElectron('default', this.electron.ipcRenderer);
		this.state.hasTemplate = true;
	}
	async clearDefaultTemplate(): Promise<void> {
		await this.electron.ipcRenderer.sendConvo('save-states.default-begin');
		await this.electron.ipcRenderer.sendConvo('save-states.end', 'default');
		this.state.hasTemplate = false;
	}
	storeSaveFile(saveBlob: Blob, defaultName: string): Promise<void> {
		const a = document.createElement('a');
		const url = URL.createObjectURL(saveBlob);
		a.setAttribute('download', defaultName);
		a.setAttribute('href', url);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		return Promise.resolve();
	}

	public updateDownloadFolder(): void {
		this.electron.ipcRenderer.send('config.newDownloadFolder');
	}

	public openFolder(folder: Folder): void {
		this.electron.ipcRenderer.send('open-folder', folder);
	}

	public onPanelChange(): void {}

	public readonly supports: EnvCapabilities = {
		autoLoading: true,
		backgroundInstall: true,
		localRepo: true,
		lq: false,
		optionalSaving: false,
		setDownloadFolder: true,
		openableFolders: new Set(['downloads', 'backgrounds', 'sprites']),
		assetCaching: true,
		allowWebP: true,
		limitedCanvasSpace: false,
		storage: true,
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
			(await this.electron.ipcRenderer.sendConvo(
				'config.get',
				'gameMode'
			)) || 'ddlc';
	}

	public async setGameMode(mode: Electron['gameMode']): Promise<void> {
		await this.electron.ipcRenderer.sendConvo(
			'config.set',
			'gameMode',
			mode
		);
		this.electron.ipcRenderer.send('reload');
	}

	public async loadSettings(): Promise<Settings> {
		return {
			lq: false,
			nsfw:
				(await this.electron.ipcRenderer.sendConvo(
					'config.get',
					'nsfw'
				)) ?? false,
			darkMode:
				(await this.electron.ipcRenderer.sendConvo(
					'config.get',
					'darkMode'
				)) ?? undefined,
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
					const buffer = await blob.arrayBuffer();
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

	openNewWindow(): Window | null {
		return window.open(undefined, '_blank', 'left=100,top=100');
	}

	private invalidateInstalledBGs() {
		if (this.bgInvalidation !== null) return;
		this.bgInvalidation = requestAnimationFrame(() => {
			this.updateInstalledBGs();
		});
	}

	private updateInstalledBGs() {
		if (this.bgInvalidation != null) {
			cancelAnimationFrame(this.bgInvalidation);
			this.bgInvalidation = null;
		}

		transaction(async () => {
			await state.content.replaceContentPack({
				contentPack: installedBackgroundsPack,
				processed: false,
			});
		});
	}
}

async function loadFromFiles(
	files: { name: string; data: ArrayBuffer }[]
): Promise<void> {
	const mainSave = files.find((x) => x.name === 'save.dddg');

	if (mainSave == null) {
		throw new Error('No save.dddg found');
	}

	const decoder = new TextDecoder();
	await state.loadSave(decoder.decode(mainSave.data));
	for (const file of files) {
		if (file === mainSave) continue;
		const blob = new Blob([file.data], { type: 'image/*' });
		await state.uploadUrls.add(file.name, URL.createObjectURL(blob));
	}
}

async function sendSaveToElectron(
	saveName: string,
	ipcRenderer: IpcRenderer
): Promise<EnvStorageEntry> {
	const saveBlob = new Blob([await state.getSave(false)], {
		type: 'text/plain',
	});
	await ipcRenderer.sendConvo(
		'save-states.file',
		saveName,
		'save.dddg',
		await saveBlob.arrayBuffer()
	);

	for (const [name, url] of Object.entries(state.uploadUrls.urls)) {
		const fileLoader = await fetch(url);
		const blob = await fileLoader.blob();
		await ipcRenderer.sendConvo(
			'save-states.file',
			saveName,
			name,
			await blob.arrayBuffer()
		);
	}

	return (await ipcRenderer.sendConvo(
		'save-states.end',
		saveName
	)) as EnvStorageEntry;
}

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

interface IElectronWindow {
	isElectron: boolean;
	ipcRenderer: IpcRenderer;
}

interface IpcRenderer {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	on(channel: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onConversation(channel: string, listener: (...args: any[]) => void): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	send(channel: string, ...args: any[]): void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sendConvo<T>(channel: string, ...args: any[]): Promise<T>;
}
