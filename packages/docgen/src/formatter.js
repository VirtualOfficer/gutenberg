/**
 * Internal dependencies
 */
const getParamType = require( './get-param-type-as-string' );

const formatParams = ( params, docs ) => {
	if ( params && params.length > 0 ) {
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( '**Parameters**' );
		docs.push( '\n' );
		docs.push( ...params.map(
			( param ) => `\n- **${ param.name }** \`${ getParamType( param ) }\`: ${ cleanSpaces( param.description ) }`
		) );
	}
};

const cleanSpaces = ( paragraph ) =>
	paragraph ?
		paragraph.split( '\n' ).map(
			( sentence ) => sentence.trim()
		).reduce(
			( acc, current ) => acc + ' ' + current,
			''
		).trim() :
		'';

const formatExample = ( example, docs ) => {
	if ( example && example.length === 1 ) {
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( '**Example**' );
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( example[ 0 ].description );
	}
};

const formatOutput = ( output, docs ) => {
	if ( output && output.length === 1 ) {
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( '**Returns**' );
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( `\`${ getParamType( output[ 0 ] ) }\` ${ cleanSpaces( output[ 0 ].description ) }` );
	}
};

module.exports = function( artifacts ) {
	const docs = [ '# API' ];
	docs.push( '\n' );
	docs.push( '\n' );
	artifacts.sort( ( first, second ) => {
		const firstName = first.name.toUpperCase();
		const secondName = second.name.toUpperCase();
		if ( firstName < secondName ) {
			return -1;
		}
		if ( firstName > secondName ) {
			return 1;
		}
		return 0;
	} );
	if ( artifacts && artifacts.length > 0 ) {
		artifacts.forEach( ( artifact ) => {
			docs.push( `## ${ artifact.name }` );
			docs.push( '\n' );
			docs.push( '\n' );
			docs.push( cleanSpaces( artifact.description ) );
			formatExample( artifact.tags.filter( ( tag ) => tag.title === 'example' ), docs );
			formatParams( artifact.params, docs );
			formatOutput( artifact.return, docs );
			docs.push( '\n' );
			docs.push( '\n' );
		} );
		docs.pop(); // remove last \n, we want one blank line at the end of the file.
	} else {
		docs.push( 'Nothing to document.' );
		docs.push( '\n' );
	}
	return docs.join( '' );
};
