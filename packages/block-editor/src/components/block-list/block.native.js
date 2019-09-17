/**
 * External dependencies
 */
import {
	View,
	Text,
	TouchableWithoutFeedback,
	Animated,
} from 'react-native';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { getBlockType } from '@wordpress/blocks';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import styles from './block.scss';
import BlockEdit from '../block-edit';
import BlockInvalidWarning from './block-invalid-warning';
import BlockMobileToolbar from './block-mobile-toolbar';
import FloatingToolbar from './block-mobile-floating-toolbar';

const toolbarHeight = 44;

class BlockListBlock extends Component {
	constructor() {
		super( ...arguments );

		this.insertBlocksAfter = this.insertBlocksAfter.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.hideToolbar = this.hideToolbar.bind( this );
		this.fadeOutToolbar = this.fadeOutToolbar.bind( this );

		this.state = {
			isFullyBordered: false,
			showToolbar: true,
			fadeAnim: new Animated.Value( 1 ),
		};
	}

	componentDidUpdate() {
		if ( this.props.displayToolbar ) {
			this.hideToolbar();
		}
	}

	fadeOutToolbar() {
		this.setState( { fadeAnim: new Animated.Value( 1 ) },
			() => {
				Animated.timing(
					this.state.fadeAnim,
					{
						toValue: 0,
						duration: 200,
						useNativeDriver: true,
					}
				).start( () => {
					this.setState( { showToolbar: false } );
				} );
			} );
	}

	hideToolbar() {
		if ( this.hideTimeout ) {
			clearTimeout( this.hideTimeout );
		}
		this.hideTimeout = setTimeout( () => {
			if ( this.state.showToolbar ) {
				this.fadeOutToolbar();
			}
		}, 3000 );
	}

	onFocus() {
		if ( ! this.state.showToolbar ) {
			this.setState( { showToolbar: true } );
		}
		if ( ! this.props.isSelected ) {
			this.props.onSelect();
		}
	}

	insertBlocksAfter( blocks ) {
		this.props.onInsertBlocks( blocks, this.props.order + 1 );

		if ( blocks[ 0 ] ) {
			// focus on the first block inserted
			this.props.onSelect( blocks[ 0 ].clientId );
		}
	}

	getBlockForType() {
		return (
			<BlockEdit
				name={ this.props.name }
				isSelected={ this.props.isSelected }
				attributes={ this.props.attributes }
				setAttributes={ this.props.onChange }
				onFocus={ this.onFocus }
				onReplace={ this.props.onReplace }
				insertBlocksAfter={ this.insertBlocksAfter }
				mergeBlocks={ this.props.mergeBlocks }
				onCaretVerticalPositionChange={ this.props.onCaretVerticalPositionChange }
				clientId={ this.props.clientId }
			/>
		);
	}

	renderBlockTitle() {
		return (
			<View style={ styles.blockTitle }>
				<Text>BlockType: { this.props.name }</Text>
			</View>
		);
	}

	getAccessibilityLabel() {
		const { attributes, name, order, title, getAccessibilityLabelExtra } = this.props;

		let blockName = '';

		if ( name === 'core/missing' ) { // is the block unrecognized?
			blockName = title;
		} else {
			blockName = sprintf(
				/* translators: accessibility text. %s: block name. */
				__( '%s Block' ),
				title, //already localized
			);
		}

		blockName += '. ' + sprintf( __( 'Row %d.' ), order + 1 );

		if ( getAccessibilityLabelExtra ) {
			const blockAccessibilityLabel = getAccessibilityLabelExtra( attributes );
			blockName += blockAccessibilityLabel ? ' ' + blockAccessibilityLabel : '';
		}

		return blockName;
	}

	render() {
		const {
			borderStyle,
			clientId,
			focusedBorderColor,
			icon,
			isSelected,
			isValid,
			showTitle,
			title,
			displayToolbar,
		} = this.props;

		const borderColor = isSelected ? focusedBorderColor : 'transparent';

		const accessibilityLabel = this.getAccessibilityLabel();

		const { fadeAnim } = this.state;

		return (
			<>
				{ this.state.showToolbar && displayToolbar && <Animated.View style={ { opacity: fadeAnim } }><FloatingToolbar /></Animated.View> }
				<TouchableWithoutFeedback
					onPress={ this.onFocus }
					accessible={ ! isSelected }
					accessibilityRole={ 'button' }
				>
					<View style={ [ styles.blockHolder, borderStyle, { borderColor, minHeight: toolbarHeight } ] }>
						{ showTitle && this.renderBlockTitle() }
						<View
							accessibilityLabel={ accessibilityLabel }
							style={ [ ! isSelected && styles.blockContainer, isSelected && styles.blockContainerFocused ] }
						>
							{ isValid && this.getBlockForType() }
							{ ! isValid &&
							<BlockInvalidWarning blockTitle={ title } icon={ icon } />
							}
						</View>
						{ isSelected && <BlockMobileToolbar clientId={ clientId } /> }
					</View>
				</TouchableWithoutFeedback>
			</>
		);
	}
}

export default compose( [
	withSelect( ( select, { clientId, rootClientId } ) => {
		const {
			getBlockIndex,
			getBlocks,
			isBlockSelected,
			__unstableGetBlockWithoutInnerBlocks,
			getBlockHierarchyRootClientId,
			getBlock,
		} = select( 'core/block-editor' );
		const order = getBlockIndex( clientId, rootClientId );
		const isSelected = isBlockSelected( clientId );
		const isFirstBlock = order === 0;
		const isLastBlock = order === getBlocks().length - 1;
		const block = __unstableGetBlockWithoutInnerBlocks( clientId );
		const { name, attributes, isValid } = block || {};
		const blockType = getBlockType( name || 'core/missing' );
		const title = blockType.title;
		const icon = blockType.icon;
		const getAccessibilityLabelExtra = blockType.__experimentalGetAccessibilityLabel;

		const rootBlockId = getBlockHierarchyRootClientId( clientId );
		const rootBlock = getBlock( rootBlockId );
		const hasRootInnerBlocks = rootBlock.innerBlocks.length !== 0;

		const displayToolbar = isSelected && hasRootInnerBlocks;

		return {
			icon,
			name: name || 'core/missing',
			order,
			title,
			attributes,
			blockType,
			isFirstBlock,
			isLastBlock,
			isSelected,
			isValid,
			getAccessibilityLabelExtra,
			displayToolbar,
		};
	} ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		const {
			insertBlocks,
			mergeBlocks,
			replaceBlocks,
			selectBlock,
			updateBlockAttributes,
		} = dispatch( 'core/block-editor' );

		return {
			mergeBlocks( forward ) {
				const { clientId } = ownProps;
				const {
					getPreviousBlockClientId,
					getNextBlockClientId,
				} = select( 'core/block-editor' );

				if ( forward ) {
					const nextBlockClientId = getNextBlockClientId( clientId );
					if ( nextBlockClientId ) {
						mergeBlocks( clientId, nextBlockClientId );
					}
				} else {
					const previousBlockClientId = getPreviousBlockClientId( clientId );
					if ( previousBlockClientId ) {
						mergeBlocks( previousBlockClientId, clientId );
					}
				}
			},
			onInsertBlocks( blocks, index ) {
				insertBlocks( blocks, index, ownProps.rootClientId );
			},
			onSelect( clientId = ownProps.clientId, initialPosition ) {
				selectBlock( clientId, initialPosition );
			},
			onChange: ( attributes ) => {
				updateBlockAttributes( ownProps.clientId, attributes );
			},
			onReplace( blocks, indexToSelect ) {
				replaceBlocks( [ ownProps.clientId ], blocks, indexToSelect );
			},
		};
	} ),
] )( BlockListBlock );
