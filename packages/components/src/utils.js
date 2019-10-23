/**
 * Utility Functions
 */

/**
 * renderAsRenderProps is used to wrap a component and convert
 * the passed property "as" either a string or component, to the
 * rendered tag if a string, or component.
 *
 * See VisuallyHidden hidden for example.
 *
 * @param {string|Component} as what tag/component to render
 * @return {Component} rendered component
 */
function renderAsRenderProps( { as: T = 'div', ...props } ) {
	if ( typeof props.children === 'function' ) {
		return props.children( props );
	}
	return <T { ...props } />;
}

export { renderAsRenderProps };
