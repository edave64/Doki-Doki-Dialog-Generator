// No idea why, but vuex type definitions don't seem to work with newer tsc?

declare module 'vuex' {
	export * from 'vuex/types/helpers.d.ts';
	export * from 'vuex/types/index.d.ts';
	export * from 'vuex/types/logger.d.ts';
	export * from 'vuex/types/vue.d.ts';
}
