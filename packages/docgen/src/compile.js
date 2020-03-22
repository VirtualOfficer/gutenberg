const ts = require( 'typescript' );
const { readFileSync } = require( 'fs' );

const { getExportStatements } = require( './get-export-statements' );

/**
 * Function that takes file path and returns compiled result
 *
 * @param {string} filePath the path to the file to be compiled
 */
module.exports = function( filePath ) {
	const options = {
		allowJs: true,
		target: ts.ScriptTarget.ES2020,
	};
	const host = ts.createCompilerHost( options, true );
	const raw = readFileSync( filePath ).toString();
	const code = raw.replace( /@wordpress/g, '__WORDPRESS_IMPORT__' );
	const sF = ts.createSourceFile( filePath, code, options.target, true );

	host.getSourceFile = () => sF;
	host.readFile = () => code;

	const program = ts.createProgram( [ filePath ], options, host );

	const typeChecker = program.getTypeChecker();
	const sourceFile = program.getSourceFile( filePath );
	const exportStatements = getExportStatements( sourceFile );

	return {
		program,
		typeChecker,
		sourceFile,
		exportStatements,
	};
};
