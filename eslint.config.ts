import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import {
	defineConfigWithVueTs,
	vueTsConfigs,
} from '@vue/eslint-config-typescript';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { createNodeResolver, importX } from 'eslint-plugin-import-x';
import pluginVue from 'eslint-plugin-vue';
import { globalIgnores } from 'eslint/config';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
	{
		name: 'app/files-to-lint',
		files: ['**/*.{ts,mts,tsx,vue}'],
	},
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	{
		files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
		plugins: {
			'import-x': importX,
		},
		settings: {
			'import-x/resolver-next': [
				createTypeScriptImportResolver(/* Your override options go here */),
				createNodeResolver(/* Your override options go here */),
			],
		},
		rules: {
			'import-x/no-restricted-paths': [
				'warn',
				{
					zones: [
						{
							target: './src/eventbus',
							from: './src',
							except: ['./eventbus'],
						},
						{
							target: './src/util',
							from: './src',
							except: [
								'./util',
								'./config.ts',
								'./eventbus',
								'./history-engine',
							],
						},
						{
							target: './src/environments',
							from: './src',
							except: ['./util', './environments', './eventbus'],
						},
					],
				},
			],
		},
	},

	globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

	pluginVue.configs['flat/essential'],
	vueTsConfigs.recommended,

	{
		...pluginVitest.configs.recommended,
		files: ['src/**/__tests__/*'],
	},
	skipFormatting,
	{
		rules: {
			'vue/component-name-in-template-casing': [
				'error',
				'kebab-case',
				{ registeredComponentsOnly: false },
			],
			'vue/component-options-name-casing': ['error', 'PascalCase'],
			'vue/custom-event-name-casing': ['error', 'kebab-case'],
			'vue/define-emits-declaration': 'error',
			'vue/define-macros-order': [
				'error',
				{
					order: [
						'defineOptions',
						'defineProps',
						'defineModel',
						'defineEmits',
						'defineSlots',
						'useStore',
					],
					defineExposeLast: true,
				},
			],
			'vue/define-props-declaration': 'error',
			'vue/html-comment-content-spacing': 'error',
			'vue/html-comment-indent': ['error', 'tab'],
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							regex: '^\\.\\./',
							message:
								'Relative imports from parent directories are not allowed.',
						},
					],
				},
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
		},
	}
);
