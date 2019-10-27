import { IEnvironment } from './environment';
import {
	characters,
	ICharacter,
	characterOrder,
	backgrounds,
	registerAssetWithURL,
} from '@/asset-manager';
import { Background } from '@/models/background';
import eventBus, { ShowMessageEvent } from '@/event-bus';
import { normalizeCharacter } from '@/models/json-config';
import { mergeCharacters, freezeAssetUrls } from '@/models/merge-characters';

export class Electron implements IEnvironment {
	public readonly allowLQ = false;
	private electron = (window as any) as IElectronWindow;

	constructor() {
		this.electron.ipcRenderer.on(
			'add-persistent-character',
			async (e, filepath: string) => {
				console.log(filepath);
				const response = await fetch(filepath);
				const json = normalizeCharacter(await response.json()) as ICharacter<
					any
				>;
				if (characters[json.id]) {
					const existing = characters[json.id];
					mergeCharacters(existing, json);
				} else {
					characters[json.id] = json;
					characterOrder.push(json);
				}
				freezeAssetUrls(json);
			}
		);
		this.electron.ipcRenderer.on(
			'add-persistent-background',
			async (e, filepath: string) => {
				const name = 'persistentBg-' + filepath;
				registerAssetWithURL(name, filepath);
				console.log(filepath);
				backgrounds.push(new Background(name, filepath, false, true));
			}
		);
		this.electron.ipcRenderer.on('push-message', async (e, message: string) => {
			eventBus.fire(new ShowMessageEvent(message));
		});
		this.electron.ipcRenderer.send('find-customs');
	}

	public saveToFile(
		downloadCanvas: HTMLCanvasElement,
		filename: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			downloadCanvas.toBlob(async blob => {
				if (!blob) {
					reject();
					return;
				}
				const buffer = await (blob as any).arrayBuffer();
				this.electron.ipcRenderer.send(
					'save-file',
					filename,
					new Uint8Array(buffer)
				);
				resolve(URL.createObjectURL(blob));
			});
		});
	}
}

interface IElectronWindow {
	isElectron: boolean;
	ipcRenderer: IpcRenderer;
}

interface IpcRenderer {
	on(
		channel: string,
		listener: (event: IpcRendererEvent, ...args: any[]) => void
	): void;
	send(channel: string, ...args: any[]): void;
}

interface IpcRendererEvent extends Event {
	sender: IpcRenderer;
	senderId: number;
}
