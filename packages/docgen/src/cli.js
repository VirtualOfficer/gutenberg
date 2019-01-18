/**
 * Node dependencies.
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Internal dependencies.
 */
const engine = require( './engine' );
const formatter = require( './formatter' );

const packageName = process.argv[ 2 ];
if ( packageName === undefined ) {
	process.stdout.write( '\nUsage: <path-to-docgen> <gutenberg-package-name>\n\n\n' );
	process.exit( 1 );
}

const root = path.join( __dirname, '../../../' );
// TODO:
// - take input file from package.json?
// - make CLI take input file instead of package?
const srcDir = path.join( root, `packages/${ packageName }/src/` );
const input = path.join( srcDir, `index.js` );
const doc = path.join( root, `packages/${ packageName }/api.md` );
const ir = path.join( root, `packages/${ packageName }/ir.json` );
const tokens = path.join( root, `packages/${ packageName }/tokens.json` );
const ast = path.join( root, `packages/${ packageName }/ast.json` );

const getCodeFromPath = ( file ) => fs.readFileSync( path.join( srcDir, file + '.js' ), 'utf8' );

fs.readFile( input, 'utf8', ( err, code ) => {
	if ( err ) {
		process.stdout.write( `\n${ input } does not exists.\n\n\n` );
		process.exit( 1 );
	}

	const result = engine( code, getCodeFromPath );
	fs.writeFileSync( doc, formatter( result.ir ) );
	fs.writeFileSync( ir, JSON.stringify( result.ir ) );
	fs.writeFileSync( tokens, JSON.stringify( result.tokens ) );
	fs.writeFileSync( ast, JSON.stringify( result.ast ) );
} );
