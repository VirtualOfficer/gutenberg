'use strict';

module.exports = {
	extends: [ './scss', './stylistic' ].map( require.resolve ),
	rules: {
		'@stylistic/block-opening-brace-space-before': 'always',
		'@stylistic/block-closing-brace-newline-after': [
			'always',
			{
				ignoreAtRules: [ 'if', 'else' ],
			},
		],
		'@stylistic/at-rule-name-space-after': 'always',
	},
};
