import { Module } from 'vuex';

export interface IUiState {
	vertical: boolean;
	nsfw: boolean;
	selection: string;
}

export default {
	namespaced: true,
	state: {
		vertical: false,
		nsfw: false,
		selection: '',
	},
	mutations: {
		setVertical(state, vertical: boolean) {
			state.vertical = vertical;
		},
		setNsfw(state, nsfw: boolean) {
			state.nsfw = nsfw;
		},
	},
} as Module<IUiState, never>;
