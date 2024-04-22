/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../store';
import { useStyleOverride } from './utils';
import { useLayout } from '../components/block-list/layout';
import { GridVisualizer, GridItemResizer } from '../components/grid-visualizer';

function useBlockPropsChildLayoutStyles( { style } ) {
	const shouldRenderChildLayoutStyles = useSelect( ( select ) => {
		return ! select( blockEditorStore ).getSettings().disableLayoutStyles;
	} );
	const layout = style?.layout ?? {};
	const {
		selfStretch,
		selfAlign,
		flexSize,
		columnStart,
		rowStart,
		columnSpan,
		rowSpan,
		height,
		width,
	} = layout;
	const parentLayout = useLayout() || {};
	const {
		columnCount,
		minimumColumnWidth,
		orientation,
		type: parentType,
		default: { type: defaultParentType = 'default' } = {},
	} = parentLayout;
	const parentLayoutType = parentType || defaultParentType;
	const id = useInstanceId( useBlockPropsChildLayoutStyles );
	const selector = `.wp-container-content-${ id }`;

	const isVerticalLayout =
		parentLayoutType === 'constrained' ||
		parentLayoutType === 'default' ||
		parentLayoutType === undefined ||
		orientation === 'vertical';

	let css = '';
	if ( shouldRenderChildLayoutStyles ) {
		// Flex size should still be output for back compat.
		if ( selfStretch === 'fixed' && flexSize ) {
			css = `${ selector } {
				flex-basis: ${ flexSize };
				box-sizing: border-box;
			}`;
			// Grid type styles.
		} else if ( columnStart && columnSpan ) {
			css = `${ selector } {
				grid-column: ${ columnStart } / span ${ columnSpan };
			}`;
		} else if ( columnStart ) {
			css = `${ selector } {
				grid-column: ${ columnStart };
			}`;
		} else if ( columnSpan ) {
			css = `${ selector } {
				grid-column: span ${ columnSpan };
			}`;
		}
		// All vertical layout types have the same styles.
		if ( isVerticalLayout ) {
			if ( selfAlign === 'fixed' && width ) {
				/**
				 * Once layout rule specificity is lowered,
				 * the !important can be removed.
				 */
				css += `${ selector } {
					max-width: ${ width } !important;
				}`;
			} else if ( selfAlign === 'fixedNoShrink' && width ) {
				css += `${ selector } {
					width: ${ width };
				}`;
				/**
				 * A max-width reset is needed to override constrained
				 * layout styles.
				 */
				if ( parentLayoutType === 'constrained' ) {
					css += `${ selector } {
						max-width: none !important;
					}`;
				}
			} else if ( selfAlign === 'fill' ) {
				/**
				 * This style is only needed for flex layouts because
				 * constrained children have alignment set and flow
				 * children are 100% width by default.
				 */
				css += `${ selector } {
					align-self: stretch;
				}`;
			} else if ( selfAlign === 'fit' ) {
				css += `${ selector } {
					width: fit-content;
				}`;
			}

			if ( selfStretch === 'fixed' && height ) {
				// Max-height is needed for flow and constrained children.
				css += `${ selector } {
					max-height: ${ height };
					flex-basis: ${ height };
				}`;
			} else if ( selfStretch === 'fixedNoShrink' && height ) {
				// Height is needed for flow and constrained children.
				css += `${ selector } {
					height: ${ height };
					flex-shrink: 0;
					flex-basis: ${ height };
				}`;
			} else if ( selfStretch === 'fill' ) {
				css += `${ selector } {
					flex-grow: 1;
				}`;
			}
			// Everything else that isn't a grid is a horizontal layout.
		} else if ( parentLayoutType !== 'grid' ) {
			if ( selfStretch === 'fixed' && width ) {
				css += `${ selector } {
					flex-basis: ${ width };
					
				}`;
			} else if ( selfStretch === 'fixedNoShrink' && width ) {
				css += `${ selector } {
					flex-shrink: 0;
					flex-basis: ${ width };
				}`;
			} else if ( selfStretch === 'fill' ) {
				css += `${ selector } {
					flex-grow: 1;
				}`;
			}

			if ( selfAlign === 'fill' ) {
				css += `${ selector } {
					align-self: stretch;
				}`;
			} else if ( selfAlign === 'fixedNoShrink' && height ) {
				css += `${ selector } {
						height: ${ height };
					}`;
			} else if ( selfAlign === 'fixed' && height ) {
				css += `${ selector } {
						max-height: ${ height };
					}`;
			}
		}
		/**
		 * If minimumColumnWidth is set on the parent, or if no
		 * columnCount is set, the grid is responsive so a
		 * container query is needed for the span to resize.
		 */
		if (
			( columnSpan || columnStart ) &&
			( minimumColumnWidth || ! columnCount )
		) {
			// Check if columnSpan and columnStart are numbers so Math.max doesn't break.
			const columnSpanNumber = columnSpan ? parseInt( columnSpan ) : null;
			const columnStartNumber = columnStart
				? parseInt( columnStart )
				: null;
			const highestNumber = Math.max(
				columnSpanNumber,
				columnStartNumber
			);

			let parentColumnValue = parseFloat( minimumColumnWidth );
			/**
			 * 12rem is the default minimumColumnWidth value.
			 * If parentColumnValue is not a number, default to 12.
			 */
			if ( isNaN( parentColumnValue ) ) {
				parentColumnValue = 12;
			}

			let parentColumnUnit = minimumColumnWidth?.replace(
				parentColumnValue,
				''
			);
			/**
			 * Check that parent column unit is either 'px', 'rem' or 'em'.
			 * If not, default to 'rem'.
			 */
			if ( ! [ 'px', 'rem', 'em' ].includes( parentColumnUnit ) ) {
				parentColumnUnit = 'rem';
			}

			const defaultGapValue = parentColumnUnit === 'px' ? 24 : 1.5;
			const containerQueryValue =
				highestNumber * parentColumnValue +
				( highestNumber - 1 ) * defaultGapValue;
			// If a span is set we want to preserve it as long as possible, otherwise we just reset the value.
			const gridColumnValue = columnSpan ? '1/-1' : 'auto';

			css += `@container (max-width: ${ containerQueryValue }${ parentColumnUnit }) {
				${ selector } {
					grid-column: ${ gridColumnValue };
				}
			}`;
		}
		if ( rowStart && rowSpan ) {
			css += `${ selector } {
				grid-row: ${ rowStart } / span ${ rowSpan };
			}`;
		} else if ( rowStart ) {
			css += `${ selector } {
				grid-row: ${ rowStart };
			}`;
		} else if ( rowSpan ) {
			css += `${ selector } {
				grid-row: span ${ rowSpan };
			}`;
		}
	}

	useStyleOverride( { css } );

	// Only attach a container class if there is generated CSS to be attached.
	if ( ! css ) {
		return;
	}

	// Attach a `wp-container-content` id-based classname.
	return { className: `wp-container-content-${ id }` };
}

function ChildLayoutControlsPure( { clientId, style, setAttributes } ) {
	const parentLayout = useLayout() || {};
	const rootClientId = useSelect(
		( select ) => {
			return select( blockEditorStore ).getBlockRootClientId( clientId );
		},
		[ clientId ]
	);
	if ( parentLayout.type !== 'grid' ) {
		return null;
	}
	if ( ! window.__experimentalEnableGridInteractivity ) {
		return null;
	}
	return (
		<>
			<GridVisualizer clientId={ rootClientId } />
			<GridItemResizer
				clientId={ clientId }
				onChange={ ( { columnSpan, rowSpan } ) => {
					setAttributes( {
						style: {
							...style,
							layout: {
								...style?.layout,
								columnSpan,
								rowSpan,
							},
						},
					} );
				} }
			/>
		</>
	);
}

export default {
	useBlockProps: useBlockPropsChildLayoutStyles,
	edit: ChildLayoutControlsPure,
	attributeKeys: [ 'style' ],
	hasSupport() {
		return true;
	},
};
