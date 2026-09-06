import { getAssetByUrl, registerAssetWithURL } from '@/asset-manager';
import { reactive } from 'vue';
import { state } from './root';

export const uploadUrls = Object.seal(
	reactive({
		urls: {} as Record<string, string>,

		async add(name: string, url: string) {
			if (this.urls[name]) {
				throw new Error(
					`There is already an uploaded file called "${name}"`
				);
			}
			const assertUrl = 'uploads:' + name;

			this.urls[name] = url;
			registerAssetWithURL(assertUrl, url);
			if (state.fromVersion <= 2.4) {
				const asset = await getAssetByUrl(assertUrl);
				await (
					await import('@/store/migrations/v2-5')
				).fixSprites2_5({
					url: assertUrl,
					size: [asset.width, asset.height],
				});
			}
			return assertUrl;
		},

		getSave(_compact: boolean) {
			return Object.keys(this.urls);
		},

		loadSave(_data: string[]) {
			// If we are loading a compact save, uploads are not saved, so there is nothing to load
			// If we are loading a full save, uploads are added in later, because they get new URLs
			this.urls = {};
		},
	})
);
