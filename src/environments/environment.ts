import { OldEdge } from './edge';
import { Browser } from './browser';
import { Electron } from './electron';
import { Background } from '@/renderables/background';
import { EnvState } from './envState';

export interface IPack {
	url: string;
	id: string;
	credits: string;
}

export interface EnvCapabilities {
	optionalSaving: boolean;
	autoLoading: boolean;
	localRepo: boolean;
	backgroundInstall: boolean;
	lq: boolean;
}

export interface Settings {
	lq?: boolean;
	nsfw?: boolean;
	darkMode?: boolean;
	defaultCharacterTalkingZoom?: boolean;
}

export interface IEnvironment {
	readonly localRepositoryUrl: string;
	readonly state: EnvState;
	readonly supports: EnvCapabilities;
	savingEnabled: boolean;

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

	localRepoInstall(url: string): void;
	localRepoUninstall(id: string): void;
	autoLoadAdd(id: string): void;
	autoLoadRemove(id: string): void;

	saveSettings(settings: Settings): Promise<void>;
	loadSettings(): Promise<Settings>;
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
