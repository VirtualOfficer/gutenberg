/**
 * WordPress dependencies
 */
import {
	Button,
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, positionCenter, stretchWide } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import useSetting from '../components/use-setting';
import { appendSelectors } from './utils';

export default {
	name: 'default',
	label: __( 'Flow' ),
	inspectorControls: function DefaultLayoutInspectorControls( {
		layout,
		onChange,
	} ) {
		const { wideSize, contentSize } = layout;
		const units = useCustomUnits( {
			availableUnits: useSetting( 'spacing.units' ) || [
				'%',
				'px',
				'em',
				'rem',
				'vw',
			],
		} );

		return (
			<>
				<div className="block-editor-hooks__layout-controls">
					<div className="block-editor-hooks__layout-controls-unit">
						<UnitControl
							label={ __( 'Content' ) }
							labelPosition="top"
							__unstableInputWidth="80px"
							value={ contentSize || wideSize || '' }
							onChange={ ( nextWidth ) => {
								nextWidth =
									0 > parseFloat( nextWidth )
										? '0'
										: nextWidth;
								onChange( {
									...layout,
									contentSize: nextWidth,
								} );
							} }
							units={ units }
						/>
						<Icon icon={ positionCenter } />
					</div>
					<div className="block-editor-hooks__layout-controls-unit">
						<UnitControl
							label={ __( 'Wide' ) }
							labelPosition="top"
							__unstableInputWidth="80px"
							value={ wideSize || contentSize || '' }
							onChange={ ( nextWidth ) => {
								nextWidth =
									0 > parseFloat( nextWidth )
										? '0'
										: nextWidth;
								onChange( {
									...layout,
									wideSize: nextWidth,
								} );
							} }
							units={ units }
						/>
						<Icon icon={ stretchWide } />
					</div>
				</div>
				<div className="block-editor-hooks__layout-controls-reset">
					<Button
						variant="secondary"
						isSmall
						disabled={ ! contentSize && ! wideSize }
						onClick={ () =>
							onChange( {
								contentSize: undefined,
								wideSize: undefined,
								inherit: false,
							} )
						}
					>
						{ __( 'Reset' ) }
					</Button>
				</div>

				<p className="block-editor-hooks__layout-controls-helptext">
					{ __(
						'Customize the width for all elements that are assigned to the center or wide columns.'
					) }
				</p>
			</>
		);
	},
	toolBarControls: function DefaultLayoutToolbarControls() {
		return null;
	},
	save: function DefaultLayoutStyle( { selector, layout = {} } ) {
		const { contentSize, wideSize } = layout;
		const blockGapSupport = useSetting( 'spacing.blockGap' );
		const hasBlockGapStylesSupport = blockGapSupport !== null;

		let style =
			!! contentSize || !! wideSize
				? `
					${ appendSelectors( selector, '> *' ) } {
						max-width: ${ contentSize ?? wideSize };
						margin-left: auto !important;
						margin-right: auto !important;
					}

					${ appendSelectors( selector, '> [data-align="wide"]' ) }  {
						max-width: ${ wideSize ?? contentSize };
					}

					${ appendSelectors( selector, '> [data-align="full"]' ) } {
						max-width: none;
					}
				`
				: '';

		style += `
			${ appendSelectors( selector, '> [data-align="left"]' ) } {
				float: left;
				margin-right: 2em;
			}

			${ appendSelectors( selector, '> [data-align="right"]' ) } {
				float: right;
				margin-left: 2em;
			}

		`;

		if ( hasBlockGapStylesSupport ) {
			style += `
				${ appendSelectors( selector, '> * + *' ) } {
					margin-top: var( --wp--style--block-gap );
					margin-bottom: 0;
				}
			`;
		}

		return <style>{ style }</style>;
	},
	getOrientation() {
		return 'vertical';
	},
	getAlignments( layout ) {
		if ( layout.alignments !== undefined ) {
			return layout.alignments.map( ( alignment ) => ( {
				name: alignment,
			} ) );
		}
		const { contentSize, wideSize } = layout;

		const alignments = [
			{ name: 'left' },
			{ name: 'center' },
			{ name: 'right' },
		];

		if ( contentSize ) {
			alignments.unshift( { name: 'full' } );
		}

		/**
		 * Besides checking if `contentSize` and `wideSize` have a
		 * value, we now show this information only if their values
		 * are not a `css var`. This needs to change when parsing
		 * css variables land.
		 *
		 * @see https://github.com/WordPress/gutenberg/pull/34710#issuecomment-918000752
		 */
		if ( wideSize ) {
			const wideAlignment = { name: 'wide' };
			if ( ! wideSize?.startsWith( 'var' ) ) {
				// translators: %s: container size (i.e. 600px etc)
				wideAlignment.info = sprintf( __( 'Max %s wide' ), wideSize );
			}
			alignments.unshift( wideAlignment );
		}

		// Add `none` alignment with info text.
		if ( contentSize && ! contentSize?.startsWith( 'var' ) ) {
			alignments.unshift( {
				name: 'none',
				// translators: %s: container size (i.e. 600px etc)
				info: sprintf( __( 'Max %s wide' ), contentSize ),
			} );
		}

		return alignments;
	},
};
