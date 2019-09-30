import { Module } from 'vuex';

export interface IUiState {
	vertical: boolean;
}

export default {
	namespaced: true,
	state: {
		vertical: false,
		selection: '',
	},
	mutations: {
		setVertical(state, vertical: boolean) {
			state.vertical = vertical;
		},
	},
} as Module<IUiState, never>;
