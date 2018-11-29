/**
 * External dependencies
 */
const path = require( 'path' );

/**
 * Internal dependencies
 */
const { hasBabelConfig } = require( '../utils' );

const jestE2EConfig = {
	preset: 'jest-puppeteer',
};

if ( ! hasBabelConfig() ) {
	jestE2EConfig.transform = {
		'^.+\\.jsx?$': path.join( __dirname, 'babel-transform' ),
	};
}

module.exports = jestE2EConfig;
