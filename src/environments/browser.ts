import { EnvCapabilities, Folder, IEnvironment, Settings } from './environment';
import { Background } from '@/renderables/background';
import { EnvState } from './envState';
import { DeepReadonly, reactive, ref } from 'vue';
import { Repo } from '@/models/repo';
import { IHistorySupport } from '@/plugins/vuex-history';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { IPack } from '@edave64/dddg-repo-filters/dist/pack';

export class Browser implements IEnvironment {
	public readonly state: EnvState = reactive({
		autoAdd: [],
		downloadLocation: 'Default download folder',
	});
	public readonly supports: DeepReadonly<EnvCapabilities>;

	public get gameMode(): 'ddlc' | 'ddlc_plus' | null {
		return this._gameMode;
	}

	private _gameMode: 'ddlc' | 'ddlc_plus' | null = null;

	private vuexHistory: IHistorySupport | null = null;
	private $store: Store<DeepReadonly<IRootState>> | null = null;

	private readonly isSavingEnabled = ref(false);

	public readonly localRepositoryUrl = '';

	private readonly loading: Promise<void>;
	private creatingDB?: Promise<IDBDatabase | void>;

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
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		const canSave = IndexedDBHandler.canSave();

		window.addEventListener('beforeunload', function (e) {
			// Cancel the event
			e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
			// Chrome requires returnValue to be set
			e.returnValue =
				'Are you sure you want to leave? All your progress will be lost!';
		});

		this.supports = reactive({
			optionalSaving: canSave,
			get autoLoading(): boolean {
				return canSave && self.isSavingEnabled.value;
			},
			backgroundInstall: false,
			localRepo: false,
			lq: true,
			setDownloadFolder: false,
			openableFolders: new Set([]),
		});

		if (canSave) {
			this.loading = (async () => {
				this.savingEnabled = await IndexedDBHandler.doesDbExists();
			})();
		} else {
			this.loading = Promise.resolve();
		}

		this.loading.then(async () => {
			if (this.creatingDB) await this.creatingDB;
			if (this.savingEnabled) {
				const autoload = (await IndexedDBHandler.loadAutoload()) || [];
				this.state.autoAdd = autoload;
				const repo = await Repo.getInstance();
				const packUrls = await Promise.all(
					autoload.map(async (compoundId) => {
						const [id, url] = compoundId.split(';', 2) as [string, string?];
						if (url && !repo.hasPack(id)) {
							await repo.loadTempPack(url);
						}
						const pack = repo.getPack(id);
						return pack.dddg2Path || pack.dddg1Path;
					})
				);
				await this.vuexHistory!.transaction(async () => {
					await this.$store!.dispatch('content/loadContentPacks', packUrls);
				}, true);
			}
		});
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

	openFolder(_folder: Folder): void {
		throw new Error('Method not implemented.');
	}

	public connectToStore(
		vuexHistory: IHistorySupport,
		store: Store<DeepReadonly<IRootState>>
	) {
		this.vuexHistory = vuexHistory;
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

	public installBackground(_background: Background): boolean {
		throw new Error('This environment does not support installing backgrounds');
	}

	public uninstallBackground(_background: Background): boolean {
		throw new Error(
			'This environment does not support uninstalling backgrounds'
		);
	}

	public localRepoInstall(
		_url: string,
		_repo: IPack,
		_authors: IAuthors
	): void {
		throw new Error('This environment does not support a local repository');
	}

	public localRepoUninstall(_id: string): void {
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

	public async isInitialized(): Promise<void> {
		await this.loading;
		await this.creatingDB;
	}

	public prompt(
		message: string,
		defaultValue?: string
	): Promise<string | null> {
		return new Promise((resolve, _reject) => {
			resolve(prompt(message, defaultValue));
		});
	}

	public onPanelChange(_handler: (panel: string) => void): void {
		return;
	}

	protected createObjectURL(
		canvas: HTMLCanvasElement,
		format: string,
		quality: number
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const canCreateObjectUrl = !!(window.URL && window.URL.createObjectURL);
			if (!canCreateObjectUrl)
				return resolve(canvas.toDataURL(format, quality));

			if (canvas.toBlob) {
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
			return (window.indexedDB ||
				(window as any).mozIndexedDB ||
				(window as any).webkitIndexedDB ||
				(window as any).msIndexedDB) as IDBFactory;
		} catch (e) {
			return null;
		}
	})(),
	transaction: (() => {
		try {
			return ((window.IDBTransaction as any) ||
				(window as any).webkitIDBTransaction ||
				(window as any).msIDBTransaction) as IDBTransaction;
		} catch (e) {
			return null;
		}
	})(),
	db: null as null | Promise<IDBDatabase>,

	canSave(): boolean {
		return !!(IndexedDBHandler.indexedDB && window.localStorage);
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
				const db = (event.target! as any).result as IDBDatabase;
				const oldVer = event.oldVersion ?? ((event as any).version as number);
				if (oldVer < 1) {
					db.createObjectStore('settings');
				}
				if (oldVer === 1) {
					db.deleteObjectStore('settings');
					db.createObjectStore('settings');
				}
			};
			req.onsuccess = (_event) => {
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
			req.onsuccess = (_event) => {
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

	objectStorePromise<T>(
		mode: 'readonly' | 'readwrite',
		callback: (store: IDBObjectStore) => Promise<T>
	): Promise<T> {
		if (!this.db) return Promise.reject(new Error('No database'));
		return new Promise(async (resolve, reject) => {
			const transact = (await this.db!).transaction(['settings'], mode);
			const store = transact.objectStore('settings');

			try {
				resolve(await callback(store));
			} catch (e) {
				reject(e);
			}
		});
	},

	/**
	 * Turns a database request into a promise to more easily use it in asyncronous code
	 */
	reqPromise<T>(req: IDBRequest<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			req.onerror = (error) => {
				reject(error);
			};
			req.onsuccess = (_event) => {
				resolve(req.result);
			};
		});
	},
};
