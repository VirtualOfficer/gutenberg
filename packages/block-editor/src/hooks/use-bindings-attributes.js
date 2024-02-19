/**
 * WordPress dependencies
 */
import { getBlockType } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { select } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../store';
import { unlock } from '../../../editor/src/lock-unlock';

/** @typedef {import('@wordpress/compose').WPHigherOrderComponent} WPHigherOrderComponent */
/** @typedef {import('@wordpress/blocks').WPBlockSettings} WPBlockSettings */

/**
 * Given a binding of block attributes, returns a higher order component that
 * overrides its `attributes` and `setAttributes` props to sync any changes needed.
 *
 * @return {WPHigherOrderComponent} Higher-order component.
 */

const BLOCK_BINDINGS_ALLOWED_BLOCKS = {
	'core/paragraph': [ 'content' ],
	'core/heading': [ 'content' ],
	'core/image': [ 'url', 'title', 'alt' ],
	'core/button': [ 'url', 'text', 'linkTarget' ],
};

/**
 * Based on the given block name,
 * check if it is possible to bind the block.
 *
 * @param {string} blockName - The block name.
 * @return {boolean} Whether it is possible to bind the block attribute.
 */
export function isItPossibleToBindBlock( blockName ) {
	return blockName in BLOCK_BINDINGS_ALLOWED_BLOCKS;
}

/**
 * Based on the given block name and attribute name,
 * check if it is possible to bind the block.
 *
 * @param {string} blockName     - The block name.
 * @param {string} attributeName - The attribute name.
 * @return {boolean} Whether it is possible to bind the block attribute.
 */
export function hasPossibleBlockBinding( blockName, attributeName ) {
	return (
		isItPossibleToBindBlock( blockName ) &&
		BLOCK_BINDINGS_ALLOWED_BLOCKS[ blockName ].includes( attributeName )
	);
}

/**
 * This component is responsible detecting and
 * propagating data changes between block attribute and
 * the block-binding source property.
 *
 * The app creates an instance of this component for each
 * pair of block-attribute/source-property.
 *
 * @param {Object}   props            - The component props.
 * @param {string}   props.attrName   - The attribute name.
 * @param {any}      props.attrValue  - The attribute value.
 * @param {Function} props.useSource  - The custom hook to use the source.
 * @param {Object}   props.blockProps - The block props with bound attribute.
 * @param {Object}   props.args       - The arguments to pass to the source.
 * @return {null}                       This is a data-handling component. Render nothing.
 */
const BlockBindingConnector = ( {
	args,
	attrName,
	attrValue,
	blockProps,
	useSource,
} ) => {
	const { placeholder, value: propValue } = useSource( blockProps, args );

	const blockName = blockProps.name;

	const setAttributes = blockProps.setAttributes;

	const updateBoundAttibute = useCallback(
		( newAttrValue ) => {
			setAttributes( {
				[ attrName ]: newAttrValue,
			} );
		},
		[ attrName, setAttributes ]
	);

	useEffect( () => {
		if ( typeof propValue !== 'undefined' ) {
			updateBoundAttibute( propValue );

			/*
			 * If the attribute is `src` or `href`,
			 * a placeholder can't be used because it is not a valid url.
			 * Adding this workaround until
			 * attributes and metadata fields types are improved and include `url`.
			 */
		} else if ( placeholder ) {
			const htmlAttribute =
				getBlockType( blockName ).attributes[ attrName ].attribute;

			if ( htmlAttribute === 'src' || htmlAttribute === 'href' ) {
				updateBoundAttibute( null );
				return;
			}

			updateBoundAttibute( placeholder );
		}
	}, [
		updateBoundAttibute,
		propValue,
		attrValue,
		placeholder,
		blockName,
		attrName,
	] );

	return null;
};

function BlockBindingBridge( { bindings, props } ) {
	if ( ! bindings ) {
		return null;
	}

	const { name } = props;
	const BindingConnectorInstances = [];

	Object.entries( bindings ).forEach( ( [ attrName, settings ], i ) => {
		// Check if the block attribute can be bound.
		if ( ! hasPossibleBlockBinding( name, attrName ) ) {
			return;
		}

		const { getBlockBindingsSource } = unlock( select( blockEditorStore ) );
		const source = getBlockBindingsSource( settings.source );
		if ( ! source ) {
			return;
		}

		if ( source ) {
			const { useSource } = source;
			const attrValue = settings.value;

			BindingConnectorInstances.push(
				<BlockBindingConnector
					key={ `${ settings.source }-${ name }-${ attrName }-${ i }` }
					attrName={ attrName }
					attrValue={ attrValue }
					useSource={ useSource }
					blockProps={ props }
					args={ settings.args }
				/>
			);
		}
	} );

	return BindingConnectorInstances;
}

const withBlockBindingSupport = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const { attributes } = props;

		// Bail early if the block doesn't have bindings.
		const bindings = attributes?.metadata?.bindings;
		if ( ! bindings ) {
			return null;
		}

		return (
			<>
				<BlockBindingBridge bindings={ bindings } props={ props } />
				<BlockEdit { ...props } />
			</>
		);
	},
	'withBlockBindingSupport'
);

/**
 * Filters a registered block's settings to enhance a block's `edit` component
 * to upgrade bound attributes.
 *
 * @param {WPBlockSettings} settings - Registered block settings.
 * @param {string}          name     - Block name.
 * @return {WPBlockSettings} Filtered block settings.
 */
function shimAttributeSource( settings, name ) {
	if ( ! isItPossibleToBindBlock( name ) ) {
		return settings;
	}

	return {
		...settings,
		edit: withBlockBindingSupport( settings.edit ),
	};
}

addFilter(
	'blocks.registerBlockType',
	'core/editor/custom-sources-backwards-compatibility/shim-attribute-source',
	shimAttributeSource
);
