import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
	{ files: ['**/*.{js,mjs,cjs,ts,vue}'] },
	{ ignores: ['dist/*', 'scripts/*', 'vite.config.js', 'vite.config.pre.js'] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		files: ['**/*.vue'],
		rules: {
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{
					allowString: true,
					allowNumber: true,
					allowNullableObject: true,
					allowNullableBoolean: true,
					allowNullableString: false,
					allowNullableNumber: false,
					allowAny: true,
				},
			],
			'vue/multi-word-component-names': 'off',
		},
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				project: './tsconfig.json',
				extraFileExtensions: ['.vue'],
			},
		},
	},
	{
		files: ['src/**/*.ts'],
		rules: {
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{
					allowString: true,
					allowNumber: true,
					allowNullableObject: true,
					allowNullableBoolean: true,
					allowNullableString: false,
					allowNullableNumber: false,
					allowAny: true,
				},
			],
		},

		languageOptions: {
			parserOptions: { parser: tseslint.parser, project: 'tsconfig.json' },
		},
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
				},
			],
		},
	},
];
