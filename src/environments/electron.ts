import { IEnvironment } from './environment';
import {
	characters,
	ICharacter,
	characterOrder,
	backgrounds,
	registerAsset,
	registerAssetWithURL,
	INsfwAbleImg,
} from '@/asset-manager';
import { Background } from '@/models/background';
import eventBus, { ShowMessageEvent } from '@/event-bus';

export class Electron implements IEnvironment {
	public readonly allowLQ = false;
	private electron = (window as any) as IElectronWindow;

	constructor() {
		this.electron.ipcRenderer.on(
			'add-persistent-character',
			async (e, filepath: string) => {
				console.log(filepath);
				const response = await fetch(filepath);
				const json = (await response.json()) as ICharacter<any>;
				characters[json.id] = json;
				characterOrder.push(json);

				const baseFolder = json.folder + '/' || '';
				for (const headGroupKey in json.heads) {
					if (!json.heads.hasOwnProperty(headGroupKey)) continue;
					const headGroup = json.heads[headGroupKey];
					const headGroupFolder = headGroup.folder
						? baseFolder + headGroup.folder + '/'
						: baseFolder;
					const collection = headGroup.all || headGroup;
					for (const head of collection) {
						const path = headGroupFolder + head;
						registerAssetWithURL(path, path);
					}
				}
				for (const poseKey in json.poses) {
					if (!json.poses.hasOwnProperty(poseKey)) continue;
					const pose = json.poses[poseKey];
					const poseFolder = pose.folder
						? baseFolder + pose.folder + '/'
						: baseFolder;
					const collection: string[] = [];
					if ('static' in pose) {
						collection.push(pose.static);
					}
					if ('left' in pose) {
						for (const left of pose.left) {
							if (typeof left === 'string') {
								collection.push(left);
							} else {
								collection.push(left.img);
							}
						}
					}
					if ('right' in pose) {
						for (const right of pose.right) {
							if (typeof right === 'string') {
								collection.push(right);
							} else {
								collection.push(right.img);
							}
						}
					}
					if ('variant' in pose) {
						for (const variant of pose.variant) {
							if (typeof variant === 'string') {
								collection.push(variant);
							} else {
								collection.push(variant.img);
							}
						}
					}
					for (const part of collection) {
						const path = poseFolder + part;
						registerAssetWithURL(path, path);
					}
				}
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
