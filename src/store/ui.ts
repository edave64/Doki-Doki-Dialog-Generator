import { defineStore } from 'pinia';
import { IObject } from './objects';

export const useUiStore = defineStore('ui', {
	state: () => ({
		vertical: false,
		lqRendering: true,
		nsfw: false,
		selection: null as IObject['id'] | null,
		lastDownload: null as string | null,
		clipboard: null as string | null,
		useDarkTheme: null as boolean | null,
		defaultCharacterTalkingZoom: true,
		pickColor: false,
	}),
});
