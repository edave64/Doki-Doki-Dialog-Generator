import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/

/** @type {import('vite').UserConfigExport} */

export const config = ({ mode }) => {
	const env = {
		...process.env,
		...loadEnv(mode, process.cwd()),
	};
	return {
		base: './',

		resolve: {
			alias: {
				'@': '/src/',
			},
		},

		define: {
			DDDG_ALLOW_LQ: env.VITE_ALLOW_LQ !== 'false',
			DDDG_ALLOW_WEBP: env.VITE_ALLOW_WEBP !== 'false',
			DDDG_ASSET_PATH: JSON.stringify(env.VITE_ASSET_PATH || './'),
		},

		css: {
			preprocessorOptions: {
				scss: {
					additionalData: `@import '/src/styles/global_mixins.scss';`,
				},
			},
		},

		...(mode.mode === 'development'
			? {}
			: {
					esbuild: { target: 'es2015' },
					build: { target: 'es2015' },
			  }),

		plugins: [vue()],
	};
};
export default defineConfig(config);
