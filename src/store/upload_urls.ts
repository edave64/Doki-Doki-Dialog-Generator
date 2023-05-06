import { registerAssetWithURL } from '@/asset-manager';
import { Module } from 'vuex';
import { IRootState } from '.';

export type IUploadUrlState = {
	[name: string]: string;
};

export default {
	namespaced: true,
	state: {},
	mutations: {
		add(state, { name, url }: { name: string; url: string }) {
			state[name] = url;
		},
	},
	actions: {
		add({ state, commit }, { name, url }: { name: string; url: string }) {
			if (state[name]) {
				throw new Error(`There is already an uploaded file called "${name}"`);
			}
			const assertUrl = 'uploads:' + name;
			commit('add', { name: assertUrl, url });
			registerAssetWithURL(assertUrl, url);
			return assertUrl;
		},
	},
} as Module<IUploadUrlState, IRootState>;
