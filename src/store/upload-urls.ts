import { getAssetByUrl, registerAssetWithURL } from '@/asset-manager';
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
			if ('requireFixing25' in rootState) {
				const asset = await getAssetByUrl(assertUrl);
				commit(
					'fix25Sprites',
					{ url: assertUrl, size: [asset.width, asset.height] },
					{ root: true }
				);
			}
			return assertUrl;
		},
	},
} as Module<IUploadUrlState, IRootState>;
