import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	// load the enviroment variables from the .env files, according to the current mode (desktop, development, production)
	const env = {
		...process.env,
		...loadEnv(mode, process.cwd()),
	};
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
