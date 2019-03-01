/**
 * Node dependencies.
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * External dependencies.
 */
const test = require( 'tape' );

/**
 * Internal dependencies.
 */
const getIntermediateRepresentation = require( '../src/get-intermediate-representation' );

test( 'default export (JSDoc in export statement)', function( t ) {
	const tokenClassAnonymous = fs.readFileSync(
		path.join( __dirname, './fixtures/default-class-anonymous.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenClassAnonymous ) ), [ {
		name: 'default',
		description: 'Class declaration example.',
		tags: [],
	} ] );
	const tokenClassNamed = fs.readFileSync(
		path.join( __dirname, './fixtures/default-class-named.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenClassNamed ) ), [ {
		name: 'default',
		description: 'Class declaration example.',
		tags: [],
	} ] );
	const tokenFnAnonymous = fs.readFileSync(
		path.join( __dirname, './fixtures/default-function-anonymous.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenFnAnonymous ) ), [ {
		name: 'default',
		description: 'Function declaration example.',
		tags: [],
	} ] );
	const tokenFnNamed = fs.readFileSync(
		path.join( __dirname, './fixtures/default-function-named.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenFnNamed ) ), [ {
		name: 'default',
		description: 'Function declaration example.',
		tags: [],
	} ] );
	const tokenVariable = fs.readFileSync(
		path.join( __dirname, './fixtures/default-variable.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenVariable ) ), [ {
		name: 'default',
		description: 'Variable declaration example.',
		tags: [],
	} ] );
	t.end();
} );

test( 'default export (JSDoc in identifier declaration, same file)', function( t ) {
	const token = fs.readFileSync(
		path.join( __dirname, './fixtures/default-identifier.json' ),
		'utf-8'
	);
	const ast = fs.readFileSync(
		path.join( __dirname, './fixtures/default-identifier-ast.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( token ), JSON.parse( ast ) ), [ {
		name: 'default',
		description: 'Class declaration example.',
		tags: [],
	} ] );
	t.end();
} );

test( 'named export (JSDoc in export statement)', function( t ) {
	const tokenClass = fs.readFileSync(
		path.join( __dirname, './fixtures/named-class.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenClass ) ), [ {
		name: 'MyDeclaration',
		description: 'My declaration example.',
		tags: [],
	} ] );
	const tokenFn = fs.readFileSync(
		path.join( __dirname, './fixtures/named-function.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenFn ) ), [ {
		name: 'myDeclaration',
		description: 'My declaration example.',
		tags: [],
	} ] );
	const tokenVariable = fs.readFileSync(
		path.join( __dirname, './fixtures/named-variable.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenVariable ) ), [ {
		name: 'myDeclaration',
		description: 'My declaration example.',
		tags: [],
	} ] );
	const tokenVariables = fs.readFileSync(
		path.join( __dirname, './fixtures/named-variables.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokenVariables ) ), [
		{ name: 'firstDeclaration', description: 'My declaration example.', tags: [] },
		{ name: 'secondDeclaration', description: 'My declaration example.', tags: [] },
	] );
	t.end();
} );

test( 'named export (JSDoc in identifier declaration, same file)', function( t ) {
	const token = fs.readFileSync(
		path.join( __dirname, './fixtures/named-identifier.json' ),
		'utf-8'
	);
	const ast = fs.readFileSync(
		path.join( __dirname, './fixtures/named-identifier-ast.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( token ), JSON.parse( ast ) ), [ {
		name: 'myDeclaration',
		description: 'My declaration example.',
		tags: [] },
	] );
	const tokens = fs.readFileSync(
		path.join( __dirname, './fixtures/named-identifiers.json' ),
		'utf-8'
	);
	const asts = fs.readFileSync(
		path.join( __dirname, './fixtures/named-identifiers-ast.json' ),
		'utf-8'
	);
	t.deepEqual( getIntermediateRepresentation( JSON.parse( tokens ), JSON.parse( asts ) ), [
		{ name: 'functionDeclaration', description: 'Function declaration example.', tags: [] },
		{ name: 'variableDeclaration', description: 'Variable declaration example.', tags: [] },
		{ name: 'ClassDeclaration', description: 'Class declaration example.', tags: [] },
	] );
	t.end();
} );

test( 'named export (JSDoc in identifer declaration, module dependency)', function( t ) {
	const tokens = fs.readFileSync(
		path.join( __dirname, './fixtures/named-default.json' ),
		'utf-8'
	);
	const getCodeFromPath = () => JSON.parse( fs.readFileSync(
		path.join( __dirname, './fixtures/named-default-module-ir.json' ),
		'utf-8'
	) );
	t.deepEqual(
		getIntermediateRepresentation( JSON.parse( tokens ), { body: [] }, getCodeFromPath ),
		[ { name: 'default', description: 'Module declaration.', tags: [] } ] );
	t.end();
} );
