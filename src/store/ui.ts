import { reactive } from 'vue';

export const ui = reactive(
	Object.seal({
		lqRendering: true,
		nsfw: false,
		lastDownload: null as string | null,
		clipboard: null,
		useDarkTheme: null as boolean | null,
		defaultCharacterTalkingZoom: true,

		loadSave(_save: any) {},

		save() {
			return undefined;
		},
	})
);
