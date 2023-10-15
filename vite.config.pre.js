import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	resolve: {
		alias: {
			'@': '/src/',
		},
	},

	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import '/src/styles/global_mixins.scss';`,
			},
		},
	},

	build: {
		minify: false,
		target: 'es2015',
	},
	esbuild: { target: 'es2015' },
	plugins: [vue()],
});
