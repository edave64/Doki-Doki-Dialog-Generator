/**
 * This file implements the environment for the web browser.
 */

import eventBus, {
	FailureEvent,
	ResolvableErrorEvent,
	ShowMessageEvent,
} from '@/eventbus/event-bus';
import { transaction } from '@/history-engine/transaction';
import { Repo } from '@/models/repo';
import type { ReplaceContentPackAction } from '@/store/content';
import { state } from '@/store/root';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { reactive, ref } from 'vue';
import type {
	EnvCapabilities,
	EnvState,
	EnvStorageEntry,
	IEnvironment,
	Settings,
} from './environment';

const ua = navigator.userAgent;
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const webkit = !!ua.match(/WebKit/i);
const mobileSafari = iOS && webkit && !ua.match(/CriOS/i);

export class Tauri implements IEnvironment {
	public readonly state: EnvState = reactive({
		looseTextParsing: true,
		autoAdd: [],
		downloadLocation: '',
		hasTemplate: false,
	});

	public readonly supports: EnvCapabilities = {
		autoLoading: true,
		backgroundInstall: true,
		localRepo: true,
		lq: false,
		optionalSaving: false,
		setDownloadFolder: true,
		openableFolders: new Set(['downloads', 'backgrounds', 'sprites']),
		assetCaching: !mobileSafari,
		limitedCanvasSpace: mobileSafari,
		storage: true,
	};

	public storage = (() => {
		return {
			getSaves() {
				return [];
			},
			async save(name: string): Promise<EnvStorageEntry> {
				return {
					name,
					size: 0,
					timestamp: new Date(),
				};
			},
			async load(_name: string): Promise<void> {
				return;
			},
			async downloadAsZip(_name: string): Promise<void> {
				return;
			},
			async uploadFromZip(_name: string, _zip: Blob): Promise<void> {
				return;
			},

			async delete(_name: string) {
				return;
			},
			async requestPersistance(): Promise<boolean> {
				return false;
			},
			isPersisted(): boolean {
				return false;
			},
		};
	})();

	public get gameMode(): 'ddlc' | 'ddlc_plus' | null {
		return this._gameMode;
	}

	private _gameMode: 'ddlc' | 'ddlc_plus' | null = null;

	private readonly isSavingEnabled = ref(false);

	public readonly localRepositoryUrl = '';

	private readonly loadingContentPacksAllowed: Promise<void>;
	public loadContentPacks!: () => void;

	public updateProgress = ref('wait' as 'wait' | 'none' | 'done' | number);

	public readonly savingEnabled: boolean = true;
	private readonly loadingConfig: Promise<Settings>;
	private readonly loadingGameMode: Promise<IEnvironment['gameMode']>;

	constructor() {
		this.loadingContentPacksAllowed = new Promise((resolve) => {
			this.loadContentPacks = () => resolve();
		});

		const loadingConfig = Promise.withResolvers<Settings>();
		const loadingGameMode =
			Promise.withResolvers<IEnvironment['gameMode']>();

		this.loadingConfig = loadingConfig.promise;
		this.loadingGameMode = loadingGameMode.promise;

		(async () => {
			await listen<string>(
				'add-persistent-content-pack',
				async (event) => {
					const filePath = event.payload;
					await this.loadingContentPacksAllowed;
					await transaction(async () => {
						await state.content.loadContentPacks(filePath);
					});
				}
			);
			await listen<string>('push-message', (event) => {
				const message = event.payload;
				eventBus.fire(new ShowMessageEvent(message));
			});
			await listen<string>('config:downloadFolderUpdate', (event) => {
				const location = event.payload;
				this.state.downloadLocation = location;
			});
			await listen<Settings & { gameMode: IEnvironment['gameMode'] }>(
				'config:loaded',
				(event) => {
					const { gameMode, ...settings } = event.payload;
					loadingGameMode.resolve(gameMode ?? 'ddlc');
					loadingConfig.resolve(settings);
				}
			);
			await listen<string[]>('load-packs', async (event) => {
				const packIds = event.payload;
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
			});
			await listen<string[]>('auto-load:changed', (event) => {
				const packIds = event.payload;
				this.state.autoLoads = packIds;
			});
			await listen<void>('reload-repo', async (_) => {
				await (await Repo.getInstance()).reloadLocalRepo();
			});
			await listen<ContentPack<string>>('replace-pack', async (event) => {
				const contentPack = event.payload;
				const action: ReplaceContentPackAction = {
					processed: false,
					contentPack,
				};
				await transaction(async () => {
					await state.content.replaceContentPack(action);
				});
			});
			await listen<{ message: string; actions: string[]; id: string }>(
				'resolvable-error',
				(event) => {
					const { message, actions, id } = event.payload;
					eventBus.fire(
						new ResolvableErrorEvent(
							message,
							actions.map((action) => ({
								exec: () =>
									invoke('resolve-error', { id, action }),
								name: action,
							}))
						)
					);
				}
			);
			let updateNotified = false;
			await listen<number | 'done'>('update:progress', (event) => {
				const progress = event.payload;
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
			});
			await listen<void>('update:checkStopped', (_) => {
				this.updateProgress.value = 'none';
			});
			invoke('init_dddg');
		})();
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

	public async loadGameMode(): Promise<void> {
		await this.loadingGameMode;
	}

	public async setGameMode(mode: Tauri['gameMode']): Promise<void> {
		await invoke('set_game_mode', { mode });
		await invoke('reload');
	}

	updateDownloadFolder(): void {
		throw new Error('Method not implemented.');
	}

	openFolder(): void {
		throw new Error('Method not implemented.');
	}

	openNewWindow(): Window | null {
		const win = window.open(undefined, '_blank', 'left=100,top=100');
		if (!win) return null;
		if (win.closed) return null;
		return win;
	}

	public async saveToFile(
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
					await invoke('save_image', {
						filename,
						buffer: new Uint8Array(buffer),
					});
					resolve(URL.createObjectURL(blob));
				},
				format,
				quality
			);
		});
	}

	public localRepoInstall(): Promise<void> {
		return Promise.reject(
			new Error('This environment does not support a local repository')
		);
	}

	public localRepoUninstall(): Promise<void> {
		throw new Error('This environment does not support a local repository');
	}

	public async autoLoadAdd(id: string): Promise<void> {
		await invoke('auto-load.add', { id });
		this.state.autoLoads.push(id);
	}

	public async autoLoadRemove(id: string): Promise<void> {
		await invoke('auto-load.remove', { id });
		const idx = this.state.autoLoads.indexOf(id);
		this.state.autoLoads.splice(idx, 1);
	}

	public async loadSettings(): Promise<Settings> {
		const base: Settings = {
			darkMode: undefined,
			lq: true,
			nsfw: false,
			defaultCharacterTalkingZoom: true,
			looseTextParsing: true,
		};
		return {
			...base,
			...(await this.loadingConfig),
		};
	}

	public async saveSettings(settings: Settings): Promise<void> {
		await invoke('config.set', settings as Record<string, unknown>);
	}

	public async loadDefaultTemplate(): Promise<boolean> {
		const files = (await invoke('save_states_load_default')) as
			| { name: string; data: ArrayBuffer }[]
			| null;

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

	public async saveDefaultTemplate(): Promise<void> {
		await invoke('save-states.default-begin');
		// For default saves, we must send the name 'default'.
		// Otherwise electron will reject the save.
		await sendSaveToElectron('default');
		this.state.hasTemplate = true;
	}

	public async clearDefaultTemplate(): Promise<void> {
		await invoke('save-states.default-begin');
		await invoke('save-states.end', { saveName: 'default' });
		this.state.hasTemplate = false;
	}

	public prompt(
		message: string,
		defaultValue?: string
	): Promise<string | null> {
		return new Promise((resolve) => {
			resolve(prompt(message, defaultValue));
		});
	}

	public onPanelChange(): void {}

	protected createObjectURL(
		canvas: HTMLCanvasElement,
		format: string,
		quality: number
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const canCreateObjectUrl =
				window.URL != null && window.URL.createObjectURL != null;
			if (!canCreateObjectUrl)
				return resolve(canvas.toDataURL(format, quality));

			if (canvas.toBlob != null) {
				canvas.toBlob(
					(blob) => {
						if (!blob) {
							reject();
							return;
						}
						resolve(URL.createObjectURL(blob));
					},
					format,
					quality
				);
			} else {
				const url = canvas.toDataURL(format, quality);
				const blob = this.dataURItoBlob(url, format);
				resolve(URL.createObjectURL(blob));
			}
		});
	}

	protected dataURItoBlob(dataURI: string, type: string) {
		const binStr = atob(dataURI.split(',')[1]);
		const len = binStr.length;
		const arr = new Uint8Array(len);

		for (let i = 0; i < len; i++) {
			arr[i] = binStr.charCodeAt(i);
		}

		return new Blob([arr], { type });
	}

	private bgInvalidation: number | null = null;

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

async function sendSaveToElectron(saveName: string): Promise<EnvStorageEntry> {
	const saveBlob = new Blob([await state.getSave(false)], {
		type: 'text/plain',
	});
	await invoke('save-states.file', {
		saveName,
		fileName: 'save.dddg',
		buffer: await saveBlob.arrayBuffer(),
	});

	for (const [name, url] of Object.entries(state.uploadUrls.urls)) {
		const fileLoader = await fetch(url);
		const blob = await fileLoader.blob();
		await invoke('save-states.file', {
			saveName,
			fileName: name,
			buffer: await blob.arrayBuffer(),
		});
	}

	return (await invoke('save-states.end', { saveName })) as EnvStorageEntry;
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
