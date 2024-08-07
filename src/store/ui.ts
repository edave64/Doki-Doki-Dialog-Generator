import type { Module } from 'vuex';
import type { IRootState } from '.';
import type { IObject } from './objects';

export interface IUiState {
	vertical: boolean;
	nsfw: boolean;
	selection: IObject['id'] | null;
	lqRendering: boolean;
	lastDownload: string | null;
	clipboard: string | null;
	useDarkTheme: boolean | null;
	defaultCharacterTalkingZoom: boolean;
	pickColor: boolean;
}

export function getDefaultUiState(): IUiState {
	return {
		vertical: false,
		lqRendering: true,
		nsfw: false,
		selection: null,
		lastDownload: null,
		clipboard: null,
		useDarkTheme: null,
		defaultCharacterTalkingZoom: true,
		pickColor: false,
	};
}

export default {
	namespaced: true,
	state: getDefaultUiState(),
	mutations: {
		setVertical(state, vertical: boolean) {
			state.vertical = vertical;
		},
		setNsfw(state, nsfw: boolean) {
			state.nsfw = nsfw;
		},
		setLqRendering(state, lqRendering: boolean) {
			state.lqRendering = lqRendering;
		},
		setSelection(state, selection: IObject['id'] | null) {
			state.selection = selection;
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
		setColorPicker(state, pickColor: boolean) {
			state.pickColor = pickColor;
		},
	},
} as Module<IUiState, IRootState>;
