import { defineConfig } from 'vite';
import * as base from './vite.config.js';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfigExport} */
export const config = (opts) => ({
	...base.config(opts),
	build: {
		minify: false,
		target: 'es2015',
	},
});

export default defineConfig(config);
