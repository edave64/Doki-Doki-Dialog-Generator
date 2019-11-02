import { Edge } from './edge';
import { Browser } from './browser';
import { Electron } from './electron';
import { Background } from '@/models/background';

export interface IEnvironment {
	readonly allowLQ: boolean;
	readonly isBackgroundInstallingSupported: boolean;
	saveToFile(canvas: HTMLCanvasElement, filename: string): Promise<string>;
	installBackground(background: Background): void;
	uninstallBackground(background: Background): void;
	prompt(message: string, defaultValue?: string): Promise<string | null>;
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
