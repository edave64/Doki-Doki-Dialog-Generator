import { Edge } from './edge';
import { Browser } from './browser';
import { Electron } from './electron';
import { Background } from '@/renderables/background';

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
	readonly isPackInstallingSupported: boolean;
	readonly installedCharacterPacks: Readonly<Array<Readonly<IPack>>>;
	saveToFile(
		canvas: HTMLCanvasElement,
		filename: string,
		format?: string,
		quality?: number
	): Promise<string>;
	installBackground(background: Background): void;
	uninstallBackground(background: Background): void;
	activateContentPack(url: string): void;
	deactivateContentPack(url: string): void;
	installContentPack(url: string): void;
	uninstallContentPack(url: string): void;
	prompt(message: string, defaultValue?: string): Promise<string | null>;
	onPanelChange(handler: (panel: string) => void): void;
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
