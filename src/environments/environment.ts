import { Edge } from './edge';
import { Browser } from './browser';
import { Electron } from './electron';
import { Background } from '@/renderables/background';
import { EnvState } from './envState';

export interface IPack {
	url: string;
	id: string;
	credits: string;
	queuedUninstall: boolean;
	active: boolean;
}

export interface IEnvironment {
	readonly allowLQ: boolean;
	readonly isBackgroundInstallingSupported: boolean;
	readonly isLocalRepoSupported: boolean;
	readonly localRepositoryUrl: string;
	readonly isAutoLoadingSupported: boolean;
	readonly vueState: EnvState;

	saveToFile(
		canvas: HTMLCanvasElement,
		filename: string,
		format?: string,
		quality?: number
	): Promise<string>;
	installBackground(background: Background): void;
	uninstallBackground(background: Background): void;
	prompt(message: string, defaultValue?: string): Promise<string | null>;
	onPanelChange(handler: (panel: string) => void): void;

	localRepoAdd(url: string): void;
	localRepoRemove(id: string): void;
	autoLoadAdd(id: string): void;
	autoLoadRemove(id: string): void;
}

function chooseEnv(): IEnvironment {
	if ((window as any).isElectron) {
		return new Electron();
	}
	if (window.navigator.msSaveOrOpenBlob !== undefined) {
		return new Edge();
	}
	return new Browser();
}

const envX = chooseEnv();

(window as any).toast = envX;
export default envX;
