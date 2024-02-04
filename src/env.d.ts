/// <reference types="vite/client.d.ts" />

/** Type definitions for environment variables */

interface ImportMetaEnv {
	BASE_URL: string;
	// more env variables...
}

// static replacements declared in vite.config.js
declare const DDDG_ASSET_PATH: string;
declare const DDDG_ALLOW_WEBP: boolean;
declare const DDDG_ALLOW_LQ: boolean;

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare interface FocusOptions {
	focusVisible?: boolean;
}
