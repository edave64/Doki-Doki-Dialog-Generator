import type { IRootState } from '@/store';
import type { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import type { IPack } from '@edave64/dddg-repo-filters/dist/pack';
import type { DeepReadonly } from 'ts-essentials';
import type { Ref } from 'vue';
import { Store } from 'vuex';
import { Browser } from './browser';
import { OldEdge } from './edge';
import { Electron } from './electron';

export type Folder = 'downloads' | 'sprites' | 'backgrounds';

export interface EnvState {
	looseTextParsing: boolean;
	autoAdd: string[];
	downloadLocation: string;
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
	allowWebP: boolean;
	limitedCanvasSpace: boolean;
}

export interface Settings {
	lq?: boolean;
	nsfw?: boolean;
	darkMode?: boolean;
	defaultCharacterTalkingZoom?: boolean;
	looseTextParsing?: boolean;
}

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

	localRepoInstall(url: string, repo: IPack, authors: IAuthors): Promise<void>;
	localRepoUninstall(id: string): Promise<void>;
	autoLoadAdd(id: string): Promise<void>;
	autoLoadRemove(id: string): Promise<void>;

	loadContentPacks(): void;

	saveSettings(settings: Settings): Promise<void>;
	loadSettings(): Promise<Settings>;
	loadGameMode(): Promise<void>;
	setGameMode(mode: IEnvironment['gameMode']): Promise<void>;

	storeSaveFile(save: Blob, defaultName: string): Promise<void>;

	connectToStore(store: Store<DeepReadonly<IRootState>>): void;
}

function chooseEnv(): IEnvironment {
	if (window.isElectron) {
		return new Electron();
	}
	if ('msSaveOrOpenBlob' in window.navigator) {
		return new OldEdge();
	}
	return new Browser();
}

const envX = chooseEnv();

export default envX;
