'use strict';
/**
 *
 * @param {Config} config
 * @return {Object}
 */
module.exports = function buildDockerComposeConfig( config ) {
	const pluginMounts = config.pluginSources.map(
		( source ) => `${ source.path }:/var/www/html/wp-content/plugins/${ source.basename }`
	);

	const themeMounts = config.themeSources.map(
		( source ) => `${ source.path }:/var/www/html/wp-content/themes/${ source.basename }`
	);

	const developmentMounts = [
		`${ config.coreSource ? config.coreSource.path : 'wordpress' }:/var/www/html`,
		...pluginMounts,
		...themeMounts,
	];

	const testsMounts = [
		`${ config.coreSource ? config.coreSource.testsPath : 'tests-wordpress' }:/var/www/html`,
		...pluginMounts,
		...themeMounts,
	];

	return {
		version: '3.7',
		services: {
			mysql: {
				image: 'mariadb',
				environment: {
					MYSQL_ALLOW_EMPTY_PASSWORD: 'yes',
				},
			},
			wordpress: {
				depends_on: [ 'mysql' ],
				image: 'wordpress',
				ports: [ '${WP_ENV_PORT:-8888}:80' ],
				environment: {
					WORDPRESS_DEBUG: '1',
				},
				volumes: developmentMounts,
			},
			'tests-wordpress': {
				depends_on: [ 'mysql' ],
				image: 'wordpress',
				ports: [ '${WP_ENV_TESTS_PORT:-8889}:80' ],
				environment: {
					WORDPRESS_DEBUG: '1',
				},
				volumes: testsMounts,
			},
			cli: {
				depends_on: [ 'wordpress' ],
				image: 'wordpress:cli',
				volumes: developmentMounts,
			},
			'tests-cli': {
				depends_on: [ 'wordpress' ],
				image: 'wordpress:cli',
				volumes: testsMounts,
			},
			composer: {
				image: 'composer',
				volumes: [ `${ config.configDirectoryPath }:/app` ],
			},
		},
		volumes: {
			...( ! config.coreSource && { wordpress: {} } ),
			...( ! config.coreSource && { 'tests-wordpress': {} } ),
		},
	};
};
