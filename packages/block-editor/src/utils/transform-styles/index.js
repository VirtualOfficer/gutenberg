/**
 * External dependencies
 */
import postcss, { CssSyntaxError } from 'postcss';
import prefixSelector from 'postcss-prefix-selector';
import rebaseUrl from 'postcss-urlrebase';

const cacheByWrapperSelector = new Map();

function transformStyle(
	{ css, ignoredSelectors = [], baseURL },
	wrapperSelector = ''
) {
	// When there is no wrapper selector or base URL, there is no need
	// to transform the CSS. This is most cases because in the default
	// iframed editor, no wrapping is needed, and not many styles
	// provide a base URL.
	if ( ! wrapperSelector && ! baseURL ) {
		return css;
	}
	try {
		const posted = postcss(
			[
				wrapperSelector &&
					prefixSelector( {
						prefix: wrapperSelector,
						exclude: [ ...ignoredSelectors, wrapperSelector ],
						transform( prefix, selector, prefixedSelector ) {
							// `html`, `body` and `:root` need some special handling since they
							// generally cannot be prefixed with a classname and produce a valid
							// selector.
							if ( selector.includes( 'body' ) ) {
								return selector
									.replace( /:root :where\(body\)/g, prefix )
									.replace( /:where\(body\)/g, prefix )
									.replace( 'body', prefix );
							}
							if ( selector.startsWith( ':root' ) ) {
								return selector.replace( ':root', prefix );
							}
							if ( selector.startsWith( 'html' ) ) {
								return selector.replace( 'html', prefix );
							}
							// Avoid prefixing an already prefixed selector.
							if ( selector.startsWith( prefix ) ) {
								return prefixedSelector.replace(
									`${ prefix } ${ prefix }`,
									prefix
								);
							}
							return prefixedSelector;
						},
					} ),
				baseURL && rebaseUrl( { rootUrl: baseURL } ),
			].filter( Boolean )
		).process( css, {} ).css; // use sync PostCSS API
		return posted;
	} catch ( error ) {
		if ( error instanceof CssSyntaxError ) {
			// eslint-disable-next-line no-console
			console.warn(
				'wp.blockEditor.transformStyles Failed to transform CSS.',
				error.message + '\n' + error.showSourceCode( false )
			);
		} else {
			// eslint-disable-next-line no-console
			console.warn(
				'wp.blockEditor.transformStyles Failed to transform CSS.',
				error
			);
		}

		return null;
	}
}

/**
 * Applies a series of CSS rule transforms to wrap selectors inside a given class and/or rewrite URLs depending on the parameters passed.
 *
 * @typedef {Object} EditorStyle
 * @property {string}        css              the CSS block(s), as a single string.
 * @property {?string}       baseURL          the base URL to be used as the reference when rewritting urls.
 * @property {?string[]}     ignoredSelectors the selectors not to wrap.
 *
 * @param    {EditorStyle[]} styles           CSS rules.
 * @param    {string}        wrapperSelector  Wrapper selector.
 * @return {Array} converted rules.
 */
const transformStyles = ( styles, wrapperSelector = '' ) => {
	let cache = cacheByWrapperSelector.get( wrapperSelector );
	if ( ! cache ) {
		cache = new WeakMap();
		cacheByWrapperSelector.set( wrapperSelector, cache );
	}
	return styles.map( ( style ) => {
		let css = cache.get( style );
		if ( ! css ) {
			css = transformStyle( style, wrapperSelector );
			cache.set( style, css );
		}
		return css;
	} );
};

export default transformStyles;
