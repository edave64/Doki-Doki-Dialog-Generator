import { OldEdge } from './edge';
import { Browser } from './browser';
import { Electron } from './electron';
import { Background } from '@/renderables/background';
import { EnvState } from './envState';
import { IHistorySupport } from '@/plugins/vuex-history';
import { Store } from 'vuex';
import { IRootState } from '@/store';
import { DeepReadonly } from '@/util/readonly';
import { IAuthors } from '@edave64/dddg-repo-filters/dist/authors';
import { IPack as ICPack } from '@edave64/dddg-repo-filters/dist/pack';

export interface IPack {
	url: string;
	id: string;
	credits: string;
}

export type Folder = 'downloads' | 'sprites' | 'backgrounds';

export interface EnvCapabilities {
	setDownloadFolder: boolean;
	optionalSaving: boolean;
	autoLoading: boolean;
	localRepo: boolean;
	backgroundInstall: boolean;
	lq: boolean;
	openableFolders: ReadonlySet<Folder>;
}

export interface Settings {
	lq?: boolean;
	nsfw?: boolean;
	darkMode?: boolean;
	defaultCharacterTalkingZoom?: boolean;
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
	installBackground(background: Background): void;
	uninstallBackground(background: Background): void;
	updateDownloadFolder(): void;
	openFolder(folder: Folder): void;
	prompt(message: string, defaultValue?: string): Promise<string | null>;
	onPanelChange(handler: (panel: string) => void): void;

	localRepoInstall(url: string, repo: ICPack, authors: IAuthors): void;
	localRepoUninstall(id: string): void;
	autoLoadAdd(id: string): void;
	autoLoadRemove(id: string): void;

	saveSettings(settings: Settings): Promise<void>;
	loadSettings(): Promise<Settings>;
	loadGameMode(): Promise<void>;
	saveGameMode(mode: IEnvironment['gameMode']): Promise<void>;
	connectToStore(
		vuexHistory: IHistorySupport,
		store: Store<DeepReadonly<IRootState>>
	): void;
}

function chooseEnv(): IEnvironment {
	if ((window as any).isElectron) {
		return new Electron();
	}
	if (window.navigator.msSaveOrOpenBlob !== undefined) {
		return new OldEdge();
	}
	return new Browser();
}

const envX = chooseEnv();

(window as any).toast = envX;
export default envX;
