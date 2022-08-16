import { Module } from 'vuex';
import { IRootState } from '.';
import { IObject } from './objects';

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

export default {
	namespaced: true,
	state: {
		vertical: false,
		lqRendering: true,
		nsfw: false,
		selection: null,
		lastDownload: null,
		clipboard: null,
		useDarkTheme: null,
		defaultCharacterTalkingZoom: true,
		pickColor: false,
	},
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
