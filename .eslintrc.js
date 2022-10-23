require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
	root: true,
	env: {
		node: true,
	},
	ignorePatterns: ['public/**', 'dist'],
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-essential',
		'@vue/eslint-config-typescript',
		'prettier',
	],
	plugins: ['prettier'],
	parserOptions: {
		ecmaVersion: 2020,
		project: 'tsconfig.json',
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				vars: 'all',
				args: 'after-used',
				ignoreRestSiblings: false,
				argsIgnorePattern: '^_',
			},
		],
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
		'no-case-declarations': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
		'no-empty': 'off',
		'no-prototype-builtins': 'off',
		'no-constant-condition': 'off',
		'no-async-promise-executor': 'off',
		// Maybe later
		'vue/multi-word-component-names': 'off',
	},
};
