import { registerAssetWithURL } from '@/asset-manager';
import { defineStore } from 'pinia';

export const useUploadUrlState = defineStore('urlState', {
	state: () => ({
		urls: new Map<string, string>(),
	}),
	actions: {
		add({ name, url }: { name: string; url: string }) {
			if (this.urls.has(name)) {
				throw new Error(`There is already an uploaded file called "${name}"`);
			}
			const assertUrl = 'uploads:' + name;
			this.urls.set(assertUrl, url);
			registerAssetWithURL(assertUrl, url);
			return assertUrl;
		},
	},
});
