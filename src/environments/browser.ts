import { Repo } from '@/models/repo';
import { transaction } from '@/plugins/vuex-history';
import type { IRootState } from '@/store';
import { reactive, ref, type DeepReadonly } from 'vue';
import { Store } from 'vuex';
import type {
	EnvCapabilities,
	EnvState,
	IEnvironment,
	Settings,
} from './environment';

const ua = navigator.userAgent;
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const webkit = !!ua.match(/WebKit/i);

const mobileSafari = iOS && webkit && !ua.match(/CriOS/i);

export class Browser implements IEnvironment {
	public readonly state: EnvState = reactive({
		looseTextParsing: true,
		autoAdd: [],
		downloadLocation: 'Default download folder',
		hasTemplate: false,
	});
	public readonly supports: DeepReadonly<EnvCapabilities>;

	public get gameMode(): 'ddlc' | 'ddlc_plus' | null {
		return this._gameMode;
	}

	private _gameMode: 'ddlc' | 'ddlc_plus' | null = null;

	private $store: Store<DeepReadonly<IRootState>> | null = null;

	private readonly isSavingEnabled = ref(false);

	public readonly localRepositoryUrl = '';

	private readonly loading: Promise<void>;
	private creatingDB?: Promise<IDBDatabase | void>;

	private readonly loadingContentPacksAllowed: Promise<void>;
	public loadContentPacks!: () => void;

	public updateProgress = null;

	public get savingEnabled() {
		return this.isSavingEnabled.value;
	}

	public set savingEnabled(value: boolean) {
		if (value) {
			localStorage.setItem('saving', 'true');
			this.creatingDB = IndexedDBHandler.createDB();
			this.creatingDB!.then(() => {
				this.creatingDB = undefined;
				this.isSavingEnabled.value = true;
			}).catch(() => {});
		} else {
			// I'm not just setting 'saving' to false because I want there to
			// be absolutely no trace if you revoke saving.
			localStorage.clear();
			this.isSavingEnabled.value = false;
			this.creatingDB = IndexedDBHandler.clearDB()
				.then(() => {
					this.creatingDB = undefined;
				})
				.catch(() => {});
		}
	}

	constructor() {
		const canSave = IndexedDBHandler.canSave();
		const isSavingEnabled = this.isSavingEnabled;

		window.addEventListener('beforeunload', (e) => {
			// Cancel the event
			e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
			// Chrome requires returnValue to be set
			e.returnValue =
				'Are you sure you want to leave? All your progress will be lost!';
		});

		this.loadingContentPacksAllowed = new Promise((resolve) => {
			this.loadContentPacks = () => resolve();
		});

		this.supports = reactive({
			optionalSaving: canSave,
			get autoLoading(): boolean {
				return canSave && isSavingEnabled.value;
			},
			backgroundInstall: false,
			localRepo: false,
			lq: true,
			setDownloadFolder: false,
			openableFolders: new Set([]),
			assetCaching: !mobileSafari,
			allowWebP: true,
			limitedCanvasSpace: mobileSafari,
		});

		if (canSave) {
			this.loading = (async () => {
				this.savingEnabled = await IndexedDBHandler.doesDbExists();
			})();
		} else {
			this.loading = Promise.resolve();
		}

		this.loading.then(async () => {
			await this.loadingContentPacksAllowed;
			if (this.creatingDB) await this.creatingDB;
			if (this.savingEnabled) {
				const autoload = (await IndexedDBHandler.loadAutoload()) ?? [];
				this.state.autoAdd = autoload;
				const repo = await Repo.getInstance();
				const packUrls = await Promise.all(
					autoload.map(async (compoundId) => {
						const [id, url] = compoundId.split(';', 2) as [
							string,
							string?,
						];
						if (url != null && !repo.hasPack(id)) {
							await repo.loadTempPack(url);
						}
						const pack = repo.getPack(id)!;
						return pack.dddg2Path ?? pack.dddg1Path;
					})
				);
				await transaction(async () => {
					await this.$store!.dispatch(
						'content/loadContentPacks',
						packUrls
					);
				});
			}
		});
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
		const searchParams = new URLSearchParams(location.search);
		const getMode = searchParams.get('mode');
		if (getMode === 'ddlc' || getMode === 'ddlc_plus') {
			this._gameMode = getMode;
			return;
		}

		await this.loading;
		await this.creatingDB;
		let stored: string = '';
		if (this.isSavingEnabled.value) {
			stored = await IndexedDBHandler.loadGameMode();
		}
		let value: this['gameMode'] = 'ddlc';
		if (stored === 'ddlc' || stored === 'ddlc_plus') {
			value = stored;
		}
		this._gameMode = value;
	}

	public async setGameMode(mode: Browser['gameMode']): Promise<void> {
		if (this.isSavingEnabled.value) {
			await IndexedDBHandler.saveGameMode(mode);
		}
		const baseLoc = `${location.protocol}//${location.host}${location.pathname}`;
		location.href = `${baseLoc}?mode=${mode}`;
	}

	updateDownloadFolder(): void {
		throw new Error('Method not implemented.');
	}

	openFolder(): void {
		throw new Error('Method not implemented.');
	}

	public connectToStore(store: Store<DeepReadonly<IRootState>>) {
		this.$store = store;
	}

	public async saveToFile(
		downloadCanvas: HTMLCanvasElement,
		filename: string,
		format = 'image/png',
		quality = 1
	): Promise<string> {
		const a = document.createElement('a');
		a.setAttribute('download', filename);
		const url = await this.createObjectURL(downloadCanvas, format, quality);
		a.setAttribute('href', url);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		return url;
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
		await this.loading;
		await this.creatingDB;
		await IndexedDBHandler.saveAutoload([...this.state.autoAdd, id]);
		this.state.autoAdd.push(id);
	}

	public async autoLoadRemove(id: string): Promise<void> {
		await this.loading;
		await this.creatingDB;

		const packId = this.normalizePackId(id);

		await IndexedDBHandler.saveAutoload(
			this.state.autoAdd.filter((x) => this.normalizePackId(x) != packId)
		);
		const idx = this.state.autoAdd.indexOf(id);
		this.state.autoAdd.splice(idx, 1);
	}

	public normalizePackId(id: string): string {
		const parts = id.split(';');
		if (parts.length === 1) {
			return parts[0];
		}
		return parts[parts.length - 1];
	}

	public async loadSettings(): Promise<Settings> {
		await this.loading;
		await this.creatingDB;
		const base: Settings = {
			darkMode: undefined,
			lq: true,
			nsfw: false,
			defaultCharacterTalkingZoom: true,
			looseTextParsing: true,
		};
		if (!this.isSavingEnabled.value) return base;
		return {
			...base,
			...(await IndexedDBHandler.loadSettings()),
		};
	}

	public async saveSettings(settings: Settings): Promise<void> {
		await this.loading;
		await this.creatingDB;
		if (!this.isSavingEnabled.value) return;
		await IndexedDBHandler.saveSettings(settings);
	}

	public async loadDefaultTemplate(): Promise<boolean> {
		await this.loading;
		await this.creatingDB;
		if (!this.isSavingEnabled.value) return false;
		const data = await IndexedDBHandler.loadTemplate();
		if (data == null) return false;
		this.state.hasTemplate = true;
		await this.$store?.dispatch('loadSave', data);
		return true;
	}

	public async saveDefaultTemplate(): Promise<void> {
		await this.loading;
		await this.creatingDB;
		if (!this.isSavingEnabled.value) return;
		const data: string = await this.$store?.dispatch('getSave', true);
		IndexedDBHandler.saveTemplate(data);
		this.state.hasTemplate = true;
	}

	public async clearDefaultTemplate(): Promise<void> {
		await this.loading;
		await this.creatingDB;
		if (!this.isSavingEnabled.value) return;
		await IndexedDBHandler.saveTemplate(null);
		this.state.hasTemplate = false;
	}

	public async isInitialized(): Promise<void> {
		await this.loading;
		await this.creatingDB;
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
}

const IndexedDBHandler = {
	indexedDB: (() => {
		try {
			return (
				window.indexedDB ??
				window.mozIndexedDB ??
				window.webkitIndexedDB ??
				window.msIndexedDB ??
				null
			);
		} catch {
			return null;
		}
	})(),
	transaction: (() => {
		try {
			return (
				window.IDBTransaction ??
				window.mozIDBTransaction ??
				window.webkitIDBTransaction ??
				window.msIDBTransaction ??
				null
			);
		} catch {
			return null;
		}
	})(),
	db: null as null | Promise<IDBDatabase>,

	canSave(): boolean {
		return !!(IndexedDBHandler.indexedDB && window.localStorage != null);
	},

	// Optimally, this could just check if the database exists. But sadly, that's not standard. So we need to bring
	// localstorage into this. :/
	doesDbExists(): Promise<boolean> {
		const saving = localStorage.getItem('saving');
		if (saving === 'true') {
			return Promise.resolve(true);
		}
		return Promise.resolve(false);
	},

	createDB(): Promise<IDBDatabase> {
		if (IndexedDBHandler.db) return IndexedDBHandler.db;
		return (IndexedDBHandler.db = new Promise((resolve, reject) => {
			const req = IndexedDBHandler.indexedDB!.open('dddg', 3);
			req.onerror = (event) => {
				reject(event);
			};
			req.onupgradeneeded = (event) => {
				const db = req.result;
				const oldVer =
					event.oldVersion ??
					// Fallback for old apis
					event.version;
				if (oldVer < 1) {
					db.createObjectStore('settings');
				}
				if (oldVer === 1) {
					db.deleteObjectStore('settings');
					db.createObjectStore('settings');
				}
			};
			req.onsuccess = () => {
				resolve(req.result);
			};
		}));
	},

	clearDB(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!IndexedDBHandler.db) {
				resolve();
				return;
			}
			const req = IndexedDBHandler.indexedDB!.deleteDatabase('dddg');
			IndexedDBHandler.db = null;
			req.onerror = (event) => {
				reject(event);
			};
			req.onsuccess = () => {
				resolve();
			};
		});
	},

	loadAutoload(): Promise<string[]> {
		return this.objectStorePromise('readonly', async (store) => {
			return await this.reqPromise<string[]>(store.get('autoload'));
		});
	},
	saveAutoload(autoloads: string[]): Promise<void> {
		return this.objectStorePromise('readwrite', async (store) => {
			await this.reqPromise(store.put([...autoloads], 'autoload'));
		});
	},

	loadGameMode(): Promise<string> {
		return this.objectStorePromise('readonly', async (store) => {
			return await this.reqPromise<string>(store.get('gameMode'));
		});
	},
	saveGameMode(mode: IEnvironment['gameMode']): Promise<void> {
		return this.objectStorePromise('readwrite', async (store) => {
			await this.reqPromise(store.put(mode, 'gameMode'));
		});
	},

	saveTemplate(data: string | null): Promise<void> {
		return this.objectStorePromise('readwrite', async (store) => {
			if (data == null) {
				await this.reqPromise(store.delete('template'));
			} else {
				await this.reqPromise(store.put(data, 'template'));
			}
		});
	},

	loadTemplate(): Promise<string> {
		return this.objectStorePromise('readonly', async (store) => {
			return await this.reqPromise<string>(store.get('template'));
		});
	},

	saveSettings<T>(settings: T): Promise<void> {
		return this.objectStorePromise('readwrite', async (store) => {
			await this.reqPromise(store.put({ ...settings }, 'settings'));
		});
	},

	loadSettings<T>(): Promise<T> {
		return this.objectStorePromise('readonly', async (store) => {
			return await this.reqPromise<T>(store.get('settings'));
		});
	},

	async objectStorePromise<T>(
		mode: 'readonly' | 'readwrite',
		callback: (store: IDBObjectStore) => Promise<T>
	): Promise<T> {
		const db = await this.db;
		if (!db) throw new Error('No database');
		const transact = db.transaction(['settings'], mode);
		const store = transact.objectStore('settings');
		return await callback(store);
	},

	/**
	 * Turns a database request into a promise to more easily use it in asyncronous code
	 */
	reqPromise<T>(req: IDBRequest<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			req.onerror = (error) => {
				reject(error);
			};
			req.onsuccess = () => {
				resolve(req.result);
			};
		});
	},
};
