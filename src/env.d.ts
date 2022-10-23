/// <reference types="vite/client.d.ts" />

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
