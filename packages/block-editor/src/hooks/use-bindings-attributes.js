/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useRegistry, useSelect } from '@wordpress/data';
import { useCallback, useMemo } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { unlock } from '../lock-unlock';

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
	'core/image': [ 'id', 'url', 'title', 'alt' ],
	'core/button': [ 'url', 'text', 'linkTarget', 'rel' ],
};

const DEFAULT_ATTRIBUTE = '__default';

/**
 * Returns the bindings with the `__default` binding for pattern overrides
 * replaced with the full-set of supported attributes. e.g.:
 *
 * bindings passed in: `{ __default: { source: 'core/pattern-overrides' } }`
 * bindings returned: `{ content: { source: 'core/pattern-overrides' } }`
 *
 * @param {string} blockName The block name (e.g. 'core/paragraph').
 * @param {Object} bindings  A block's bindings from the metadata attribute.
 *
 * @return {Object} The bindings with default replaced for pattern overrides.
 */
function replacePatternOverrideDefaultBindings( blockName, bindings ) {
	// The `__default` binding currently only works for pattern overrides.
	if (
		bindings?.[ DEFAULT_ATTRIBUTE ]?.source === 'core/pattern-overrides'
	) {
		const supportedAttributes = BLOCK_BINDINGS_ALLOWED_BLOCKS[ blockName ];
		const bindingsWithDefaults = {};
		for ( const attributeName of supportedAttributes ) {
			// If the block has mixed binding sources, retain any non pattern override bindings.
			const bindingSource = bindings[ attributeName ]
				? bindings[ attributeName ]
				: { source: 'core/pattern-overrides' };
			bindingsWithDefaults[ attributeName ] = bindingSource;
		}

		return bindingsWithDefaults;
	}

	return bindings;
}

/**
 * Based on the given block name,
 * check if it is possible to bind the block.
 *
 * @param {string} blockName - The block name.
 * @return {boolean} Whether it is possible to bind the block to sources.
 */
export function canBindBlock( blockName ) {
	return blockName in BLOCK_BINDINGS_ALLOWED_BLOCKS;
}

/**
 * Based on the given block name and attribute name,
 * check if it is possible to bind the block attribute.
 *
 * @param {string} blockName     - The block name.
 * @param {string} attributeName - The attribute name.
 * @return {boolean} Whether it is possible to bind the block attribute.
 */
export function canBindAttribute( blockName, attributeName ) {
	return (
		canBindBlock( blockName ) &&
		BLOCK_BINDINGS_ALLOWED_BLOCKS[ blockName ].includes( attributeName )
	);
}

export const withBlockBindingSupport = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const registry = useRegistry();
		const sources = useSelect( ( select ) =>
			unlock( select( blocksStore ) ).getAllBlockBindingsSources()
		);
		const { name, clientId, context } = props;
		const hasParentPattern = !! props.context[ 'pattern/overrides' ];
		const hasPatternOverridesDefaultBinding =
			props.attributes.metadata?.bindings?.[ DEFAULT_ATTRIBUTE ]
				?.source === 'core/pattern-overrides';
		const bindings = useMemo(
			() =>
				replacePatternOverrideDefaultBindings(
					name,
					props.attributes.metadata?.bindings
				),
			[ props.attributes.metadata?.bindings, name ]
		);

		// While this hook doesn't directly call any selectors, `useSelect` is
		// used purposely here to ensure `boundAttributes` is updated whenever
		// there are attribute updates.
		// `source.getValues` may also call a selector via `registry.select`.
		const boundAttributes = useSelect( () => {
			if ( ! bindings ) {
				return;
			}

			const attributes = {};

			const bindingsBySource = new Map();

			for ( const [ attributeName, binding ] of Object.entries(
				bindings
			) ) {
				const { source: sourceName, args: sourceArgs } = binding;
				const source = sources[ sourceName ];
				if (
					( ! source?.getValue && ! source?.getValuesInBatch ) ||
					! canBindAttribute( name, attributeName )
				) {
					continue;
				}

				bindingsBySource.set( source, {
					...bindingsBySource.get( source ),
					[ attributeName ]: {
						args: sourceArgs,
					},
				} );
			}

			if ( bindingsBySource.size ) {
				for ( const [ source, sourceBindings ] of bindingsBySource ) {
					// Get values in batch if the source supports it.
					if ( source.getValuesInBatch ) {
						const values = source.getValuesInBatch( {
							registry,
							context,
							clientId,
							sourceBindings,
						} );
						for ( const [ attributeName, value ] of Object.entries(
							values
						) ) {
							attributes[ attributeName ] = value;
						}
					} else {
						for ( const [
							attributeName,
							{ args },
						] of Object.entries( sourceBindings ) ) {
							attributes[ attributeName ] = source.getValue( {
								registry,
								context,
								clientId,
								attributeName,
								args,
							} );
						}
					}

					// Add placeholders when value is undefined.
					// TODO: Revisit this part.
					for ( const [ attributeName, { args } ] of Object.entries(
						sourceBindings
					) ) {
						if ( attributes[ attributeName ] === undefined ) {
							if ( attributeName === 'url' ) {
								attributes[ attributeName ] = null;
							} else {
								attributes[ attributeName ] =
									source.getPlaceholder?.( {
										registry,
										context,
										clientId,
										attributeName,
										args,
									} );
							}
						}
					}
				}
			}

			return attributes;
		}, [ bindings, name, clientId, context, registry, sources ] );

		const { setAttributes } = props;

		const _setAttributes = useCallback(
			( nextAttributes ) => {
				registry.batch( () => {
					if ( ! bindings ) {
						setAttributes( nextAttributes );
						return;
					}

					const keptAttributes = { ...nextAttributes };
					const bindingsBySource = new Map();

					// Loop only over the updated attributes to avoid modifying the bound ones that haven't changed.
					for ( const [ attributeName, newValue ] of Object.entries(
						keptAttributes
					) ) {
						if (
							! bindings[ attributeName ] ||
							! canBindAttribute( name, attributeName )
						) {
							continue;
						}

						const binding = bindings[ attributeName ];
						const source = sources[ binding?.source ];
						if (
							! source?.setValue &&
							! source?.setValuesInBatch
						) {
							continue;
						}
						bindingsBySource.set( source, {
							...bindingsBySource.get( source ),
							[ attributeName ]: {
								args: binding.args,
								newValue,
							},
						} );
						delete keptAttributes[ attributeName ];
					}

					if ( bindingsBySource.size ) {
						for ( const [
							source,
							sourceBindings,
						] of bindingsBySource ) {
							// Set values in batch if the source supports it.
							if ( source.setValuesInBatch ) {
								source.setValuesInBatch( {
									registry,
									context,
									clientId,
									sourceBindings,
								} );
							} else {
								for ( const [
									attributeName,
									{ args, newValue: value },
								] of Object.entries( sourceBindings ) ) {
									source.setValue( {
										registry,
										context,
										clientId,
										attributeName,
										args,
										value,
									} );
								}
							}
						}
					}

					if (
						// Don't update non-connected attributes if the block is using pattern overrides
						// and the editing is happening while overriding the pattern (not editing the original).
						! (
							hasPatternOverridesDefaultBinding &&
							hasParentPattern
						) &&
						Object.keys( keptAttributes ).length
					) {
						// Don't update caption and href until they are supported.
						if ( hasPatternOverridesDefaultBinding ) {
							delete keptAttributes?.caption;
							delete keptAttributes?.href;
						}
						setAttributes( keptAttributes );
					}
				} );
			},
			[
				registry,
				bindings,
				name,
				clientId,
				context,
				setAttributes,
				sources,
				hasPatternOverridesDefaultBinding,
				hasParentPattern,
			]
		);

		return (
			<>
				<BlockEdit
					{ ...props }
					attributes={ { ...props.attributes, ...boundAttributes } }
					setAttributes={ _setAttributes }
				/>
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
	if ( ! canBindBlock( name ) ) {
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
