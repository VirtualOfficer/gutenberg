/**
 * External dependencies.
 */
const test = require( 'tape' );

/**
 * Internal dependencies.
 */
const engine = require( '../src/engine' );

test( 'engine returns IR for many exports at once', ( t ) => {
	const ir = engine( `
		/**
 		 * First declaration example.
 		 */
		export const firstDeclaration = function() {
			// do nothing
		}

		/**
		 * Second declaration example.
		 */
		export function secondDeclaration(){
			// do nothing
		}

		/**
		 * Default declaration example.
		 */
		export default function() {
			// do nothing
		}
` );
	t.deepEqual(
		ir,
		[
			{ description: 'First declaration example.', tags: [], name: 'firstDeclaration' },
			{ description: 'Second declaration example.', tags: [], name: 'secondDeclaration' },
			{ description: 'Default declaration example.', tags: [], name: 'default export' },
		]
	);
	t.end();
} );

test( 'engine returns IR for named export (function)', ( t ) => {
	const ir = engine( `
		/**
 		 * My declaration example.
 		 */
		export function myDeclaration() {
			// do nothing
		}
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for named export (variable)', ( t ) => {
	const ir = engine( `
		/**
 		 * My declaration example.
 		 */
		export const myDeclaration = function() {
			// do nothing
		}
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for named export (single identifier)', ( t ) => {
	const ir = engine( `
	const myDeclaration = function() {
		// do nothing
	}
	
	/**
	 * My declaration example.
	 */
	export { myDeclaration };
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for named export (single identifier) using JSDoc from declaration', ( t ) => {
	const ir = engine( `
		/**
 		 * My declaration example.
 		 */
		const myDeclaration = function() {
			// do nothing
		}

		export { myDeclaration };
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for named export (multiple identifiers) using JSDoc from declaration', ( t ) => {
	const ir = engine( `
		/**
 		 * First declaration example.
 		 */
		const firstDeclaration = function() {
			// do nothing
		}

		/**
 		 * Second declaration example.
 		 */
		const secondDeclaration = function() {
			// do nothing
		}

		export { firstDeclaration, secondDeclaration };
` );
	t.deepEqual(
		ir,
		[
			{ description: 'First declaration example.', tags: [], name: 'firstDeclaration' },
			{ description: 'Second declaration example.', tags: [], name: 'secondDeclaration' },
		]
	);
	t.end();
} );

test( 'engine returns IR for named export (single identifier) using JSDoc from dependency', ( t ) => {
	const getDependency = () => `/**
 		 * My declaration example.
 		 */
		export const myDeclaration = function() {
			// do nothing
		}
	`;
	const ir = engine(
		`export { myDeclaration } from './my-dependency';`,
		getDependency
	);
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for default export (named function)', ( t ) => {
	const ir = engine( `
		/**
 		 * My declaration example.
 		 */
		export default function myDeclaration() {
			// do nothing
		}
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for default export (anonymous function)', ( t ) => {
	const ir = engine( `
		/**
 		 * My declaration example.
 		 */
		export default function() {
			// do nothing
		}
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'default export' } ]
	);
	t.end();
} );

test( 'engine returns IR for default export (identifier)', ( t ) => {
	const ir = engine( `
		function myDeclaration() {
			// do nothing
		}

		/**
 		 * My declaration example.
 		 */
		export default myDeclaration;
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for default export (identifier) using JSDoc from function', ( t ) => {
	const ir = engine( `
		/**
		 * My declaration example.
		 */
		function myDeclaration() {
			// do nothing
		}

		export default myDeclaration;
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for default export (identifier) using JSDoc from variable', ( t ) => {
	const ir = engine( `
		/**
		 * My declaration example.
		 */
		const myDeclaration = function() {
			// do nothing
		}

		export default myDeclaration;
` );
	t.deepEqual(
		ir,
		[ { description: 'My declaration example.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for undocumented export', ( t ) => {
	const ir = engine( `
		const myDeclaration = function() {
			// do nothing
		}

		export default myDeclaration;
` );
	t.deepEqual(
		ir,
		[ { description: 'Undocumented declaration.', tags: [], name: 'myDeclaration' } ]
	);
	t.end();
} );

test( 'engine returns IR for undefined code', ( t ) => {
	const ir = engine( undefined );
	t.deepEqual( ir, [ ] );
	t.end();
} );
