/**
 * External dependencies
 */
import {
	FlatList,
	View,
	Text,
	TouchableHighlight,
	Dimensions,
} from 'react-native';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import {
	withInstanceId,
	compose,
	withPreferredColorScheme,
} from '@wordpress/compose';
import { BottomSheet, Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import styles from './style.scss';

const MIN_COL_NUM = 3;

export class InserterMenu extends Component {
	constructor() {
		super( ...arguments );

		this.onClose = this.onClose.bind( this );
		this.onLayout = this.onLayout.bind( this );
		this.state = {
			numberOfColumns: MIN_COL_NUM,
		};

		Dimensions.addEventListener( 'change', this.onLayout );
	}

	componentDidMount() {
		this.props.showInsertionPoint();
	}

	componentWillUnmount() {
		this.props.hideInsertionPoint();
	}

	calculateMinItemWidth( bottomSheetWidth ) {
		return ( bottomSheetWidth - 64 ) / MIN_COL_NUM;
	}

	calculateItemWidth() {
		const {
			paddingLeft: itemPaddingLeft,
			paddingRight: itemPaddingRight,
		} = styles.modalItem;
		const { width: itemWidth } = styles.modalIconWrapper;
		return itemWidth + itemPaddingLeft + itemPaddingRight;
	}

	calculateColumns() {
		const bottomSheetWidth = BottomSheet.getWidth();
		const {
			paddingLeft: containerPaddingLeft,
			paddingRight: containerPaddingRight,
		} = styles.content;
		const itemTotalWidth = this.calculateItemWidth();
		const containerTotalWidth =
			bottomSheetWidth - ( containerPaddingLeft + containerPaddingRight );
		const numofColumns = Math.floor( containerTotalWidth / itemTotalWidth );

		if ( numofColumns < MIN_COL_NUM ) {
			return {
				numOfColumns: MIN_COL_NUM,
				itemWidth: this.calculateMinItemWidth( bottomSheetWidth ),
			};
		}
		return {
			numOfColumns: numofColumns,
		};
	}

	onClose() {
		// if should replace but didn't insert any block
		// re-insert default block
		if ( this.props.shouldReplaceBlock ) {
			this.props.insertDefaultBlock();
		}
		this.props.onDismiss();
	}

	onLayout() {
		const calculateColumns = this.calculateColumns();
		const numberOfColumns = calculateColumns.numOfColumns;

		this.setState( { numberOfColumns } );
	}

	render() {
		const { getStylesFromColorScheme } = this.props;
		const bottomPadding = styles.contentBottomPadding;
		const modalIconWrapperStyle = getStylesFromColorScheme(
			styles.modalIconWrapper,
			styles.modalIconWrapperDark
		);
		const modalIconStyle = getStylesFromColorScheme(
			styles.modalIcon,
			styles.modalIconDark
		);
		const modalItemLabelStyle = getStylesFromColorScheme(
			styles.modalItemLabel,
			styles.modalItemLabelDark
		);

		const calculateColumns = this.calculateColumns();

		return (
			<BottomSheet
				isVisible={ true }
				onClose={ this.onClose }
				contentStyle={ [ styles.content, bottomPadding ] }
				hideHeader
			>
				<TouchableHighlight accessible={ false } >
					<FlatList
						onLayout={ this.onLayout }
						scrollEnabled={ false }
						key={ `InserterUI-${ this.state.numberOfColumns }` } //re-render when numberOfColumns changes
						keyboardShouldPersistTaps="always"
						numColumns={ this.state.numberOfColumns }
						data={ this.props.items }
						ItemSeparatorComponent={ () => (
							<View style={ styles.rowSeparator } />
						) }
						keyExtractor={ ( item ) => item.name }
						renderItem={ ( { item } ) => (
							<TouchableHighlight
								style={ styles.touchableArea }
								underlayColor="transparent"
								activeOpacity={ 0.5 }
								accessibilityLabel={ item.title }
								onPress={ () => this.props.onSelect( item ) }
							>
								<View style={ styles.modalItem }>
									<View
										style={ [
											modalIconWrapperStyle,
											calculateColumns.itemWidth && {
												width:
													calculateColumns.itemWidth,
											},
										] }
									>
										<View style={ modalIconStyle }>
											<Icon
												icon={ item.icon.src }
												fill={ modalIconStyle.fill }
												size={ modalIconStyle.width }
											/>
										</View>
									</View>
									<Text style={ modalItemLabelStyle }>
										{ item.title }
									</Text>
								</View>
							</TouchableHighlight>
						) }
					/>
				</TouchableHighlight>
			</BottomSheet>
		);
	}
}

export default compose(
	withSelect( ( select, { clientId, isAppender, rootClientId } ) => {
		const {
			getInserterItems,
			getBlockName,
			getBlockRootClientId,
			getBlockSelectionEnd,
			getSettings,
		} = select( 'core/block-editor' );
		const { getChildBlockNames } = select( 'core/blocks' );

		let destinationRootClientId = rootClientId;
		if ( ! destinationRootClientId && ! clientId && ! isAppender ) {
			const end = getBlockSelectionEnd();
			if ( end ) {
				destinationRootClientId =
					getBlockRootClientId( end ) || undefined;
			}
		}
		const destinationRootBlockName = getBlockName(
			destinationRootClientId
		);

		const {
			__experimentalShouldInsertAtTheTop: shouldInsertAtTheTop,
		} = getSettings();

		return {
			rootChildBlocks: getChildBlockNames( destinationRootBlockName ),
			items: getInserterItems( destinationRootClientId ),
			destinationRootClientId,
			shouldInsertAtTheTop,
		};
	} ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		const {
			showInsertionPoint,
			hideInsertionPoint,
			removeBlock,
			resetBlocks,
			clearSelectedBlock,
			insertBlock,
			insertDefaultBlock,
		} = dispatch( 'core/block-editor' );

		return {
			showInsertionPoint() {
				if ( ownProps.shouldReplaceBlock ) {
					const { getBlockOrder, getBlockCount } = select(
						'core/block-editor'
					);

					const count = getBlockCount();
					if ( count === 1 ) {
						// removing the last block is not possible with `removeBlock` action
						// it always inserts a default block if the last of the blocks have been removed
						clearSelectedBlock();
						resetBlocks( [] );
					} else {
						const blockToReplace = getBlockOrder(
							ownProps.destinationRootClientId
						)[ ownProps.insertionIndex ];

						removeBlock( blockToReplace, false );
					}
				}
				showInsertionPoint(
					ownProps.destinationRootClientId,
					ownProps.insertionIndex
				);
			},
			hideInsertionPoint,
			onSelect( item ) {
				const { name, initialAttributes } = item;

				const insertedBlock = createBlock( name, initialAttributes );

				insertBlock(
					insertedBlock,
					ownProps.insertionIndex,
					ownProps.destinationRootClientId
				);

				ownProps.onSelect();
			},
			insertDefaultBlock() {
				insertDefaultBlock(
					{},
					ownProps.destinationRootClientId,
					ownProps.insertionIndex
				);
			},
		};
	} ),
	withInstanceId,
	withPreferredColorScheme
)( InserterMenu );
