/**
 * External dependencies.
 */
const doctrine = require( 'doctrine' );
const { first } = require( 'lodash' );

/**
 * Internal dependencies.
 */
const getLeadingComments = require( './get-leading-comments' );
const getNameDeclaration = require( './get-name-declaration' );

const getJSDoc = ( token ) => {
	let jsdoc;
	const comments = getLeadingComments( token );
	if ( comments ) {
		jsdoc = doctrine.parse( comments, { unwrap: true, recoverable: true } );
	}
	return jsdoc;
};

const isIdentifier = ( token ) => {
	if ( token.declaration !== null &&
		token.declaration.type === 'Identifier' ) {
		return true;
	}
	if ( token.declaration === null &&
		token.specifiers !== null &&
		token.specifiers.length > 0 ) {
		return true;
	}
};

module.exports = function( ast, token ) {
	let jsdoc = getJSDoc( token );
	const name = getNameDeclaration( token );
	if ( jsdoc === undefined && isIdentifier( token ) ) {
		const candidates = ast.body.filter( ( node ) => {
			return ( node.type === 'FunctionDeclaration' && node.id.name === name ) ||
				( node.type === 'VariableDeclaration' && first( node.declarations ).id.name === name );
		} );
		if ( candidates.length === 1 ) {
			jsdoc = getJSDoc( candidates[ 0 ] );
		}
	}

	if ( jsdoc === undefined ) {
		jsdoc = { description: 'Undocumented declaration.', tags: [] };
	}

	jsdoc.name = name;
	return jsdoc;
};
