'use strict';

const defaultConfig = {
	rules: {
		'bin-type': 'error',
		'bundledDependencies-type': 'error',
		'config-type': 'error',
		'cpu-type': 'error',
		'dependencies-type': 'error',
		'description-type': 'error',
		'devDependencies-type': 'error',
		'directories-type': 'error',
		'engines-type': 'error',
		'files-type': 'error',
		'homepage-type': 'error',
		'keywords-type': 'error',
		'license-type': 'error',
		'main-type': 'error',
		'man-type': 'error',
		'name-format': 'error',
		'name-type': 'error',
		'no-restricted-dependencies': 'off',
		'no-restricted-devDependencies': 'off',
		'no-restricted-pre-release-dependencies': 'off',
		'no-restricted-pre-release-devDependencies': 'off',
		'optionalDependencies-type': 'error',
		'os-type': 'error',
		'peerDependencies-type': 'error',
		'prefer-absolute-version-dependencies': 'off',
		'prefer-absolute-version-devDependencies': 'off',
		'prefer-alphabetical-bundledDependencies': 'error',
		'prefer-alphabetical-dependencies': 'error',
		'prefer-alphabetical-devDependencies': 'error',
		'prefer-alphabetical-optionalDependencies': 'error',
		'prefer-alphabetical-peerDependencies': 'error',
		'prefer-caret-version-dependencies': 'off',
		'prefer-caret-version-devDependencies': 'off',
		'prefer-no-engineStrict': 'off',
		'prefer-no-version-zero-dependencies': 'off',
		'prefer-no-version-zero-devDependencies': 'off',
		'prefer-property-order': [
			'error',
			[
				'name',
				'version',
				'description',
				'author',
				'license',
				'keywords',
				'homepage',
				'repository',
				'bugs',
				'engines',
				'directories',
				'files',
				'type',
				'main',
				'module',
				'react-native',
				'types',
				'bin',
				'dependencies',
				'devDependencies',
				'peerDependencies',
				'publishConfig',
				'scripts',
			],
		],
		'prefer-tilde-version-dependencies': 'off',
		'prefer-tilde-version-devDependencies': 'off',
		'preferGlobal-type': 'error',
		'private-type': 'error',
		'repository-type': 'error',
		'require-author': 'error',
		'require-bin': 'off',
		'require-bugs': 'error',
		'require-bundledDependencies': 'off',
		'require-config': 'off',
		'require-contributors': 'off',
		'require-cpu': 'off',
		'require-dependencies': 'off',
		'require-description': 'error',
		'require-devDependencies': 'off',
		'require-directories': 'off',
		'require-engines': 'off',
		'require-files': 'off',
		'require-homepage': 'error',
		'require-keywords': 'error',
		'require-license': 'error',
		'require-main': 'off',
		'require-man': 'off',
		'require-module': 'off',
		'require-name': 'error',
		'require-optionalDependencies': 'off',
		'require-os': 'off',
		'require-peerDependencies': 'off',
		'require-preferGlobal': 'off',
		'require-private': 'off',
		'require-publishConfig': 'off',
		'require-repository': 'error',
		'require-repository-directory': 'off',
		'require-scripts': 'off',
		'require-version': 'error',
		'scripts-type': 'error',
		'valid-values-author': 'off',
		'valid-values-license': [
			'error',
			[ 'GPL-2.0-or-later', 'GPL-3.0-or-later' ],
		],
		'valid-values-private': 'off',
		'version-format': 'error',
		'version-type': 'error',
	},
};

module.exports = defaultConfig;
