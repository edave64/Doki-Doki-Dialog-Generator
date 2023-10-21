/// <reference types="vite/client.d.ts" />

/** Type definitions for environment variables */

interface ImportMetaEnv {
	BASE_URL: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare interface FocusOptions {
	focusVisible?: boolean;
}
