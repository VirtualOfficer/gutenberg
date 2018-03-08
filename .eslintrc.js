/**
 * External dependencies
 */
const { escapeRegExp } = require( 'lodash' );

/**
 * Internal dependencies
 */
const { version } = require( './package' );

/**
 * Regular expression string matching a SemVer string with equal major/minor to
 * the current package version. Used in identifying deprecations.
 *
 * @type {string}
 */
const majorMinorRegExp = escapeRegExp( version.replace( /\.\d+$/, '' ) ) + '(\\.\\d+)?';

module.exports = {
	root: true,
	parser: 'babel-eslint',
	extends: [
		'wordpress',
		'plugin:react/recommended',
		'plugin:jsx-a11y/recommended',
		'plugin:jest/recommended',
	],
	env: {
		browser: false,
		es6: true,
		node: true,
		'jest/globals': true,
	},
	parserOptions: {
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	globals: {
		wp: true,
		wpApiSettings: true,
		window: true,
		document: true,
	},
	plugins: [
		'wordpress',
		'react',
		'jsx-a11y',
		'jest',
	],
	settings: {
		react: {
			pragma: 'wp',
		},
	},
	rules: {
		'array-bracket-spacing': [ 'error', 'always' ],
		'brace-style': [ 'error', '1tbs' ],
		camelcase: [ 'error', { properties: 'never' } ],
		'comma-dangle': [ 'error', 'always-multiline' ],
		'comma-spacing': 'error',
		'comma-style': 'error',
		'computed-property-spacing': [ 'error', 'always' ],
		'constructor-super': 'error',
		'dot-notation': 'error',
		'eol-last': 'error',
		eqeqeq: 'error',
		'func-call-spacing': 'error',
		indent: [ 'error', 'tab', { SwitchCase: 1 } ],
		'jsx-a11y/label-has-for': [ 'error', {
			required: 'id',
		} ],
		'jsx-a11y/media-has-caption': 'off',
		'jsx-a11y/no-noninteractive-tabindex': 'off',
		'jsx-a11y/role-has-required-aria-props': 'off',
		'jsx-quotes': 'error',
		'key-spacing': 'error',
		'keyword-spacing': 'error',
		'lines-around-comment': 'off',
		'no-alert': 'error',
		'no-bitwise': 'error',
		'no-caller': 'error',
		'no-console': 'error',
		'no-const-assign': 'error',
		'no-debugger': 'error',
		'no-dupe-args': 'error',
		'no-dupe-class-members': 'error',
		'no-dupe-keys': 'error',
		'no-duplicate-case': 'error',
		'no-duplicate-imports': 'error',
		'no-else-return': 'error',
		'no-eval': 'error',
		'no-extra-semi': 'error',
		'no-fallthrough': 'error',
		'no-lonely-if': 'error',
		'no-mixed-operators': 'error',
		'no-mixed-spaces-and-tabs': 'error',
		'no-multiple-empty-lines': [ 'error', { max: 1 } ],
		'no-multi-spaces': 'error',
		'no-multi-str': 'off',
		'no-negated-in-lhs': 'error',
		'no-nested-ternary': 'error',
		'no-redeclare': 'error',
		'no-restricted-syntax': [
			'error',
			{
				selector: 'ImportDeclaration[source.value=/^@wordpress\\u002F.+\\u002F/]',
				message: 'Path access on WordPress dependencies is not allowed.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^blocks$/]',
				message: 'Use @wordpress/blocks as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^components$/]',
				message: 'Use @wordpress/components as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^date$/]',
				message: 'Use @wordpress/date as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^editor$/]',
				message: 'Use @wordpress/editor as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^element$/]',
				message: 'Use @wordpress/element as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^i18n$/]',
				message: 'Use @wordpress/i18n as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^data$/]',
				message: 'Use @wordpress/data as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^utils$/]',
				message: 'Use @wordpress/utils as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^edit-post$/]',
				message: 'Use @wordpress/edit-post as import path instead.',
			},
			{
				selector: 'ImportDeclaration[source.value=/^viewport$/]',
				message: 'Use @wordpress/viewport as import path instead.',
			},
			{
				selector: 'CallExpression[callee.name=/^__|_n|_x$/]:not([arguments.0.type=/^Literal|BinaryExpression$/])',
				message: 'Translate function arguments must be string literals.',
			},
			{
				selector: 'CallExpression[callee.name=/^_n|_x$/]:not([arguments.1.type=/^Literal|BinaryExpression$/])',
				message: 'Translate function arguments must be string literals.',
			},
			{
				selector: 'CallExpression[callee.name=_nx]:not([arguments.2.type=/^Literal|BinaryExpression$/])',
				message: 'Translate function arguments must be string literals.',
			},
			{
				selector: 'CallExpression[callee.name="deprecated"] Property[key.name="version"][value.value=/' + majorMinorRegExp + '/]',
				message: 'Deprecated functions must be removed before releasing this version.',
			},
		],
		'no-shadow': 'error',
		'no-undef': 'error',
		'no-undef-init': 'error',
		'no-unreachable': 'error',
		'no-unsafe-negation': 'error',
		'no-unused-expressions': 'error',
		'no-unused-vars': 'error',
		'no-useless-computed-key': 'error',
		'no-useless-constructor': 'error',
		'no-useless-return': 'error',
		'no-var': 'error',
		'no-whitespace-before-property': 'error',
		'object-curly-spacing': [ 'error', 'always' ],
		'padded-blocks': [ 'error', 'never' ],
		'prefer-const': 'error',
		'quote-props': [ 'error', 'as-needed' ],
		'react/display-name': 'off',
		'react/jsx-curly-spacing': [ 'error', {
			when: 'always',
			children: true,
		} ],
		'react/jsx-equals-spacing': 'error',
		'react/jsx-indent': [ 'error', 'tab' ],
		'react/jsx-indent-props': [ 'error', 'tab' ],
		'react/jsx-key': 'error',
		'react/jsx-tag-spacing': 'error',
		'react/no-children-prop': 'off',
		'react/no-find-dom-node': 'warn',
		'react/prop-types': 'off',
		semi: 'error',
		'semi-spacing': 'error',
		'space-before-blocks': [ 'error', 'always' ],
		'space-before-function-paren': [ 'error', 'never' ],
		'space-in-parens': [ 'error', 'always' ],
		'space-infix-ops': [ 'error', { int32Hint: false } ],
		'space-unary-ops': [ 'error', {
			overrides: {
				'!': true,
			},
		} ],
		'template-curly-spacing': [ 'error', 'always' ],
		'valid-jsdoc': [ 'error', {
			prefer: {
				arg: 'param',
				argument: 'param',
				extends: 'augments',
				returns: 'return',
			},
			preferType: {
				array: 'Array',
				bool: 'boolean',
				Boolean: 'boolean',
				float: 'number',
				Float: 'number',
				int: 'number',
				integer: 'number',
				Integer: 'number',
				Number: 'number',
				object: 'Object',
				String: 'string',
				Void: 'void',
			},
			requireParamDescription: false,
			requireReturn: false,
		} ],
		'valid-typeof': 'error',
		yoda: 'off',
	},
};
