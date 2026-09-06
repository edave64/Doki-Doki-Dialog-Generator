/**
 * Environments are DDDGs way of handling different runtime environments.
 * These are mainly a web browser or the dddg-desktop electron app.
 *
 * This file describes the common interfaces, other files in this folder
 * implement them for specific environments.
 */

import type { IRootState } from '@/store/root';
import type { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import type { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import type { ContentPack } from '@edave64/doki-doki-dialog-generator-pack-format/dist/v2/model';
import { isTauri } from '@tauri-apps/api/core';
import type { DeepReadonly } from 'ts-essentials';
import type { Ref } from 'vue';
import { Browser } from './browser';
import { OldEdge } from './edge';
import { Electron } from './electron';
//import { Tauri } from './tauri';

export type Folder = 'downloads' | 'sprites' | 'backgrounds';

export interface IEnvironment {
	readonly localRepositoryUrl: string;
	readonly gameMode: 'ddlc' | 'ddlc_plus' | null;
	readonly state: EnvState;
	readonly supports: DeepReadonly<EnvCapabilities>;
	/**
	 * null if updating isn't supported on the system.
	 * ref('none') if no update is available
	 * ref('wait') if we are currently checking if an update is available
	 * ref('done') if there an update is successfully downloaded
	 * ref(0-100)
	 */
	readonly updateProgress: Ref<number | 'done' | 'none' | 'wait'> | null;
	savingEnabled: boolean;

	/**
	 * This call enables the environment to load content packs. Note that these callbacks are
	 * retained. Even after the promise resolves, the callbacks will be called.
	 */
	loadEnvironmentPacks(
		loadContentPack: (packIdWithRepo: string[]) => Promise<void>,
		replaceContentPack: (contentPack: ContentPack<string>) => Promise<void>
	): Promise<void>;

	saveToFile(
		canvas: HTMLCanvasElement,
		filename: string,
		format?: string,
		quality?: number
	): Promise<string>;
	updateDownloadFolder(): void;
	openFolder(folder: Folder): void;
	prompt(message: string, defaultValue?: string): Promise<string | null>;
	onPanelChange(handler: (panel: string) => void): void;

	localRepoInstall(
		url: string,
		repo: IPack,
		authors: IAuthors
	): Promise<void>;
	localRepoUninstall(id: string): Promise<void>;

	autoLoadAdd(id: string): Promise<void>;
	autoLoadRemove(id: string): Promise<void>;
	getAutoloads(): Promise<string[]>;

	loadDefaultTemplate(state: IRootState): Promise<boolean>;
	saveDefaultTemplate(state: IRootState): Promise<void>;
	clearDefaultTemplate(): Promise<void>;

	saveSettings(settings: Settings): Promise<void>;
	loadSettings(): Promise<Settings>;
	loadGameMode(): Promise<void>;
	setGameMode(mode: IEnvironment['gameMode']): Promise<void>;

	storeSaveFile(save: Blob, defaultName: string): Promise<void>;

	openNewWindow(): Window | null;

	storage: EnvStorage;
}

export interface EnvStorage {
	getSaves(): EnvStorageEntry[];
	save(state: IRootState, name: string): Promise<EnvStorageEntry>;
	load(state: IRootState, name: string): Promise<void>;
	delete(name: string): Promise<void>;
	downloadAsZip(name: string): Promise<void>;
	uploadFromZip(name: string, zip: Blob): Promise<void>;
	requestPersistance(): Promise<boolean>;
	isPersisted(): boolean;
}

export interface EnvStorageEntry {
	name: string;
	size: number;
	timestamp: Date;
}

export interface EnvState {
	looseTextParsing: boolean;
	autoLoads: string[];
	downloadLocation: string;
	hasTemplate: boolean;
	templateSaveContentPacks: string[];
}

export interface EnvCapabilities {
	setDownloadFolder: boolean;
	optionalSaving: boolean;
	autoLoading: boolean;
	localRepo: boolean;
	backgroundInstall: boolean;
	lq: boolean;
	openableFolders: ReadonlySet<Folder>;
	assetCaching: boolean;
	limitedCanvasSpace: boolean;
	storage: boolean;
}

export interface Settings {
	lq?: boolean;
	nsfw?: boolean;
	darkMode?: boolean;
	defaultCharacterTalkingZoom?: boolean;
	looseTextParsing?: boolean;
}

function chooseEnv(): IEnvironment {
	if (window.isElectron) {
		return new Electron();
	}
	if (isTauri()) {
		//return new Tauri();
	}
	if ('msSaveOrOpenBlob' in window.navigator) {
		return new OldEdge();
	}
	return new Browser();
}

const envX = chooseEnv();

export default envX;
