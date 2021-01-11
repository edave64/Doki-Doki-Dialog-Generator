import { EnvCapabilities, IEnvironment, IPack, Settings } from './environment';
import { Background } from '@/renderables/background';
import { EnvState } from './envState';
import { DeepReadonly, reactive, ref } from 'vue';

export class Browser implements IEnvironment {
	public readonly state: EnvState = reactive({
		installed: [],
		autoAdd: [],
	});

	public readonly supports: DeepReadonly<EnvCapabilities>;

	private readonly isSavingEnabled = ref(false);

	public readonly localRepositoryUrl = '';

	private loading: Promise<void>;
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

		window.addEventListener('beforeunload', function(e) {
			// Cancel the event
			e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
			// Chrome requires returnValue to be set
			e.returnValue =
				'Are you sure you want to leave? All your progress will be lost!';
		});

		const supports = reactive({
			optionalSaving: canSave,
			get autoLoading(): boolean {
				return canSave && self.isSavingEnabled.value;
			},
			backgroundInstall: false,
			localRepo: false,
			lq: true,
		});

		this.supports = supports;

		if (canSave) {
			this.loading = (async () => {
				const exists = await IndexedDBHandler.doesDbExists();
				this.savingEnabled = exists;
			})();
		} else {
			this.loading = Promise.resolve();
		}
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

	public installBackground(background: Background): boolean {
		throw new Error('This environment does not support installing backgrounds');
	}

	public uninstallBackground(background: Background): boolean {
		throw new Error(
			'This environment does not support uninstalling backgrounds'
		);
	}

	public localRepoInstall(url: string): void {
		throw new Error('This environment does not support a local repository');
	}

	public localRepoUninstall(id: string): void {
		throw new Error('This environment does not support a local repository');
	}

	public autoLoadAdd(id: string): void {
		throw new Error('This environment does not support auto loading');
	}

	public autoLoadRemove(id: string): void {
		throw new Error('This environment does not support auto loading');
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
		return new Promise((resolve, reject) => {
			resolve(prompt(message, defaultValue));
		});
	}

	public onPanelChange(handler: (panel: string) => void): void {
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
					blob => {
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
	indexedDB: (window.indexedDB ||
		(window as any).mozIndexedDB ||
		(window as any).webkitIndexedDB ||
		(window as any).msIndexedDB) as IDBFactory,
	transaction: ((window.IDBTransaction as any) ||
		(window as any).webkitIDBTransaction ||
		(window as any).msIDBTransaction) as IDBTransaction,

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
			const req = IndexedDBHandler.indexedDB.open('dddg', 1);
			req.onerror = event => {
				reject(event);
			};
			req.onupgradeneeded = event => {
				const db = (event.target! as any).result as IDBDatabase;
				const oldVer = event.oldVersion ?? ((event as any).version as number);
				if (oldVer < 1) {
					db.createObjectStore('settings');
				}
			};
			req.onsuccess = event => {
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
			const req = IndexedDBHandler.indexedDB.deleteDatabase('dddg');
			IndexedDBHandler.db = null;
			req.onerror = event => {
				reject(event);
			};
			req.onsuccess = event => {
				resolve();
			};
		});
	},

	saveSettings<T>(settings: T): Promise<void> {
		if (!this.db) return Promise.reject('No database');
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const transact = (await this.db!).transaction(['settings'], 'readwrite');
			const store = transact.objectStore('settings');
			const req = store.put({ ...settings }, 0);
			req.onerror = error => {
				reject(error);
			};
			req.onsuccess = () => {
				resolve();
			};
		});
	},

	loadSettings<T>(): Promise<T> {
		if (!this.db) return Promise.reject('No database');
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve, reject) => {
			const transact = (await this.db!).transaction(['settings'], 'readonly');
			const store = transact.objectStore('settings');
			const req = store.get(0);
			req.onerror = error => {
				reject(error);
			};
			req.onsuccess = event => {
				resolve(req.result || {});
			};
		});
	},
};
