import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import fs from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// load the enviroment variables from the .env files, according to the current mode (desktop, development, production)
	const env = {
		...process.env,
		...loadEnv(mode, process.cwd()),
	};

	if (!fs.existsSync('./public/assets/logo.webp')) {
		// Btw, if you are opposed to WebP, you are wrong. If your stupid programs don't support a format that has
		// existed since 2010, that's their problem, not an issue with the format.
		console.warn(
			'Assets do not appear to have webp versions available. Loading of webp assets has been disabled. ' +
				'Run `npm run assetConversions` and rerun this command to include webP assets.'
		);
		env.VITE_ALLOW_WEBP = 'false';
	}

	if (!fs.existsSync('./public/assets/logo.lq.png')) {
		console.warn(
			'Assets do not seem to have low quality versions. Loading of low quality assets has been disabled. ' +
				'Run `npm run assetConversions` and rerun this command to include low quality assets.'
		);
		env.VITE_ALLOW_LQ = 'false';
	}

	return {
		base: './',

		plugins: [vue(), vueDevTools()],

		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
			},
		},

		define: {
			DDDG_ALLOW_LQ: env.VITE_ALLOW_LQ !== 'false',
			DDDG_ALLOW_WEBP: env.VITE_ALLOW_WEBP !== 'false',
			DDDG_ASSET_PATH: JSON.stringify(env.VITE_ASSET_PATH || './'),
		},
	};
});
