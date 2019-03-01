const formatParams = ( params, docs ) => {
	if ( params && params.length > 0 ) {
		docs.push( '*Parameters*' );
		docs.push( '\n' );
		docs.push( ...params.map(
			( param ) => {
				return `\n * ${ param.name }: ${ param.description }`;
			} )
		);
		docs.push( '\n' );
	}
};

const formatOutput = ( output, docs ) => {
	if ( output && output.length === 1 ) {
		docs.push( '*Output*' );
		docs.push( '\n' );
		docs.push( '\n' );
		docs.push( output[ 0 ].description.replace( '\n', ' ' ) );
		docs.push( '\n' );
	}
};

module.exports = function( artifacts ) {
	const docs = [ '# API' ];
	docs.push( '\n' );
	docs.push( '\n' );
	if ( artifacts && artifacts.length > 0 ) {
		artifacts.forEach( ( artifact ) => {
			docs.push( `## ${ artifact.name }` );
			docs.push( '\n' );
			docs.push( '\n' );
			docs.push( artifact.description.replace( '\n', ' ' ) );
			docs.push( '\n' );
			docs.push( '\n' );
			formatParams( artifact.params, docs );
			docs.push( '\n' );
			formatOutput( artifact.return, docs );
			docs.push( '\n' );
		} );
		docs.pop(); // remove last \n, we want one blank line at the end of the file.
	} else {
		docs.push( 'Nothing to document.' );
		docs.push( '\n' );
	}
	return docs.join( '' );
};
