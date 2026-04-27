import eventBus, { InvalidateAllThumbnails } from '@/eventbus/event-bus';
import { transaction } from '@/history-engine/transaction';
import { state } from '@/store/root';
import { ref } from 'vue';

export const folderDownloadAvailable = ref('showDirectoryPicker' in window);

export async function loadFolder(files: Iterable<File>) {
	await transaction(async () => {
		const filesAry = Array.from(files);

		const mainFile = filesAry.find((f) => f.name === 'save.dddg');
		if (mainFile) {
			const data = await mainFile.text();
			await state.loadSave(data);
		}

		for (const file of filesAry) {
			const name = file.name;

			if (name === 'save.dddg') continue;

			const url = URL.createObjectURL(file);
			state.uploadUrls.add(name, url);
		}
	});

	eventBus.fire(new InvalidateAllThumbnails());
}

/**
 * Saves the current state to the given directory.
 * @param entry The directory to save to.
 * @returns The size of the saved data in bytes.
 */
export async function saveInDirectory(
	entry: FileSystemDirectoryHandle
): Promise<number> {
	let size = 0;
	await transaction(async () => {
		const saveFile = await entry.getFileHandle(`save.dddg`, {
			create: true,
		});
		const saveBlob = new Blob([await state.getSave(false)], {
			type: 'text/plain',
		});
		const writable = await saveFile.createWritable();
		await writable.write(saveBlob);
		await writable.close();
		size += saveBlob.size;

		for (const [name, url] of Object.entries(state.uploadUrls.urls)) {
			const file = await entry.getFileHandle(name, {
				create: true,
			});
			const writable = await file.createWritable();
			const fileLoader = await fetch(url);
			const blob = await fileLoader.blob();
			await writable.write(blob);
			await writable.close();
			size += blob.size;
		}
	});
	return size;
}

export async function loadFromDirectory(folder: FileSystemDirectoryHandle) {
	await transaction(async () => {
		const saveFile = await folder.getFileHandle(`save.dddg`, {
			create: false,
		});
		const fileLoader = await fetch(
			URL.createObjectURL(await saveFile.getFile())
		);
		const data = await fileLoader.text();
		await state.loadSave(data);

		for await (const [name, subEntry] of folder.entries()) {
			if (name === 'save.dddg') continue;
			if (subEntry.kind === 'directory') continue;
			const url = URL.createObjectURL(
				await (subEntry as FileSystemFileHandle).getFile()
			);
			state.uploadUrls.add(name, url);
		}
	});

	eventBus.fire(new InvalidateAllThumbnails());
}
