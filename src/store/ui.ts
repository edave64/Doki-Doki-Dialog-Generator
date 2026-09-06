import { reactive } from 'vue';
import type { GenObject } from './object-types/object';
import { panels, type Panel } from './panels';

export const ui = Object.seal(
	reactive({
		lqRendering: true,
		nsfw: false,
		lastDownload: null as string | null,
		clipboard: null as string | null,
		useDarkTheme: null as boolean | null,
		defaultCharacterTalkingZoom: true,

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		loadSave(_save: any) {},

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		getSave(_compact: boolean): any {
			return {};
		},

		copyObjectToClipboard(
			panelId: Panel['id'],
			objects: GenObject['id'][]
		) {
			const panel = panels.panels[panelId];
			const allObject = Object.values(panel.objects);
			const objectsToCopy: Set<GenObject> = new Set();

			for (const id of objects) {
				const obj = panel.objects[id];
				objectsToCopy.add(obj);
				collectLinks(obj, obj);
			}

			const jsons = Array.from(objectsToCopy).map((obj) => obj.save());

			const text = JSON.stringify(jsons);
			this.clipboard = text;
			navigator.clipboard.writeText(text);

			function collectLinks(
				from: GenObject,
				origin: GenObject,
				direct = true
			) {
				if (!direct && from === origin)
					throw new Error('Recursively linked object');
				for (const obj of allObject) {
					if (obj.linkedTo === from.id) {
						objectsToCopy.add(obj);
						collectLinks(obj, origin, false);
					}
				}
			}
		},

		async pasteObjects(panel: Panel) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let save: any;
			try {
				const str = await navigator.clipboard.readText();
				save = JSON.parse(str);
			} catch {
				if (ui.clipboard == null) return;
				save = JSON.parse(ui.clipboard);
			}
			panel.pasteObjects(save);
		},
	})
);
