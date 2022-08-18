/**
 * External dependencies
 */
const { command } = require( 'execa' );
const glob = require( 'fast-glob' );
const { resolve } = require( 'path' );
const { existsSync } = require( 'fs' );
const { mkdtemp, readFile } = require( 'fs' ).promises;
const npmPackageArg = require( 'npm-package-arg' );
const { tmpdir } = require( 'os' );
const { join } = require( 'path' );
const rimraf = require( 'rimraf' ).sync;

/**
 * Internal dependencies
 */
const CLIError = require( './cli-error' );
const { info } = require( './log' );
const prompts = require( './prompts' );

const predefinedPluginTemplates = {
	es5: {
		defaultValues: {
			slug: 'example-es5',
			title: 'Example (ES5)',
			description:
				'Example block scaffolded with Create Block tool – no build step required.',
			dashicon: 'smiley',
			wpScripts: false,
			editorScript: 'file:./index.js',
			editorStyle: 'file:./editor.css',
			style: 'file:./style.css',
		},
		templatesPath: join( __dirname, 'templates', 'es5' ),
		variants: {
			static: {
				slug: 'example-static-es5',
				title: 'Example Static Block (ES5)',
			},
			dynamic: {
				slug: 'example-dynamic-es5',
				title: 'Example Dynamic Block (ES5)',
			},
		},
	},
	standard: {
		defaultValues: {
			slug: 'example-block',
			title: 'Example Block',
			description: 'Example block scaffolded with Create Block tool.',
			dashicon: 'smiley',
			supports: {
				html: false,
			},
		},
		variants: {
			static: {
				slug: 'example-static-block',
				title: 'Example Static Block',
			},
			dynamic: {
				slug: 'example-dynamic-block',
				title: 'Example Dynamic Block',
			},
		},
	},
};

const getOutputTemplates = async ( outputTemplatesPath ) => {
	const outputTemplatesFiles = await glob( '**/*.mustache', {
		cwd: outputTemplatesPath,
		dot: true,
	} );
	return Object.fromEntries(
		await Promise.all(
			outputTemplatesFiles.map( async ( outputTemplateFile ) => {
				const outputFile = outputTemplateFile.replace(
					/\.mustache$/,
					''
				);
				const outputTemplate = await readFile(
					join( outputTemplatesPath, outputTemplateFile ),
					'utf8'
				);
				return [ outputFile, outputTemplate ];
			} )
		)
	);
};

const getOutputAssets = async ( outputAssetsPath ) => {
	const outputAssetFiles = await glob( '**/*', {
		cwd: outputAssetsPath,
		dot: true,
	} );
	return Object.fromEntries(
		await Promise.all(
			outputAssetFiles.map( async ( outputAssetFile ) => {
				const outputAsset = await readFile(
					join( outputAssetsPath, outputAssetFile )
				);
				return [ outputAssetFile, outputAsset ];
			} )
		)
	);
};

const externalTemplateExists = async ( templateName ) => {
	try {
		await command( `npm view ${ templateName }` );
	} catch ( error ) {
		return false;
	}
	return true;
};

const configToTemplate = async ( {
	pluginTemplatesPath,
	blockTemplatesPath,
	defaultValues = {},
	assetsPath,
	variants,
	...deprecated
} ) => {
	if ( defaultValues === null || typeof defaultValues !== 'object' ) {
		throw new CLIError( 'Template found but invalid definition provided.' );
	}

	if ( deprecated.templatesPath ) {
		pluginTemplatesPath = deprecated.templatesPath;
		defaultValues = {
			folderName: '.',
			editorScript: 'file:./build/index.js',
			editorStyle: 'file:./build/index.css',
			style: 'file:./build/style-index.css',
			...defaultValues,
		};
	} else {
		pluginTemplatesPath =
			pluginTemplatesPath || join( __dirname, 'templates', 'plugin' );
		blockTemplatesPath =
			blockTemplatesPath || join( __dirname, 'templates', 'block' );
	}

	return {
		blockOutputTemplates: blockTemplatesPath
			? await getOutputTemplates( blockTemplatesPath )
			: {},
		defaultValues,
		outputAssets: assetsPath ? await getOutputAssets( assetsPath ) : {},
		pluginOutputTemplates: await getOutputTemplates( pluginTemplatesPath ),
		variants,
	};
};

const getPluginTemplate = async ( templateName ) => {
	if ( predefinedPluginTemplates[ templateName ] ) {
		return await configToTemplate(
			predefinedPluginTemplates[ templateName ]
		);
	}

	try {
		if ( existsSync( resolve( templateName ) ) ) {
			return await configToTemplate( require( resolve( templateName ) ) );
		}
		return await configToTemplate( require( templateName ) );
	} catch ( error ) {
		if ( error instanceof CLIError ) {
			throw error;
		} else if ( error.code !== 'MODULE_NOT_FOUND' ) {
			throw new CLIError(
				`Invalid block template loaded. Error: ${ error.message }`
			);
		}
	}

	if ( ! ( await externalTemplateExists( templateName ) ) ) {
		throw new CLIError(
			`Invalid plugin template type name: "${ templateName }". Allowed values: ` +
				Object.keys( predefinedPluginTemplates )
					.map( ( name ) => `"${ name }"` )
					.join( ', ' ) +
				', or an existing npm package name.'
		);
	}

	let tempCwd;

	try {
		info( '' );
		info( 'Downloading template files. It might take some time...' );

		tempCwd = await mkdtemp( join( tmpdir(), 'wp-create-block-' ) );

		await command( `npm install ${ templateName } --no-save`, {
			cwd: tempCwd,
		} );

		const { name } = npmPackageArg( templateName );
		return await configToTemplate(
			require( require.resolve( name, {
				paths: [ tempCwd ],
			} ) )
		);
	} catch ( error ) {
		if ( error instanceof CLIError ) {
			throw error;
		} else {
			throw new CLIError(
				`Invalid plugin template downloaded. Error: ${ error.message }`
			);
		}
	} finally {
		if ( tempCwd ) {
			rimraf( tempCwd );
		}
	}
};

const getDefaultValues = ( pluginTemplate, variant ) => {
	return {
		$schema: 'https://schemas.wp.org/trunk/block.json',
		apiVersion: 2,
		namespace: 'create-block',
		category: 'widgets',
		author: 'The WordPress Contributors',
		license: 'GPL-2.0-or-later',
		licenseURI: 'https://www.gnu.org/licenses/gpl-2.0.html',
		version: '0.1.0',
		wpScripts: true,
		customScripts: {},
		wpEnv: false,
		npmDependencies: [],
		folderName: './src',
		editorScript: 'file:./index.js',
		editorStyle: 'file:./index.css',
		style: 'file:./style-index.css',
		...pluginTemplate.defaultValues,
		...pluginTemplate.variants[ variant ],
	};
};

const getPrompts = ( pluginTemplate, keys ) => {
	const defaultValues = getDefaultValues( pluginTemplate );
	return keys.map( ( promptName ) => {
		if ( promptName === 'variant' ) {
			prompts[ promptName ].choices = Object.keys(
				pluginTemplate.variants
			);
		}
		return {
			...prompts[ promptName ],
			default: defaultValues[ promptName ],
		};
	} );
};

const getTemplateVariantVars = ( variants, variant ) => {
	const variantVars = {};
	if ( variants ) {
		const variantNames = Object.keys( variants );
		const chosenVariant = variant ?? variantNames[ 0 ]; // If no variant is passed, use the first in the array as the default

		if ( variantNames.includes( chosenVariant ) ) {
			for ( const variantName of variantNames ) {
				const key =
					variantName.charAt( 0 ).toUpperCase() +
					variantName.slice( 1 );
				variantVars[ `is${ key }Variant` ] =
					chosenVariant === variantName ?? false;
			}
		} else {
			throw new CLIError(
				`"${ chosenVariant }" is not a valid variant for this template. Available variants are: ${ variantNames.join(
					', '
				) }`
			);
		}
	}
	return variantVars;
};

module.exports = {
	getPluginTemplate,
	getDefaultValues,
	getPrompts,
	getTemplateVariantVars,
};
