/**
 * Generates theme.json documentation using theme.json schema.
 * Reads from  : schemas/json/theme.json
 * Publishes to: docs/reference-guides/theme-json-reference/theme-json-living.md
 */

/**
 * External dependencies
 */
import fs from 'fs';
import $RefParser from '@apidevtools/json-schema-ref-parser';

/**
 * Path to root project directory.
 *
 * @type {URL}
 */
const THEME_JSON_SCHEMA_FILE = new URL(
	'../../schemas/json/theme.json',
	import.meta.url
);

/**
 * Path to theme json schema file.
 *
 * @type {URL}
 */
const THEME_JSON_REF_DOC = new URL(
	'../../docs/reference-guides/theme-json-reference/theme-json-living.md',
	import.meta.url
);

/**
 * Start token for matching string in doc file.
 *
 * @type {string}
 */
const START_TOKEN = '<!-- START TOKEN Autogenerated - DO NOT EDIT -->';

/**
 * Start token for matching string in doc file.
 *
 * @type {string}
 */
const END_TOKEN = '<!-- END TOKEN Autogenerated - DO NOT EDIT -->';

/**
 * Regular expression using tokens for matching in doc file.
 * Note: `.` does not match new lines, so [^] is used.
 *
 * @type {RegExp}
 */
const TOKEN_PATTERN = new RegExp( START_TOKEN + '[^]*' + END_TOKEN );

const themejson = await $RefParser.dereference(
	THEME_JSON_SCHEMA_FILE.pathname
);

/**
 * Convert settings properties to markup.
 *
 * @param {Object} struct
 * @return {string} markup
 */
const getSettingsPropertiesMarkup = ( struct ) => {
	if ( ! ( 'properties' in struct ) ) {
		return '';
	}
	const props = struct.properties;
	const ks = Object.keys( props );
	if ( ks.length < 1 ) {
		return '';
	}

	let markup = '';
	markup += '| Property  | Type   | Default | Props  |\n';
	markup += '| ---       | ---    | ---     | ---    |\n';
	ks.forEach( ( key ) => {
		const def = 'default' in props[ key ] ? props[ key ].default : '';
		let type = props[ key ].type || '';
		let ps =
			props[ key ].type === 'array'
				? Object.keys( props[ key ].items?.properties ?? {} )
						.sort()
						.join( ', ' )
				: '';

		/*
		 * Handle`oneOf` type definitions - extract the type and properties.
		 * See: https://json-schema.org/understanding-json-schema/reference/combining#oneOf
		 */
		if ( props[ key ].oneOf && Array.isArray( props[ key ].oneOf ) ) {
			if ( ! type ) {
				type = props[ key ].oneOf
					.map( ( item ) => item.type )
					.join( ', ' );
			}

			if ( ! ps ) {
				ps = props[ key ].oneOf
					.map( ( item ) =>
						item?.type === 'object' && item?.properties
							? '_{' +
							  Object.keys( item.properties )
									.sort()
									.join( ', ' ) +
							  '}_'
							: ''
					)
					.join( ' ' );
			}
		}

		markup += `| ${ key } | ${ type } | ${ def } | ${ ps } |\n`;
	} );

	return markup;
};

/**
 * Convert style properties to markup.
 *
 * @param {Object} struct
 * @return {string} markup
 */
const getStylePropertiesMarkup = ( struct ) => {
	if ( ! ( 'properties' in struct ) ) {
		return '';
	}
	const props = struct.properties;
	const ks = Object.keys( props );
	if ( ks.length < 1 ) {
		return '';
	}

	let markup = '';
	markup += '| Property  | Type   | Props  |\n';
	markup += '| ---       | ---    | ---    |\n';
	ks.forEach( ( key ) => {
		const ps =
			props[ key ].type === 'object'
				? Object.keys( props[ key ].properties ).sort().join( ', ' )
				: '';
		const type = formatType( props[ key ] );
		markup += `| ${ key } | ${ type } | ${ ps } |\n`;
	} );

	return markup;
};

/**
 * Parses a section for description and properties and
 * returns a marked up version.
 *
 * @param {string} title
 * @param {Object} data
 * @param {string} type  settings|style
 * @return {string} markup
 */
const getSectionMarkup = ( title, data, type ) => {
	const markupFn =
		type === 'settings'
			? getSettingsPropertiesMarkup
			: getStylePropertiesMarkup;

	return `
### ${ title }

${ data.description }

${ markupFn( data ) }
---
`;
};

let autogen = '';

/**
 * Format list of types.
 *
 * @param {Object} prop
 * @return {string} type
 */
const formatType = ( prop ) => {
	let type = prop.type || '';

	if ( prop.hasOwnProperty( 'anyOf' ) || prop.hasOwnProperty( 'oneOf' ) ) {
		const propTypes = prop.anyOf || prop.oneOf;
		const types = [];

		propTypes.forEach( ( item ) => {
			if ( item.type ) {
				types.push( item.type );
			}
		} );

		type = [ ...new Set( types ) ].join( ', ' );
	}

	return type;
};

// Settings
const settings = themejson.definitions.settingsProperties.allOf.flatMap(
	( settingsProperties ) => Object.entries( settingsProperties.properties )
);
// This property is only available at the root level, so it isn't included in the settingsProperties.
settings.unshift( [
	'useRootPaddingAwareAlignments',
	themejson.properties.settings.allOf[ 1 ].properties
		.useRootPaddingAwareAlignments,
] );
autogen += '## Settings' + '\n\n';
settings.forEach( ( [ section, data ] ) => {
	autogen += getSectionMarkup( section, data, 'settings' );
} );

// Styles
const styles = Object.entries(
	themejson.definitions.stylesProperties.properties
);
autogen += '## Styles' + '\n\n';
styles.forEach( ( [ section, data ] ) => {
	autogen += getSectionMarkup( section, data, 'styles' );
} );

const templateTableGeneration = ( themeJson, context ) => {
	let content = '';
	content += '## ' + context + '\n\n';
	content += themeJson.properties[ context ].description + '\n\n';
	content +=
		'Type: `' + themeJson.properties[ context ].items.type + '`.\n\n';
	content += '| Property | Description | Type |\n';
	content += '| ---      | ---         | ---  |\n';
	Object.keys( themeJson.properties[ context ].items.properties ).forEach(
		( key ) => {
			content += `| ${ key } | ${ themeJson.properties[ context ].items.properties[ key ].description } | ${ themeJson.properties[ context ].items.properties[ key ].type } |\n`;
		}
	);
	content += '\n\n';

	return content;
};

// customTemplates
autogen += templateTableGeneration( themejson, 'customTemplates' );

// templateParts
autogen += templateTableGeneration( themejson, 'templateParts' );

// Patterns
autogen += '## Patterns' + '\n\n';
autogen += themejson.properties.patterns.description + '\n';
autogen += 'Type: `' + themejson.properties.patterns.type + '`.\n\n';

// Read existing file to wrap auto generated content.
let docsContent = fs.readFileSync( THEME_JSON_REF_DOC, {
	encoding: 'utf8',
	flag: 'r',
} );

// Replace auto generated part with new generated docs.
autogen = START_TOKEN + '\n' + autogen + '\n' + END_TOKEN;
docsContent = docsContent.replace( TOKEN_PATTERN, autogen );

// Write back out.
fs.writeFileSync( THEME_JSON_REF_DOC, docsContent, { encoding: 'utf8' } );
