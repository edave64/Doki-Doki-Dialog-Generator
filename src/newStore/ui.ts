import { reactive } from 'vue';

export const ui = reactive(
	Object.seal({
		lqRendering: true,
		nsfw: false,
		lastDownload: null,
		clipboard: null,
		useDarkTheme: null,
		defaultCharacterTalkingZoom: true,

		loadSave(_save: any) {},

		save() {
			return undefined;
		},
	})
);
