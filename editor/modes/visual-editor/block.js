/**
 * External dependencies
 */
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Slot } from 'react-slot-fill';
import { partial } from 'lodash';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import tinymce from 'tinymce';

/**
 * WordPress dependencies
 */
import { Children, Component } from '@wordpress/element';
import { IconButton, Toolbar } from '@wordpress/components';
import { keycodes } from '@wordpress/utils';
import { getBlockType, getBlockDefaultClassname, createBlock } from '@wordpress/blocks';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import InvalidBlockWarning from './invalid-block-warning';
import BlockCrashWarning from './block-crash-warning';
import BlockCrashBoundary from './block-crash-boundary';
import BlockMover from '../../block-mover';
import BlockRightMenu from '../../block-settings-menu';
import BlockSwitcher from '../../block-switcher';
import {
	updateBlockAttributes,
	focusBlock,
	mergeBlocks,
	insertBlocks,
	removeBlocks,
	clearSelectedBlock,
	startTyping,
	stopTyping,
	replaceBlocks,
	selectBlock,
} from '../../actions';
import {
	getPreviousBlock,
	getNextBlock,
	getBlock,
	getBlockFocus,
	getBlockIndex,
	isBlockHovered,
	isBlockSelected,
	isBlockMultiSelected,
	isFirstMultiSelectedBlock,
	isTyping,
	getMultiSelectedBlockUids,
} from '../../selectors';

const { BACKSPACE, ESCAPE, DELETE, UP, DOWN, LEFT, RIGHT, ENTER } = keycodes;

function FirstChild( { children } ) {
	const childrenArray = Children.toArray( children );
	return childrenArray[ 0 ] || null;
}

function isVerticalEdge( { editor, reverse } ) {
	const rangeRect = editor.selection.getBoundingClientRect();
	const buffer = rangeRect.height / 2;
	const editableRect = editor.getBody().getBoundingClientRect();

	isVerticalEdge.firstRect = isVerticalEdge.firstRect || rangeRect;

	// Too low.
	if ( reverse && rangeRect.top - buffer > editableRect.top ) {
		return false;
	}

	// Too high.
	if ( ! reverse && rangeRect.bottom + buffer < editableRect.bottom ) {
		return false;
	}

	return true;
}

function isHorizontalEdge( { editor, reverse } ) {
	const position = reverse ? 'start' : 'end';
	const order = reverse ? 'first' : 'last';
	const range = editor.selection.getRng();
	const offset = range[ `${ position }Offset` ];
	const rootNode = editor.getBody();
	let node = range.startContainer;

	if ( ! range.collapsed ) {
		return false;
	}

	if ( reverse && offset !== 0 ) {
		return false;
	}

	if ( ! reverse && offset !== node.data.length ) {
		return false;
	}

	while ( node !== rootNode ) {
		const parentNode = node.parentNode;

		if ( parentNode[ `${ order }Child` ] !== node ) {
			return false;
		}

		node = parentNode;
	}

	return true;
}

function getNextEditor( { node, target, reverse } ) {
	const selector = '.editor-visual-editor [contenteditable="true"]';
	const editableNodes = Array.from( document.querySelectorAll( selector ) );

	if ( reverse ) {
		editableNodes.reverse();
	}

	const index = editableNodes.indexOf( target );
	const nextEditableNode = editableNodes[ index + 1 ];
	const direction = reverse ? 'previous' : 'next';
	const nextBlockNode = node[ `${ direction }Sibling` ];

	if ( ! nextBlockNode || ! nextEditableNode ) {
		return;
	}

	const editor = tinymce.get( nextEditableNode.id );

	if ( ! editor ) {
		return;
	}

	if ( ! node.contains( nextEditableNode ) && ! nextBlockNode.contains( nextEditableNode ) ) {
		return;
	}

	return editor;
}

class VisualEditorBlock extends Component {
	constructor() {
		super( ...arguments );

		this.bindBlockNode = this.bindBlockNode.bind( this );
		this.setAttributes = this.setAttributes.bind( this );
		this.maybeHover = this.maybeHover.bind( this );
		this.maybeStartTyping = this.maybeStartTyping.bind( this );
		this.stopTypingOnMouseMove = this.stopTypingOnMouseMove.bind( this );
		this.removeOrDeselect = this.removeOrDeselect.bind( this );
		this.mergeBlocks = this.mergeBlocks.bind( this );
		this.onFocus = this.onFocus.bind( this );
		this.onPointerDown = this.onPointerDown.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onKeyUp = this.onKeyUp.bind( this );
		this.toggleMobileControls = this.toggleMobileControls.bind( this );
		this.onBlockError = this.onBlockError.bind( this );

		this.previousOffset = null;

		this.state = {
			showMobileControls: false,
			error: null,
		};
	}

	componentDidMount() {
		if ( this.props.focus ) {
			this.node.focus();
		}

		if ( this.props.isTyping ) {
			document.addEventListener( 'mousemove', this.stopTypingOnMouseMove );
		}
	}

	componentWillReceiveProps( newProps ) {
		if (
			this.props.order !== newProps.order &&
			( ( this.props.isSelected && newProps.isSelected ) ||
			( this.props.isFirstMultiSelected && newProps.isFirstMultiSelected ) )
		) {
			this.previousOffset = this.node.getBoundingClientRect().top;
		}
	}

	componentDidUpdate( prevProps ) {
		// Preserve scroll prosition when block rearranged
		if ( this.previousOffset ) {
			window.scrollTo(
				window.scrollX,
				window.scrollY + this.node.getBoundingClientRect().top - this.previousOffset
			);
			this.previousOffset = null;
		}

		// Focus node when focus state is programmatically transferred.
		if ( this.props.focus && ! prevProps.focus ) {
			this.node.focus();
		}

		// Bind or unbind mousemove from page when user starts or stops typing
		if ( this.props.isTyping !== prevProps.isTyping ) {
			if ( this.props.isTyping ) {
				document.addEventListener( 'mousemove', this.stopTypingOnMouseMove );
			} else {
				this.removeStopTypingListener();
			}
		}
	}

	componentWillUnmount() {
		this.removeStopTypingListener();
	}

	removeStopTypingListener() {
		document.removeEventListener( 'mousemove', this.stopTypingOnMouseMove );
	}

	bindBlockNode( node ) {
		this.node = node;
		this.props.blockRef( node );
	}

	setAttributes( attributes ) {
		const { block, onChange } = this.props;
		onChange( block.uid, attributes );
	}

	maybeHover() {
		const { isHovered, isSelected, isMultiSelected, onHover } = this.props;

		if ( isHovered || isSelected || isMultiSelected ) {
			return;
		}

		onHover();
	}

	maybeStartTyping() {
		// We do not want to dispatch start typing if...
		//  - State value already reflects that we're typing (dispatch noise)
		//  - The current block is not selected (e.g. after a split occurs,
		//    we'll still receive the keyDown event, but the focus has since
		//    shifted to the newly created block)
		if ( ! this.props.isTyping && this.props.isSelected ) {
			this.props.onStartTyping();
		}
	}

	stopTypingOnMouseMove( { clientX, clientY } ) {
		const { lastClientX, lastClientY } = this;

		// We need to check that the mouse really moved
		// Because Safari trigger mousemove event when we press shift, ctrl...
		if (
			lastClientX &&
			lastClientY &&
			( lastClientX !== clientX || lastClientY !== clientY )
		) {
			this.props.onStopTyping();
		}

		this.lastClientX = clientX;
		this.lastClientY = clientY;
	}

	removeOrDeselect( event ) {
		const { keyCode, target } = event;
		const {
			uid,
			previousBlock,
			onRemove,
			onFocus,
			onDeselect,
		} = this.props;

		// Remove block on backspace.
		if (
			target === this.node &&
			( BACKSPACE === keyCode || DELETE === keyCode )
		) {
			event.preventDefault();
			onRemove( [ uid ] );

			if ( previousBlock ) {
				onFocus( previousBlock.uid, { offset: -1 } );
			}
		}

		// Deselect on escape.
		if ( ESCAPE === keyCode ) {
			onDeselect();
		}
	}

	mergeBlocks( forward = false ) {
		const { block, previousBlock, nextBlock, onMerge } = this.props;

		// Do nothing when it's the first block.
		if (
			( ! forward && ! previousBlock ) ||
			( forward && ! nextBlock )
		) {
			return;
		}

		if ( forward ) {
			onMerge( block, nextBlock );
		} else {
			onMerge( previousBlock, block );
		}
	}

	onFocus( event ) {
		if ( event.target === this.node ) {
			this.props.onSelect();
		}
	}

	onPointerDown( event ) {
		// Discard the arrow key position.
		delete isVerticalEdge.firstRect;

		// Not the main button (usually the left button on pointer device).
		if ( event.buttons !== 1 ) {
			return;
		}

		this.props.onSelectionStart();
		this.props.onSelect();
	}

	onKeyDown( event ) {
		const { keyCode, target } = event;
		const { previousBlock, nextBlock, onFocus } = this.props;
		const up = keyCode === UP;
		const down = keyCode === DOWN;
		const left = keyCode === LEFT;
		const right = keyCode === RIGHT;

		if ( up || down || left || right ) {
			const editor = target.id && tinymce.get( target.id );

			if ( target === this.node ) {
				const reverse = up || left;
				const followingBlock = reverse ? previousBlock : nextBlock;

				if ( followingBlock ) {
					event.preventDefault();
					onFocus( followingBlock.uid, { offset: reverse ? -1 : 0 } );
				}
			}

			if ( editor ) {
				const reverse = up || left;
				const horizontal = left || right;
				const followingBlock = reverse ? previousBlock : nextBlock;
				const isEdge = horizontal ? isHorizontalEdge : isVerticalEdge;

				if ( ! isEdge( { editor, reverse } ) ) {
					return;
				}

				event.preventDefault();

				const followingEditor = getNextEditor( { node: this.node, target, reverse } );

				if ( ! followingEditor ) {
					if ( followingBlock ) {
						onFocus( followingBlock.uid, { offset: reverse ? -1 : 0 } );
					}

					return;
				}

				followingEditor.focus();

				if ( horizontal ) {
					if ( reverse ) {
						followingEditor.selection.select( followingEditor.getBody(), true );
						followingEditor.selection.collapse( false );
					}
				} else {
					const rect = isVerticalEdge.firstRect;

					window.setTimeout( () => {
						const buffer = rect.height / 2;
						const editorRect = followingEditor.getBody().getBoundingClientRect();
						const y = reverse ? editorRect.bottom - buffer : editorRect.top + buffer;

						followingEditor.selection.placeCaretAt( rect.left, y );
					} );
				}
			}
		}

		if ( ! up && ! down ) {
			// Discard the arrow key position if any other key is pressed.
			delete isVerticalEdge.firstRect;
		}

		if ( ENTER === keyCode && target === this.node ) {
			event.preventDefault();

			this.props.onInsertBlocksAfter( [
				createBlock( 'core/paragraph' ),
			] );
		}
	}

	onKeyUp( event ) {
		this.removeOrDeselect( event );
	}

	toggleMobileControls() {
		this.setState( {
			showMobileControls: ! this.state.showMobileControls,
		} );
	}

	onBlockError( error ) {
		this.setState( { error } );
	}

	render() {
		const { block, multiSelectedBlockUids } = this.props;
		const { name: blockName, isValid } = block;
		const blockType = getBlockType( blockName );
		// translators: %s: Type of block (i.e. Text, Image etc)
		const blockLabel = sprintf( __( 'Block: %s' ), blockType.title );
		// The block as rendered in the editor is composed of general block UI
		// (mover, toolbar, wrapper) and the display of the block content, which
		// is referred to as <BlockEdit />.
		let BlockEdit;
		// `edit` and `save` are functions or components describing the markup
		// with which a block is displayed. If `blockType` is valid, assign
		// them preferencially as the render value for the block.
		if ( blockType ) {
			BlockEdit = blockType.edit || blockType.save;
		}

		// Should `BlockEdit` return as null, we have nothing to display for the block.
		if ( ! BlockEdit ) {
			return null;
		}

		// Generate the wrapper class names handling the different states of the block.
		const { isHovered, isSelected, isMultiSelected, isFirstMultiSelected, focus } = this.props;
		const showUI = isSelected && ( ! this.props.isTyping || focus.collapsed === false );
		const { error, showMobileControls } = this.state;
		const wrapperClassname = classnames( 'editor-visual-editor__block', {
			'has-warning': ! isValid || !! error,
			'is-selected': showUI,
			'is-multi-selected': isMultiSelected,
			'is-hovered': isHovered,
			'is-showing-mobile-controls': showMobileControls,
		} );

		const { onMouseLeave, onFocus, onInsertBlocksAfter, onReplace } = this.props;

		// Determine whether the block has props to apply to the wrapper.
		let wrapperProps;
		if ( blockType.getEditWrapperProps ) {
			wrapperProps = blockType.getEditWrapperProps( block.attributes );
		}

		// Generate a class name for the block's editable form
		let { className = getBlockDefaultClassname( block.name ) } = blockType;
		className = classnames( className, block.attributes.className );

		// Disable reason: Each block can be selected by clicking on it
		/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		return (
			<div
				ref={ this.bindBlockNode }
				onKeyDown={ this.onKeyDown }
				onKeyUp={ this.onKeyUp }
				onFocus={ this.onFocus }
				onMouseMove={ this.maybeHover }
				onMouseEnter={ this.maybeHover }
				onMouseLeave={ onMouseLeave }
				className={ wrapperClassname }
				data-type={ block.name }
				tabIndex="0"
				aria-label={ blockLabel }
				{ ...wrapperProps }
			>
				{ ( showUI || isHovered ) && <BlockMover uids={ [ block.uid ] } /> }
				{ ( showUI || isHovered ) && <BlockRightMenu uid={ block.uid } /> }
				{ showUI && isValid &&
					<CSSTransitionGroup
						transitionName={ { appear: 'is-appearing', appearActive: 'is-appearing-active' } }
						transitionAppear={ true }
						transitionAppearTimeout={ 100 }
						transitionEnter={ false }
						transitionLeave={ false }
						component={ FirstChild }
					>
						<div className="editor-visual-editor__block-controls">
							<div className="editor-visual-editor__group">
								<BlockSwitcher uid={ block.uid } />
								<Slot name="Formatting.Toolbar" />
								<Toolbar className="editor-visual-editor__mobile-tools">
									{ ( showUI || isHovered ) && <BlockMover uids={ [ block.uid ] } /> }
									{ ( showUI || isHovered ) && <BlockRightMenu uid={ block.uid } /> }
									<IconButton
										className="editor-visual-editor__mobile-toggle"
										onClick={ this.toggleMobileControls }
										aria-expanded={ showMobileControls }
										label={ __( 'Toggle extra controls' ) }
										icon="ellipsis"
									/>
								</Toolbar>
							</div>
						</div>
					</CSSTransitionGroup>
				}
				{ isFirstMultiSelected && (
					<BlockMover uids={ multiSelectedBlockUids } />
				) }
				<div
					onKeyPress={ this.maybeStartTyping }
					onDragStart={ ( event ) => event.preventDefault() }
					onMouseDown={ this.onPointerDown }
					onTouchStart={ this.onPointerDown }
					className="editor-visual-editor__block-edit"
				>
					{ isValid && ! error && (
						<BlockCrashBoundary onError={ this.onBlockError }>
							<BlockEdit
								focus={ focus }
								attributes={ block.attributes }
								setAttributes={ this.setAttributes }
								insertBlocksAfter={ onInsertBlocksAfter }
								onReplace={ onReplace }
								setFocus={ partial( onFocus, block.uid ) }
								mergeBlocks={ this.mergeBlocks }
								className={ className }
								id={ block.uid }
							/>
						</BlockCrashBoundary>
					) }
					{ ! isValid && (
						blockType.save( {
							attributes: block.attributes,
							className,
						} )
					) }
				</div>
				{ !! error && <BlockCrashWarning /> }
				{ ! isValid && <InvalidBlockWarning block={ block } /> }
			</div>
		);
		/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	}
}

export default connect(
	( state, ownProps ) => {
		return {
			previousBlock: getPreviousBlock( state, ownProps.uid ),
			nextBlock: getNextBlock( state, ownProps.uid ),
			block: getBlock( state, ownProps.uid ),
			isSelected: isBlockSelected( state, ownProps.uid ),
			isMultiSelected: isBlockMultiSelected( state, ownProps.uid ),
			isFirstMultiSelected: isFirstMultiSelectedBlock( state, ownProps.uid ),
			isHovered: isBlockHovered( state, ownProps.uid ),
			focus: getBlockFocus( state, ownProps.uid ),
			isTyping: isTyping( state ),
			order: getBlockIndex( state, ownProps.uid ),
			multiSelectedBlockUids: getMultiSelectedBlockUids( state ),
		};
	},
	( dispatch, ownProps ) => ( {
		onChange( uid, attributes ) {
			dispatch( updateBlockAttributes( uid, attributes ) );
		},

		onSelect() {
			dispatch( selectBlock( ownProps.uid ) );
		},
		onDeselect() {
			dispatch( clearSelectedBlock() );
		},

		onStartTyping() {
			dispatch( startTyping() );
		},

		onStopTyping() {
			dispatch( stopTyping() );
		},

		onHover() {
			dispatch( {
				type: 'TOGGLE_BLOCK_HOVERED',
				hovered: true,
				uid: ownProps.uid,
			} );
		},
		onMouseLeave() {
			dispatch( {
				type: 'TOGGLE_BLOCK_HOVERED',
				hovered: false,
				uid: ownProps.uid,
			} );
		},

		onInsertBlocksAfter( blocks ) {
			dispatch( insertBlocks( blocks, ownProps.uid ) );
		},

		onFocus( ...args ) {
			dispatch( focusBlock( ...args ) );
		},

		onRemove( uids ) {
			dispatch( removeBlocks( uids ) );
		},

		onMerge( ...args ) {
			dispatch( mergeBlocks( ...args ) );
		},

		onReplace( blocks ) {
			dispatch( replaceBlocks( [ ownProps.uid ], blocks ) );
		},
	} )
)( VisualEditorBlock );
