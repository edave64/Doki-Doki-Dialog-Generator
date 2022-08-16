import { Module } from 'vuex';
import { IRootState } from '.';

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
