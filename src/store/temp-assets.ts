import type { Module } from 'vuex';
import type { IRootState } from '.';

export interface ITempAssets {
	assets: { [name: string]: string };
}

export default {
	namespaced: true,
	state: {
		assets: {},
	},
	mutations: {},
} as Module<ITempAssets, IRootState>;
