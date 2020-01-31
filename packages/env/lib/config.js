'use strict';
/**
 * External dependencies
 */
const fs = require( 'fs' ).promises;
const path = require( 'path' );
const os = require( 'os' );
const crypto = require( 'crypto' );

/**
 *
 */
class ValidationError extends Error {}

/**
 *
 * @var string
 */
const HOME_PATH_PREFIX = `~${ path.sep }`;

/**
 * @typedef Config
 * @property {string} name
 * @property {string} configDirectoryPath
 * @property {string} workDirectoryPath
 * @property {string} dockerComposeConfigPath
 * @property {Source|null} coreSource
 * @property {Source[]} pluginSources
 * @property {Source[]} themeSources
 */

/**
 * @typedef Source
 * @property {string} type
 * @property {string} path
 * @property {string} basename
 */

module.exports = {
	ValidationError,

	/**
	 *
	 * @param {string} configPath
	 * @return {Config}
	 */
	async readConfig( configPath ) {
		let configJson;
		try {
			configJson = await fs.readFile( configPath, 'utf8' );
		} catch ( error ) {
			throw new ValidationError(
				`Could not find a .wp-env.json file in '${ path.basename( configPath ) }'.`
			);
		}

		let config;
		try {
			config = JSON.parse( configJson );
		} catch ( error ) {
			throw new ValidationError( `Invalid .wp-env.json: ${ error.message }` );
		}

		config = Object.assign(
			{
				core: null,
				plugins: [],
				themes: [],
			},
			config
		);

		if ( config.core !== null && typeof config.core !== 'string' ) {
			throw new ValidationError( "Invalid .wp-env.json: 'core' must be null or a string." );
		}

		if (
			! Array.isArray( config.plugins ) ||
			config.plugins.some( ( plugin ) => typeof plugin !== 'string' )
		) {
			throw new ValidationError( "Invalid .wp-env.json: 'plugins' must be an array of strings." );
		}

		if (
			! Array.isArray( config.themes ) ||
			config.themes.some( ( theme ) => typeof theme !== 'string' )
		) {
			throw new ValidationError( "Invalid .wp-env.json: 'themes' must be an array of strings." );
		}

		const configDirectoryPath = path.dirname( configPath );
		const workDirectoryPath = path.resolve( os.homedir(), '.wp-env', md5( configPath ) );

		return {
			name: path.basename( configDirectoryPath ),
			configDirectoryPath,
			workDirectoryPath,
			dockerComposeConfigPath: path.resolve( workDirectoryPath, 'docker-compose.yml' ),
			coreSource: parseSourceString( config.core, { hasTests: true, workDirectoryPath } ),
			pluginSources: config.plugins.map( ( sourceString ) =>
				parseSourceString( sourceString, { hasTests: false, workDirectoryPath } )
			),
			themeSources: config.themes.map( ( sourceString ) =>
				parseSourceString( sourceString, { hasTests: false, workDirectoryPath } )
			),
		};
	},
};

/**
 *
 * @param {string} sourceString
 * @param {Object} options
 * @param {boolean} options.hasTests
 * @param {string} options.workDirectoryPath
 * @return {Source}
 */
function parseSourceString( sourceString, { hasTests, workDirectoryPath } ) {
	if ( sourceString === null ) {
		return null;
	}

	if (
		sourceString.startsWith( '.' ) ||
		sourceString.startsWith( HOME_PATH_PREFIX ) ||
		path.isAbsolute( sourceString )
	) {
		let sourcePath;
		if ( sourceString.startsWith( HOME_PATH_PREFIX ) ) {
			sourcePath = path.resolve( os.homedir(), sourceString.substring( HOME_PATH_PREFIX.length ) );
		} else {
			sourcePath = path.resolve( sourceString );
		}
		const basename = path.basename( sourcePath );
		return {
			type: 'local',
			path: sourcePath,
			...( hasTests && { testsPath: path.resolve( workDirectoryPath, `tests-${ basename }` ) } ),
			basename,
		};
	}

	const gitHubFields = sourceString.match( /^([\w-]+)\/([\w-]+)(?:#([\w-]+))?$/ );
	if ( gitHubFields ) {
		return {
			type: 'git',
			url: `https://github.com/${ gitHubFields[ 1 ] }/${ gitHubFields[ 2 ] }.git`,
			ref: gitHubFields[ 3 ] || 'master',
			path: path.resolve( workDirectoryPath, gitHubFields[ 2 ] ),
			...( hasTests && {
				testsPath: path.resolve( workDirectoryPath, `tests-${ gitHubFields[ 2 ] }` ),
			} ),
			basename: gitHubFields[ 2 ],
		};
	}

	throw new ValidationError( `Invalid or unrecognized source: ${ sourceString }` );
}

/**
 *
 * @param {string} data
 * @return {string}
 */
function md5( data ) {
	return crypto
		.createHash( 'md5' )
		.update( data )
		.digest( 'hex' );
}
