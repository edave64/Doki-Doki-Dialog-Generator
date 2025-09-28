import { registerAssetWithURL } from '@/asset-manager';
import { afterImageUpload2_5 } from '@/store/migrations/v2-5';
import { reactive } from 'vue';

export const uploadUrls = reactive(
	Object.seal({
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
			await afterImageUpload2_5(assertUrl);
			return assertUrl;
		},
	})
);
