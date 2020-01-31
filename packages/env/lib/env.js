'use strict';
/**
 * External dependencies
 */
const util = require( 'util' );
const path = require( 'path' );
const fs = require( 'fs' ).promises;
const dockerCompose = require( 'docker-compose' );
const yaml = require( 'js-yaml' );

/**
 * Promisified dependencies
 */
const copyDir = util.promisify( require( 'copy-dir' ) );
const sleep = util.promisify( setTimeout );

/**
 * Internal dependencies
 */
const { ValidationError, readConfig } = require( './config' );
const downloadSource = require( './download-source' );
const buildDockerComposeConfig = require( './build-docker-compose-config' );

module.exports = {
	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.spinner
	 */
	async start( { spinner } ) {
		spinner.text = 'Initializing.';

		const configPath = path.resolve( '.wp-env.json' );
		const config = await readConfig( configPath );

		await fs.mkdir( config.workDirectoryPath, { recursive: true } );

		await fs.writeFile(
			config.dockerComposeConfigPath,
			yaml.dump( buildDockerComposeConfig( config ) )
		);

		spinner.text = 'Downloading WordPress.';

		const progresses = {};
		const getProgressSetter = ( id ) => ( progress ) => {
			progresses[ id ] = progress;
			spinner.text =
				'Downloading WordPress.\n' +
				Object.entries( progresses )
					.map( ( [ key, value ] ) => `  - ${ key }: ${ ( value * 100 ).toFixed( 0 ) }/100%` )
					.join( '\n' );
		};

		await Promise.all( [
			// Preemptively start the database while we wait for sources to download.
			dockerCompose.upOne( 'mysql', { config: config.dockerComposeConfigPath } ),

			( async () => {
				if ( config.coreSource ) {
					await downloadSource( config.coreSource, { onProgress: getProgressSetter( 'core' ) } );
					await copyCoreFiles( config.coreSource.path, config.coreSource.testsPath );
				}
			} )(),

			...config.pluginSources.map( ( source ) =>
				downloadSource( source, { onProgress: getProgressSetter( source.basename ) } )
			),

			...config.themeSources.map( ( source ) =>
				downloadSource( source, { onProgress: getProgressSetter( source.basename ) } )
			),
		] );

		spinner.text = 'Starting WordPress.';

		await dockerCompose.upMany( [ 'wordpress', 'tests-wordpress' ], {
			config: config.dockerComposeConfigPath,
		} );

		try {
			await checkDatabaseConnection( config );
		} catch ( error ) {
			// Wait 30 seconds for MySQL to accept connections.
			await retry( () => checkDatabaseConnection( config ), {
				times: 30,
				delay: 1000,
			} );

			// It takes 3-4 seconds for MySQL to be ready after it starts accepting connections.
			await sleep( 4000 );
		}

		// Retry WordPress installation in case MySQL *still* wasn't ready.
		await Promise.all( [
			retry( () => configureWordPress( 'development', config ), { times: 2 } ),
			retry( () => configureWordPress( 'tests', config ), { times: 2 } ),
		] );

		spinner.text = 'WordPress started.';
	},

	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.spinner
	 */
	async stop( { spinner } ) {
		spinner.text = 'Stopping WordPress.';

		const configPath = path.resolve( '.wp-env.json' );
		const { dockerComposeConfigPath } = await readConfig( configPath );

		await dockerCompose.down( { config: dockerComposeConfigPath } );

		spinner.text = 'Stopped WordPress.';
	},

	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.environment
	 * @param {Object} options.spinner
	 */
	async clean( { environment, spinner } ) {
		const description = `${ environment } environment${ environment === 'all' ? 's' : '' }`;
		spinner.text = `Cleaning ${ description }.`;

		const configPath = path.resolve( '.wp-env.json' );
		const config = await readConfig( configPath );

		await fs.mkdir( config.workDirectoryPath, { recursive: true } );

		await fs.writeFile(
			config.dockerComposeConfigPath,
			yaml.dump( buildDockerComposeConfig( config ) )
		);

		const tasks = [];

		if ( environment === 'all' || environment === 'development' ) {
			tasks.push(
				resetDatabase( 'development', config )
					.then( () => configureWordPress( 'development', config ) )
					.catch( () => {} )
			);
		}

		if ( environment === 'all' || environment === 'tests' ) {
			tasks.push(
				resetDatabase( 'tests', config )
					.then( () => configureWordPress( 'tests', config ) )
					.catch( () => {} )
			);
		}

		await Promise.all( tasks );

		spinner.text = `Cleaned ${ description }.`;
	},

	/**
	 *
	 * @param {Object} options
	 * @param {Object} options.container
	 * @param {Object} options.command
	 * @param {Object} options.spinner
	 */
	async run( { container, command, spinner } ) {
		command = command.join( ' ' );

		spinner.text = `Running \`${ command }\` in '${ container }'.`;

		const configPath = path.resolve( '.wp-env.json' );
		const config = await readConfig( configPath );

		await fs.mkdir( config.workDirectoryPath, { recursive: true } );

		await fs.writeFile(
			config.dockerComposeConfigPath,
			yaml.dump( buildDockerComposeConfig( config ) )
		);

		const result = await dockerCompose.run( container, command, {
			config: config.dockerComposeConfigPath,
			commandOptions: [ '--rm' ],
		} );

		if ( result.out ) {
			// eslint-disable-next-line no-console
			console.log( process.stdout.isTTY ? `\n\n${ result.out }\n\n` : result.out );
		} else if ( result.err ) {
			// eslint-disable-next-line no-console
			console.error( process.stdout.isTTY ? `\n\n${ result.err }\n\n` : result.err );
			throw result.err;
		}

		spinner.text = `Ran \`${ command }\` in '${ container }'.`;
	},

	ValidationError,
};

/**
 *
 * @param {string} fromPath
 * @param {string} toPath
 */
async function copyCoreFiles( fromPath, toPath ) {
	await copyDir( fromPath, toPath, {
		filter( stat, filepath, filename ) {
			if ( stat === 'symbolicLink' ) {
				return false;
			}
			if ( stat === 'directory' && filename === '.git' ) {
				return false;
			}
			if ( stat === 'directory' && filename === 'node_modules' ) {
				return false;
			}
			if ( stat === 'file' && filename === 'wp-config.php' ) {
				return false;
			}
			return true;
		},
	} );
}

/**
 *
 * @param {Function} action
 * @param {Object} options
 * @param {number} options.times
 * @param {delay=} options.delay
 */
async function retry( action, { times, delay = 5000 } ) {
	let tries = 0;
	while ( true ) {
		try {
			return await action();
		} catch ( error ) {
			if ( ++tries >= times ) {
				throw error;
			}
			await sleep( delay );
		}
	}
}

/**
 *
 * @param {Config} config
 */
async function checkDatabaseConnection( { dockerComposeConfigPath } ) {
	await dockerCompose.run( 'cli', 'wp db check', {
		config: dockerComposeConfigPath,
		commandOptions: [ '--rm' ],
	} );
}

/**
 *
 * @param {string} environment
 * @param {Config} config
 */
async function configureWordPress( environment, config ) {
	const options = {
		config: config.dockerComposeConfigPath,
		commandOptions: [ '--rm' ],
	};

	// Install WordPress.
	await dockerCompose.run(
		environment === 'development' ? 'cli' : 'tests-cli',
		`wp core install
			--url=localhost:${
				environment === 'development'
					? process.env.WP_ENV_PORT || '8888'
					: process.env.WP_ENV_TESTS_PORT || '8889'
			}
			--title='${ config.name }'
			--admin_user=admin
			--admin_password=password
			--admin_email=wordpress@example.com
			--skip-email`,
		options
	);

	// Activate all plugins.
	for ( const pluginSource of config.pluginSources ) {
		await dockerCompose.run(
			environment === 'development' ? 'cli' : 'tests-cli',
			`wp plugin activate ${ pluginSource.basename }`,
			options
		);
	}

	// Activate the first theme.
	const [ themeSource ] = config.themeSources;
	if ( themeSource ) {
		await dockerCompose.run(
			environment === 'development' ? 'cli' : 'tests-cli',
			`wp theme activate ${ themeSource.basename }`,
			options
		);
	}
}

/**
 *
 * @param {string} environment
 * @param {Config} config
 */
async function resetDatabase( environment, { dockerComposeConfigPath } ) {
	await dockerCompose.run(
		environment === 'development' ? 'cli' : 'tests-cli',
		'wp db reset --yes',
		{
			config: dockerComposeConfigPath,
			commandOptions: [ '--rm' ],
		}
	);
}
