import { OldEdge } from './edge';
import { Browser } from './browser';
import { Electron } from './electron';
import { EnvState } from './envState';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { DeepReadonly } from 'ts-essentials';
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { IPack } from '@edave64/dddg-repo-filters/dist/pack';

export type Folder = 'downloads' | 'sprites' | 'backgrounds';

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

	localRepoInstall(url: string, repo: IPack, authors: IAuthors): void;
	localRepoUninstall(id: string): void;
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
	if ((window as any).isElectron) {
		return new Electron();
	}
	if ('msSaveOrOpenBlob' in window.navigator) {
		return new OldEdge();
	}
	return new Browser();
}

const envX = chooseEnv();

(window as any).toast = envX;
export default envX;
