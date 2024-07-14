declare interface Window {
	isElectron: boolean | undefined;

	// Possibly defined, used for feature detection
	/** @deprecated */
	mozIndexedDB: Window['indexedDB'];
	/** @deprecated */
	webkitIndexedDB: Window['indexedDB'];
	/** @deprecated */
	msIndexedDB: Window['indexedDB'];

	// Possibly defined, used for feature detection
	/** @deprecated */
	mozIDBTransaction: typeof IDBTransaction;
	/** @deprecated */
	webkitIDBTransaction: typeof IDBTransaction;
	/** @deprecated */
	msIDBTransaction: typeof IDBTransaction;

	// Testing probes
	assetCache: {
		get(url: string): Promise<import('./render-utils/assets/asset').IAsset>;
		remove(url: string): void;
	};
	repo: import('./models/repo').Repo;
	env: import('./environments/environment').IEnvironment;
	store: import('vuex').Store<
		import('vue').DeepReadonly<import('./store').IRootState>
	>;
}

declare interface Navigator {
	/** @deprecated */
	msSaveBlob?: (blob: Blob, filename: string) => void;
}

declare interface IDBVersionChangeEvent {
	/** @deprecated */
	version?: number;
}
