'use strict';
/**
 * External dependencies
 */
const path = require( 'path' );
const { writeFile, mkdir } = require( 'fs' ).promises;
const { existsSync } = require( 'fs' );
const yaml = require( 'js-yaml' );
const os = require( 'os' );

/**
 * Internal dependencies
 */
const { loadConfig } = require( './config' );
const buildDockerComposeConfig = require( './build-docker-compose-config' );

/**
 * @typedef {import('./config').WPConfig} WPConfig
 */

/**
 * Initializes the local environment so that Docker commands can be run. Reads
 * ./.wp-env.json, creates ~/.wp-env, ~/.wp-env/docker-compose.yml, and
 * ~/.wp-env/Dockerfile.
 *
 * @param {Object}  options
 * @param {Object}  options.spinner      A CLI spinner which indicates progress.
 * @param {boolean} options.debug        True if debug mode is enabled.
 * @param {string}  options.xdebug       The Xdebug mode to set. Defaults to "off".
 * @param {boolean} options.writeChanges If true, writes the parsed config to the
 *                                       required docker files like docker-compose
 *                                       and Dockerfile. By default, this is false
 *                                       and only the `start` command writes any
 *                                       changes.
 * @return {WPConfig} The-env config object.
 */
module.exports = async function initConfig( {
	spinner,
	debug,
	xdebug = 'off',
	writeChanges = false,
} ) {
	const config = await loadConfig( path.resolve( '.' ) );
	config.debug = debug;

	// Adding this to the config allows the start command to understand that the
	// config has changed when only the xdebug param has changed. This is needed
	// so that Docker will rebuild the image whenever the xdebug flag changes.
	config.xdebug = xdebug;

	const dockerComposeConfig = buildDockerComposeConfig( config );

	if ( config.debug ) {
		spinner.info(
			`Config:\n${ JSON.stringify(
				config,
				null,
				4
			) }\n\nDocker Compose Config:\n${ JSON.stringify(
				dockerComposeConfig,
				null,
				4
			) }`
		);
		spinner.start();
	}

	/**
	 * We avoid writing changes most of the time so that we can better pass params
	 * to the start command. For example, say you start wp-env with Xdebug enabled.
	 * If you then run another command, like opening bash in the wp instance, it
	 * would turn off Xdebug in the Dockerfile because it wouldn't have the --xdebug
	 * arg. This basically makes it such that wp-env start is the only command
	 * which updates any of the Docker configuration.
	 */
	if ( writeChanges ) {
		await mkdir( config.workDirectoryPath, { recursive: true } );

		await writeFile(
			config.dockerComposeConfigPath,
			yaml.dump( dockerComposeConfig )
		);

		await writeFile(
			path.resolve( config.workDirectoryPath, 'WordPress.Dockerfile' ),
			wordpressDockerFileContents(
				getBaseDockerImage( config.env.development.phpVersion, false ),
				config
			)
		);
		await writeFile(
			path.resolve(
				config.workDirectoryPath,
				'Tests-WordPress.Dockerfile'
			),
			wordpressDockerFileContents(
				getBaseDockerImage( config.env.tests.phpVersion, false ),
				config
			)
		);

		await writeFile(
			path.resolve( config.workDirectoryPath, 'CLI.Dockerfile' ),
			cliDockerFileContents(
				getBaseDockerImage( config.env.development.phpVersion, true ),
				config
			)
		);
		await writeFile(
			path.resolve( config.workDirectoryPath, 'Tests-CLI.Dockerfile' ),
			cliDockerFileContents(
				getBaseDockerImage( config.env.tests.phpVersion, true ),
				config
			)
		);
	} else if ( ! existsSync( config.workDirectoryPath ) ) {
		spinner.fail(
			'wp-env has not yet been initialized. Please run `wp-env start` to install the WordPress instance before using any other commands. This is only necessary to set up the environment for the first time; it is typically not necessary for the instance to be running after that in order to use other commands.'
		);
		process.exit( 1 );
	}

	return config;
};

/**
 * Generates the Dockerfile used by wp-env's `wordpress` and `tests-wordpress` instances.
 *
 * @param {string}   image  The base docker image to use.
 * @param {WPConfig} config The configuration object.
 *
 * @return {string} The dockerfile contents.
 */
function wordpressDockerFileContents( image, config ) {
	return `FROM ${ image }

# Update apt sources for archived versions of Debian.

# stretch (https://lists.debian.org/debian-devel-announce/2023/03/msg00006.html)
RUN sed -i 's|deb.debian.org/debian stretch|archive.debian.org/debian stretch|g' /etc/apt/sources.list
RUN sed -i 's|security.debian.org/debian-security stretch|archive.debian.org/debian-security stretch|g' /etc/apt/sources.list
RUN sed -i '/stretch-updates/d' /etc/apt/sources.list

# Create the host's user so that we can match ownership in the container.
ARG HOST_USERNAME
ARG HOST_UID
ARG HOST_GID
# When the IDs are already in use we can still safely move on.
RUN groupadd -g $HOST_GID $HOST_USERNAME || true
RUN useradd -m -u $HOST_UID -g $HOST_GID $HOST_USERNAME || true

# Install any dependencies we need in the container.
${ installDependencies( 'wordpress', config ) }`;
}

/**
 * Generates the Dockerfile used by wp-env's `cli` and `tests-cli` instances.
 *
 * @param {string}   image  The base docker image to use.
 * @param {WPConfig} config The configuration object.
 *
 * @return {string} The dockerfile contents.
 */
function cliDockerFileContents( image, config ) {
	return `FROM ${ image }

# Switch to root so we can create users.
USER root

# Create the host's user so that we can match ownership in the container.
ARG HOST_USERNAME
ARG HOST_UID
ARG HOST_GID
# When the IDs are already in use we can still safely move on.
RUN addgroup -g $HOST_GID $HOST_USERNAME || true
RUN adduser -h /home/$HOST_USERNAME -G $( getent group $HOST_GID | cut -d: -f1 ) -u $HOST_UID $HOST_USERNAME || true

# Install any dependencies we need in the container.
${ installDependencies( 'cli', config ) }
	
# Switch back to the original user now that we're done.
USER www-data

# Have the container sleep infinitely to keep it alive for us to run commands on it.
CMD [ "/bin/sh", "-c", "while true; do sleep 2073600; done" ]
`;
}

/**
 * Gets the base docker image to use based on our input.
 *
 * @param {string}  phpVersion The version of PHP to get an image for.
 * @param {boolean} isCLI      Indicates whether or not the image is for a CLI.
 * @return {string} The Docker image to use.
 */
function getBaseDockerImage( phpVersion, isCLI ) {
	// We can rely on a consistent format for PHP versions.
	if ( phpVersion ) {
		phpVersion = ( isCLI ? '-' : ':' ) + 'php' + phpVersion;
	} else {
		phpVersion = '';
	}

	let wordpressImage = 'wordpress';
	if ( isCLI ) {
		wordpressImage += ':cli';
	}

	return wordpressImage + phpVersion;
}

/**
 * Generates content for the Dockerfile to install dependencies.
 *
 * @param {string}   environment The kind of environment that we're installing dependencies on ('wordpress' or 'cli').
 * @param {WPConfig} config      The configuration object.
 *
 * @return {string} The Dockerfile content for installing dependencies.
 */
function installDependencies( environment, config ) {
	let dockerFileContent = '';

	// At times we may need to evaluate the environment. This is because the
	// WordPress image uses Ubuntu while the CLI image uses Alpine.

	// Start with some environment-specific dependency installations.
	switch ( environment ) {
		case 'wordpress': {
			dockerFileContent += `
# Make sure we're working with the latest packages.
RUN apt-get -qy update

# Install some basic PHP dependencies.
RUN apt-get -qy install $PHPIZE_DEPS && touch /usr/local/etc/php/php.ini

# Set up sudo so they can have root access.
RUN apt-get -qy install sudo
RUN echo "$HOST_USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers`;
			break;
		}
		case 'cli': {
			dockerFileContent += `
RUN apk update
RUN apk --no-cache add $PHPIZE_DEPS && touch /usr/local/etc/php/php.ini
RUN apk --no-cache add sudo linux-headers
RUN echo "$HOST_USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers`;
			break;
		}
		default: {
			throw new Error( `Invalid environment "${ environment }" given` );
		}
	}

	dockerFileContent += getXdebugConfig( config );

	// Add better PHP settings.
	dockerFileContent += `
RUN echo 'upload_max_filesize = 1G' >> /usr/local/etc/php/php.ini
RUN echo 'post_max_size = 1G' >> /usr/local/etc/php/php.ini`;

	// Make sure Composer is available for use in all environments.
	dockerFileContent += `
RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
RUN export COMPOSER_HASH=\`curl -sS https://composer.github.io/installer.sig\` && php -r "if (hash_file('SHA384', '/tmp/composer-setup.php') === '$COMPOSER_HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('/tmp/composer-setup.php'); } echo PHP_EOL;"
RUN php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
RUN rm /tmp/composer-setup.php`;

	// Install any Composer packages we might need globally.
	// Make sure to do this as the user and ensure the binaries are available in the $PATH.
	dockerFileContent += `
USER $HOST_USERNAME
ENV PATH="\${PATH}:/home/$HOST_USERNAME/.composer/vendor/bin"
RUN composer global require --dev yoast/phpunit-polyfills:"^1.0"
USER root`;

	return dockerFileContent;
}

/**
 * Gets the Xdebug config based on the options in the config object.
 *
 * @param {WPConfig} config
 * @return {string} The Xdebug config -- can be an empty string when it's not used.
 */
function getXdebugConfig( config ) {
	if ( config.xdebug === 'off' ) {
		return '';
	}

	// Throw an error if someone tries to use Xdebug with an unsupported PHP version.
	if ( config.env.development.phpVersion ) {
		const versionTokens = config.env.development.phpVersion.split( '.' );
		const majorVer = parseInt( versionTokens[ 0 ] );
		const minorVer = parseInt( versionTokens[ 1 ] );

		if ( isNaN( majorVer ) || isNaN( minorVer ) ) {
			throw new Error(
				'Something went wrong when parsing the PHP version.'
			);
		}

		// Xdebug 3 supports 7.2 and higher
		// Ensure user has specified a compatible PHP version.
		if ( majorVer < 7 || ( majorVer === 7 && minorVer < 2 ) ) {
			throw new Error( 'Cannot use XDebug 3 on PHP < 7.2.' );
		}
	}

	// Discover client host does not appear to work on macOS with Docker.
	const clientDetectSettings =
		os.type() === 'Linux'
			? 'xdebug.discover_client_host=true'
			: 'xdebug.client_host="host.docker.internal"';

	return `
RUN if [ -z "$(pecl list | grep xdebug)" ] ; then pecl install xdebug ; fi
RUN docker-php-ext-enable xdebug
RUN echo 'xdebug.start_with_request=yes' >> /usr/local/etc/php/php.ini
RUN echo 'xdebug.mode=${ config.xdebug }' >> /usr/local/etc/php/php.ini
RUN echo '${ clientDetectSettings }' >> /usr/local/etc/php/php.ini`;
}
