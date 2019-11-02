import { IEnvironment } from './environment';
import {
	characters,
	ICharacter,
	characterOrder,
	backgrounds,
	registerAssetWithURL,
	getAsset,
} from '@/asset-manager';
import { Background } from '@/models/background';
import eventBus, { ShowMessageEvent } from '@/event-bus';
import { normalizeCharacter } from '@/models/json-config';
import { mergeCharacters, freezeAssetUrls } from '@/models/merge-characters';

export class Electron implements IEnvironment {
	public readonly allowLQ = false;
	private electron = (window as any) as IElectronWindow;
	private promptCache: {
		[promptId: number]: (resolved: string | null) => void;
	} = {};
	private lastPrompt: number = 0;

	constructor() {
		this.electron.ipcRenderer.on(
			'add-persistent-character',
			async (e, filePath: string) => {
				console.log(filePath);
				const parts = filePath.split('/');
				const baseDir = parts.slice(0, -1).join('/');

				const response = await fetch(filePath);
				const json = normalizeCharacter(await response.json(), {
					'./': baseDir + '/',
				}) as ICharacter<any>;
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
				const parts = filepath.split('/');
				registerAssetWithURL(name, filepath);
				console.log(filepath);
				backgrounds.push(
					new Background(name, parts[parts.length - 1], false, true, true)
				);
			}
		);
		this.electron.ipcRenderer.on('push-message', async (e, message: string) => {
			eventBus.fire(new ShowMessageEvent(message));
		});
		this.electron.ipcRenderer.on(
			'prompt-answered',
			(e, id: number, value: string | null) => {
				this.promptCache[id](value);
			}
		);
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

	public get isBackgroundInstallingSupported(): boolean {
		return true;
	}

	public async installBackground(background: Background): Promise<void> {
		const asset = await getAsset(background.path, true);
		if (!(asset instanceof HTMLImageElement)) return;
		const img = await fetch(asset.src);
		const array = new Uint8Array(await img.arrayBuffer());
		this.electron.ipcRenderer.send(
			'install-background',
			background.name,
			array
		);
		background.installed = true;
	}

	public async uninstallBackground(background: Background): Promise<void> {
		const asset = await getAsset(background.path, true);
		if (!(asset instanceof HTMLImageElement)) return;
		if (!asset.src.startsWith('blob:')) {
			const img = await fetch(asset.src);
			const blob = await img.blob();
			const newUrl = URL.createObjectURL(blob);
			registerAssetWithURL(background.path, newUrl);
		}
		this.electron.ipcRenderer.send('uninstall-background', background.name);
		background.installed = false;
	}

	public prompt(
		message: string,
		defaultValue?: string
	): Promise<string | null> {
		return new Promise((resolve, reject) => {
			this.promptCache[++this.lastPrompt] = resolve;
			this.electron.ipcRenderer.send(
				'show-prompt',
				this.lastPrompt,
				message,
				defaultValue
			);
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
