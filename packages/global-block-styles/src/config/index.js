// Config - Variable System
/**
 * External dependencies
 */
import { set as baseSet } from 'lodash';

const STYLESHEET_ID_PREFIX = 'config';

function createStyleSheetIdFactory() {
	let index = 0;
	return () => `${ STYLESHEET_ID_PREFIX }-${ index++ }`;
}

const createStyleSheetId = createStyleSheetIdFactory();

const createStyleSheetNode = () => {
	const node = document.createElement( 'style' );
	node.setAttribute( 'id', createStyleSheetId() );
	node.setAttribute( 'type', 'text/css' );

	// Inject into the DOM
	const headNode = document.querySelector( 'head' );
	if ( headNode ) {
		headNode.appendChild( node );
	}

	return node;
};

function noop() {
	return undefined;
}

const createCssVarProp = ( {
	namespace = '',
	key = '',
	parentNamespace = '',
} ) => {
	const baseName = parentNamespace ? `${ parentNamespace }-${ key }` : key;
	if ( ! namespace ) {
		return `--${ baseName }`;
	}
	return `--${ namespace }-${ baseName }`;
};

const recursivelyApplyCssProps = ( {
	namespace = '',
	props = '',
	parentNamespace = '',
	setState = noop,
} ) => {
	const keys = Object.keys( props );

	keys.forEach( ( key ) => {
		const value = props[ key ];
		if ( typeof value === 'object' ) {
			const prevKey = parentNamespace ? `${ parentNamespace }-${ key }` : key;
			recursivelyApplyCssProps( {
				namespace,
				props: value,
				parentNamespace: prevKey,
				setState,
			} );
		} else {
			const cssVarProp = createCssVarProp( {
				namespace,
				key,
				parentNamespace,
			} );
			setState( {
				[ cssVarProp ]: value,
			} );
		}
	} );
};

// const themeVar = ( preferredVar, defaultVar, fallbackVar ) => {
// 	return `var(${ preferredVar }, var(${ defaultVar }, ${ fallbackVar }))`;
// };

function getStyleSheetFromStyleNode( styleNode ) {
	return [ ...document.styleSheets ].find(
		( styleSheet ) => styleSheet.ownerNode === styleNode
	);
}

function createStyleRule( selectorText, prop, value ) {
	return `${ selectorText } { ${ prop }: ${ value }; }`;
}

function insertRule( styleSheet, selectorText, prop, value ) {
	const styleRule = createStyleRule( selectorText, prop, value );
	const cssText = `${ prop }: ${ value };`;
	const existingRule = [ ...styleSheet.rules ].find( ( rule ) => {
		return rule.style[ 0 ] === prop;
	} );
	const ruleIndex = existingRule ?
		[ ...styleSheet.rules ].indexOf( existingRule ) :
		undefined;

	if ( typeof ruleIndex !== 'number' ) {
		// Insert
		styleSheet.insertRule( styleRule );
	} else {
		// Replace
		styleSheet.rules[ ruleIndex ].style.cssText = cssText;
	}
}

export const createConfig = ( options ) => {
	const { namespace = '', observables = [] } = options;
	const styleNode = createStyleSheetNode();
	const styleSheet = getStyleSheetFromStyleNode( styleNode );

	let state = {};

	const addCssVarToDocument = ( prop, value ) => {
		insertRule( styleSheet, ':root', prop, value );
	};

	const __updateState = () => {
		Object.keys( state ).forEach( ( key ) => {
			addCssVarToDocument( key, state[ key ] );
		} );
	};

	const setState = ( nextState ) => {
		state = { ...state, ...nextState };
		__updateState();
	};

	let observable;

	// const handleOnChange = () => {};

	if ( observables.length ) {
	}

	return {
		styleNode,
		styleSheet,
		observable,
		set: ( props, value ) => {
			if ( props === undefined || value === undefined ) {
				return;
			}
			const nextProps = baseSet( {}, props, value );
			recursivelyApplyCssProps( { namespace, props: nextProps, setState } );
		},
		apply: ( props ) => {
			recursivelyApplyCssProps( { namespace, props, setState } );
		},
		render: () => {
			__updateState();
		},
		destroy: () => {
			if ( observable ) {
				observable.disconnect();
			}
		},
		getState: () => state,
		onChange: () => {},
	};
};

export const config = createConfig( { namespace: 'gbs' } );
