/**
 * External dependencies
 */
const { cosmiconfigSync } = require( 'cosmiconfig' );

/**
 * WordPress dependencies
 */

/**
 * Internal dependencies
 */
const { isPackageInstalled } = require( '../utils' );

const config = {
	extends: [ require.resolve( './recommended-with-formatting.js' ) ],
};

if ( isPackageInstalled( 'prettier' ) ) {
	config.extends.push( 'plugin:prettier/recommended' );

	const { config: localPrettierConfig } =
		cosmiconfigSync( 'prettier' ).search() || {};
	const defaultPrettierConfig = require( '@wordpress/prettier-config' );
	const prettierConfig = { ...defaultPrettierConfig, ...localPrettierConfig };
	config.rules = {
		'prettier/prettier': [ 'error', prettierConfig ],
		// Prettier _disables_ this rule, but we want it!
		// See https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#curly
		// > This rule requires certain options.
		// > …
		// > If you like this rule, it can be used just fine with Prettier as long as you don’t use the "multi-line" or "multi-or-nest" option.
		curly: [ 'error', 'all' ],
	};
}

if ( isPackageInstalled( 'typescript' ) ) {
	config.settings = {
		'import/resolver': {
			node: {
				extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
			},
		},
	};
	config.extends.push( 'plugin:@typescript-eslint/eslint-recommended' );
	config.ignorePatterns = [ '**/*.d.ts' ];
	config.plugins = [ '@typescript-eslint' ];
	config.overrides = [
		{
			files: [ '**/*.ts', '**/*.tsx' ],
			parser: '@typescript-eslint/parser',
			rules: {
				'no-duplicate-imports': 'off',
				'import/no-duplicates': 'error',
				// Don't require redundant JSDoc types in TypeScript files.
				'jsdoc/require-param-type': 'off',
				'jsdoc/require-returns-type': 'off',
				// Setting "no-unused-vars" to "off" will also disable
				// the typescript type checker. So we need to explicitly enable it,
				// but want to ignore "unused rest siblings".
				// @issue https://github.com/WordPress/gutenberg/issues/54305
				'no-unused-vars': 'off',
				'@typescript-eslint/no-unused-vars': [ 'error', { ignoreRestSiblings: true } ],
				// no-shadow doesn't work correctly in TS, so let's use a TS-dedicated version instead.
				'no-shadow': 'off',
				'@typescript-eslint/no-shadow': 'error',
			},
		},
	];
}

module.exports = config;
