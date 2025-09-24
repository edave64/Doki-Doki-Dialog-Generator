import type { Module } from 'vuex';
import type { IRootState } from '.';

export interface IUiState {
	nsfw: boolean;
	lqRendering: boolean;
	lastDownload: string | null;
	clipboard: string | null;
	useDarkTheme: boolean | null;
	defaultCharacterTalkingZoom: boolean;
}

export function getDefaultUiState(): IUiState {
	return {
		lqRendering: true,
		nsfw: false,
		lastDownload: null,
		clipboard: null,
		useDarkTheme: null,
		defaultCharacterTalkingZoom: true,
	};
}

export default {
	namespaced: true,
	state: getDefaultUiState(),
	mutations: {
		setNsfw(state, nsfw: boolean) {
			state.nsfw = nsfw;
		},
		setLqRendering(state, lqRendering: boolean) {
			state.lqRendering = lqRendering;
		},
		setLastDownload(state, download: string) {
			state.lastDownload = download;
		},
		setClipboard(state, contents: string) {
			state.clipboard = contents;
		},
		setDarkTheme(state, theme: boolean | null) {
			state.useDarkTheme = theme;
		},
		setDefaultCharacterTalkingZoom(state, zoom: boolean) {
			state.defaultCharacterTalkingZoom = zoom;
		},
	},
} as Module<IUiState, IRootState>;
