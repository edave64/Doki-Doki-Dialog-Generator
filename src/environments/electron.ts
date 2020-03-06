import { IEnvironment, IPack } from './environment';
import { registerAssetWithURL, getAsset } from '@/asset-manager';
import { Background } from '@/renderables/background';
import eventBus from '@/eventbus/event-bus';

const packs: IPack[] = [];

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
			async (e, filePath: string, active: boolean = true) => {
				/*
				const json = await loadCharacterPack(filePath, active);
				if (!json) return;
				packs.push({
					url: filePath,
					queuedUninstall: false,
					id: json.packId,
					credits: json.packCredits,
					active,
				});
				*/
			}
		);
		this.electron.ipcRenderer.on(
			'add-persistent-background',
			async (e, filepath: string) => {
				const name = 'persistentBg-' + filepath;
				const parts = filepath.split('/');
				registerAssetWithURL(name, filepath);
				console.log(filepath);
				/*
				backgrounds.push(
					new Background(name, parts[parts.length - 1], true, '', true)
				);
				*/
			}
		);
		this.electron.ipcRenderer.on('push-message', async (e, message: string) => {
			/*
			eventBus.fire(new ShowMessageEvent(message));
			*/
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
		filename: string,
		format: string = 'image/png',
		quality: number = 1
	): Promise<string> {
		return new Promise((resolve, reject) => {
			downloadCanvas.toBlob(
				async blob => {
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
				},
				format,
				quality
			);
		});
	}

	public get installedCharacterPacks(): Readonly<Array<Readonly<IPack>>> {
		return packs;
	}

	public get isBackgroundInstallingSupported(): boolean {
		return true;
	}

	public get isPackInstallingSupported(): boolean {
		return true;
	}

	public async installBackground(background: Background): Promise<void> {
		/*
		const asset = await getAsset(background.path, true);
		if (!(asset instanceof HTMLImageElement)) return;
		const img = await fetch(asset.src);
		const array = new Uint8Array(await img.arrayBuffer());
		this.electron.ipcRenderer.send('install-background', array);
		*/
	}

	public async uninstallBackground(background: Background): Promise<void> {
		/*
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
		*/
	}

	public installContentPack(url: string): void {
		console.log('installContentPack', url);
		this.electron.ipcRenderer.send('install-content-pack', url);
	}

	public uninstallContentPack(url: string): void {
		console.log('uninstallContentPack', url);
		this.electron.ipcRenderer.send('uninstall-content-pack', url);
	}

	public activateContentPack(url: string): void {
		console.log('activateContentPack', url);
		this.electron.ipcRenderer.send('activate-content-pack', url);
	}

	public deactivateContentPack(url: string): void {
		console.log('deactivateContentPack', url);
		this.electron.ipcRenderer.send('deactivate-content-pack', url);
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

	public onPanelChange(handler: (panel: string) => void): void {
		this.electron.ipcRenderer.on('open-panel', (e, panel: string) => {
			handler(panel);
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
