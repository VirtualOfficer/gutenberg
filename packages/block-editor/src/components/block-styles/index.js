/**
 * External dependencies
 */
import { find, noop } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';
import TokenList from '@wordpress/token-list';
import { Icon } from '@wordpress/components';
import { check } from '@wordpress/icons';

import { ENTER, SPACE } from '@wordpress/keycodes';
import { _x } from '@wordpress/i18n';
import {
	getBlockType,
	cloneBlock,
	getBlockFromExample,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import BlockPreview from '../block-preview';

/**
 * Returns the active styles from the given className.
 *
 * @param {Array} styles      Block style variations.
 * @param {string} className  Class name
 *
 * @return {Array} The active styles.
 */
export function getActiveStyles( styles, className ) {
	const activeStyles = [];

	for ( const style of new TokenList( className ).values() ) {
		if ( style.indexOf( 'is-style-' ) === -1 ) {
			continue;
		}

		const potentialStyleName = style.substring( 9 );
		const activeStyle = find( styles, { name: potentialStyleName } );
		if ( activeStyle ) {
			activeStyles.push( activeStyle );
		}
	}

	if ( activeStyles.length ) {
		return activeStyles;
	}

	const defaultStyle = find( styles, 'isDefault' );

	if ( defaultStyle ) {
		return [ defaultStyle ];
	}

	return [];
}

/**
 * Removes the style from the block's className.
 *
 * @param {string}  className   Class name.
 * @param {Object} style        The style to remove.
 *
 * @return {string} The updated className.
 */
export function removeStyle( className, style ) {
	const list = new TokenList( className );

	list.remove( 'is-style-' + style.name );

	return list.value;
}

/**
 * Adds the style to the block's className.
 *
 * @param {string}  className   Class name.
 * @param {Object} style        The style to add.
 *
 * @return {string} The updated className.
 */
export function addStyle( className, style ) {
	const list = new TokenList( className );

	list.add( 'is-style-' + style.name );

	return list.value;
}

function BlockStyles( {
	styles,
	className,
	onChangeClassName,
	type,
	block,
	onSwitch = noop,
	onHoverClassName = noop,
} ) {
	if ( ! styles || styles.length === 0 ) {
		return null;
	}

	if ( ! type.styles && ! find( styles, 'isDefault' ) ) {
		styles = [
			{
				name: 'default',
				label: _x( 'Default', 'block style' ),
				isDefault: true,
			},
			...styles,
		];
	}

	const activeStyles = getActiveStyles( styles, className );

	function updateClassName( style ) {
		const action = activeStyles.includes( style ) ? removeStyle : addStyle;
		const updatedClassName = action( className, style );

		onChangeClassName( updatedClassName );
		onHoverClassName( null );
		onSwitch();
	}

	return (
		<div className="block-editor-block-styles">
			{ styles.map( ( style ) => {
				const styleClassName = 'is-style-' + style.name;
				return (
					<div
						key={ style.name }
						className={ classnames(
							'block-editor-block-styles__item',
							{
								'is-active': activeStyles.includes( style ),
							}
						) }
						onClick={ () => updateClassName( style ) }
						onKeyDown={ ( event ) => {
							if (
								ENTER === event.keyCode ||
								SPACE === event.keyCode
							) {
								event.preventDefault();
								updateClassName( style );
							}
						} }
						onMouseEnter={ () =>
							onHoverClassName( styleClassName )
						}
						onMouseLeave={ () => onHoverClassName( null ) }
						role="button"
						tabIndex="0"
						aria-label={ style.label || style.name }
					>
						<div className="block-editor-block-styles__item-preview">
							<BlockPreview
								viewportWidth={ 500 }
								blocks={
									type.example
										? getBlockFromExample( block.name, {
												attributes: {
													...type.example.attributes,
													className: styleClassName,
												},
												innerBlocks:
													type.example.innerBlocks,
										  } )
										: cloneBlock( block, {
												className: styleClassName,
										  } )
								}
							/>
							{ activeStyles.includes( style ) ? (
								<Icon icon={ check } />
							) : null }
						</div>
						<div className="block-editor-block-styles__item-label">
							{ style.label || style.name }
						</div>
					</div>
				);
			} ) }
		</div>
	);
}

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const { getBlock } = select( 'core/block-editor' );
		const { getBlockStyles } = select( 'core/blocks' );
		const block = getBlock( clientId );
		const blockType = getBlockType( block.name );

		return {
			block,
			className: block.attributes.className || '',
			styles: getBlockStyles( block.name ),
			type: blockType,
		};
	} ),
	withDispatch( ( dispatch, { clientId } ) => {
		return {
			onChangeClassName( newClassName ) {
				dispatch( 'core/block-editor' ).updateBlockAttributes(
					clientId,
					{
						className: newClassName,
					}
				);
			},
		};
	} ),
] )( BlockStyles );
