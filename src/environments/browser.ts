import { IEnvironment, IPack } from './environment';
import { IBackground } from '@/models/background';

export class Browser implements IEnvironment {
	public readonly allowLQ = true;

	public async saveToFile(
		downloadCanvas: HTMLCanvasElement,
		filename: string
	): Promise<string> {
		const a = document.createElement('a');
		a.setAttribute('download', filename);
		const url = await this.createObjectURL(downloadCanvas);
		a.setAttribute('href', url);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		return url;
	}

	public get installedCharacterPacks(): Readonly<Array<Readonly<IPack>>> {
		return [];
	}

	public get isBackgroundInstallingSupported(): boolean {
		return false;
	}

	public get isPackInstallingSupported(): boolean {
		return false;
	}

	public installBackground(background: IBackground): boolean {
		throw new Error('This environment does not support installing backgrounds');
	}

	public installContentPack(url: string): boolean {
		throw new Error(
			'This environment does not support installing content packs'
		);
	}

	public uninstallBackground(background: IBackground): boolean {
		throw new Error(
			'This environment does not support uninstalling backgrounds'
		);
	}

	public uninstallContentPack(url: string): boolean {
		throw new Error(
			'This environment does not support uninstalling content packs'
		);
	}
	public activateContentPack(url: string): boolean {
		throw new Error(
			'This environment does not support installing content packs'
		);
	}

	public deactivateContentPack(url: string): boolean {
		throw new Error(
			'This environment does not support uninstalling content packs'
		);
	}

	public prompt(
		message: string,
		defaultValue?: string
	): Promise<string | null> {
		return new Promise((resolve, reject) => {
			resolve(prompt(message, defaultValue));
		});
	}

	protected createObjectURL(canvas: HTMLCanvasElement): Promise<string> {
		return new Promise((resolve, reject) => {
			if (canvas.toBlob && window.URL && window.URL.createObjectURL) {
				canvas.toBlob(blob => {
					if (!blob) {
						reject();
						return;
					}
					resolve(URL.createObjectURL(blob));
				}, 'image/png');
			} else if (window.URL && window.URL.createObjectURL) {
				const url = canvas.toDataURL();
				const blob = this.dataURItoBlob(url);
				resolve(URL.createObjectURL(blob));
			} else {
				resolve(canvas.toDataURL());
			}
		});
	}

	protected dataURItoBlob(dataURI: string) {
		const binStr = atob(dataURI.split(',')[1]);
		const len = binStr.length;
		const arr = new Uint8Array(len);

		for (let i = 0; i < len; i++) {
			arr[i] = binStr.charCodeAt(i);
		}

		return new Blob([arr], { type: 'image/png' });
	}
}
