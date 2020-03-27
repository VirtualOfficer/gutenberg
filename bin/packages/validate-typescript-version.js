/**
 * External dependencies
 */
const tscDetectedVersion = require( 'typescript' ).version;
const tscDependencyVersion = require( '../../package.json' ).devDependencies
	.typescript;

/* eslint-disable no-console */

if ( tscDependencyVersion !== tscDetectedVersion ) {
	console.error(
		[
			'TypeScript dependency out of date.',
			'\tDetected: %o',
			'\tRequired: %o',
			'Please ensure dependencies are up to date.',
		].join( require( 'os' ).EOL ),
		tscDetectedVersion,
		tscDependencyVersion
	);
	process.exit( 1 );
}

/* eslint-enable no-console */
