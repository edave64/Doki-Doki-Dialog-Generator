import { registerAssetWithURL } from '@/asset-manager';
import { Module } from 'vuex';
import { IRootState } from '.';
import { afterImageUpload2_5 } from './migrations/v2_5';

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
		async add(
			{ state, commit, rootState },
			{ name, url }: { name: string; url: string }
		) {
			if (state[name]) {
				throw new Error(`There is already an uploaded file called "${name}"`);
			}
			const assertUrl = 'uploads:' + name;
			commit('add', { name: assertUrl, url });
			registerAssetWithURL(assertUrl, url);
			await afterImageUpload2_5(rootState, commit, assertUrl);
			return assertUrl;
		},
	},
} as Module<IUploadUrlState, IRootState>;
