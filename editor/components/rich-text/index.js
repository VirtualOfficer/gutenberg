/**
 * External dependencies
 */
import classnames from 'classnames';
import {
	last,
	isEqual,
	forEach,
	merge,
	identity,
	find,
	defer,
	noop,
	reject,
} from 'lodash';
import 'element-closest';

/**
 * WordPress dependencies
 */
import { Component, Fragment, compose, RawHTML, Children, createRef } from '@wordpress/element';
import {
	keycodes,
	createBlobURL,
	isHorizontalEdge,
	getRectangleFromRange,
	getScrollContainer,
	deprecated,
} from '@wordpress/utils';
import { withInstanceId, withSafeTimeout, Slot } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { rawHandler } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import './style.scss';
import Autocomplete from '../autocomplete';
import BlockFormatControls from '../block-format-controls';
import FormatToolbar from './format-toolbar';
import TinyMCE from './tinymce';
import { pickAriaProps } from './aria';
import patterns from './patterns';
import { EVENTS } from './constants';
import { withBlockEditContext } from '../block-edit/context';
import {
	domToFormat,
	valueToString,
	tinyMCENodeToElement,
} from './format';

/**
 * Browser dependencies
 */

const { getSelection, Node } = window;

/**
 * Module constants
 */

const { LEFT, RIGHT, BACKSPACE, DELETE, ENTER, rawShortcut } = keycodes;

/**
 * Zero-width space character used by TinyMCE as a caret landing point for
 * inline boundary nodes.
 *
 * @see tinymce/src/core/main/ts/text/Zwsp.ts
 *
 * @type {string}
 */
const TINYMCE_ZWSP = '\uFEFF';

/**
 * Returns true if the node is the inline node boundary. This is used in node
 * filtering prevent the inline boundary from being included in the split which
 * occurs while within but at the end of an inline node, since TinyMCE includes
 * a placeholder caret character at the end.
 *
 * @see https://github.com/tinymce/tinymce/blob/master/src/plugins/link/main/ts/core/Utils.ts
 *
 * @param {Node} node Node to test.
 *
 * @return {boolean} Whether node is inline boundary.
 */
export function isEmptyInlineBoundary( node ) {
	const text = node.nodeName === 'A' ? node.innerText : node.textContent;
	return text === TINYMCE_ZWSP;
}

/**
 * Returns true if the node is empty, meaning it contains only the placeholder
 * caret character or is an empty text node.
 *
 * @param {Node} node Node to test.
 *
 * @return {boolean} Whether node is empty.
 */
export function isEmptyNode( node ) {
	return (
		'' === node.nodeValue ||
		isEmptyInlineBoundary( node )
	);
}

/**
 * Given a set of Nodes, filters to set to exclude any empty nodes: those with
 * either empty text nodes or only including the inline boundary caret.
 *
 * @param {Node[]} childNodes Nodes to filter.
 *
 * @return {Node[]} Non-empty nodes.
 */
export function filterEmptyNodes( childNodes ) {
	return reject( childNodes, isEmptyNode );
}

export function getFormatProperties( formatName, parents ) {
	switch ( formatName ) {
		case 'link' : {
			const anchor = find( parents, ( node ) => node.nodeName.toLowerCase() === 'a' );
			return !! anchor ? { value: anchor.getAttribute( 'href' ) || '', target: anchor.getAttribute( 'target' ) || '', node: anchor } : {};
		}
		default:
			return {};
	}
}

const DEFAULT_FORMATS = [ 'bold', 'italic', 'strikethrough', 'link', 'code' ];

export class RichText extends Component {
	constructor() {
		super( ...arguments );

		this.onInit = this.onInit.bind( this );
		this.getSettings = this.getSettings.bind( this );
		this.onSetup = this.onSetup.bind( this );
		this.onChange = this.onChange.bind( this );
		this.onNewBlock = this.onNewBlock.bind( this );
		this.onNodeChange = this.onNodeChange.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onKeyUp = this.onKeyUp.bind( this );
		this.changeFormats = this.changeFormats.bind( this );
		this.onPropagateUndo = this.onPropagateUndo.bind( this );
		this.onPastePreProcess = this.onPastePreProcess.bind( this );
		this.onPaste = this.onPaste.bind( this );
		this.onCreateUndoLevel = this.onCreateUndoLevel.bind( this );
		this.setFocusedElement = this.setFocusedElement.bind( this );
		this.removeZwsp = this.removeZwsp.bind( this );

		this.state = {
			formats: {},
			selectedNodeId: 0,
		};

		this.containerRef = createRef();
	}

	/**
	 * Retrieves the settings for this block.
	 *
	 * Allows passing in settings which will be overwritten.
	 *
	 * @param {Object} settings The settings to overwrite.
	 * @return {Object} The settings for this block.
	 */
	getSettings( settings ) {
		return ( this.props.getSettings || identity )( {
			...settings,
			forced_root_block: this.props.multiline || false,
			// Allow TinyMCE to keep one undo level for comparing changes.
			// Prevent it otherwise from accumulating any history.
			custom_undo_redo_levels: 1,
		} );
	}

	/**
	 * Handles the onSetup event for the tinyMCE component.
	 *
	 * Will setup event handlers for the tinyMCE instance.
	 * An `onSetup` function in the props will be called if it is present.
	 *
	 * @param {tinymce} editor The editor instance as passed by tinyMCE.
	 */
	onSetup( editor ) {
		this.editor = editor;

		EVENTS.forEach( ( name ) => {
			if ( ! this.props.hasOwnProperty( 'on' + name ) ) {
				return;
			}

			deprecated( 'Raw TinyMCE event handlers for RichText', {
				version: '3.0',
				alternative: (
					'Documented props, ancestor event handler, or onSetup ' +
					'access to the internal editor instance event hub'
				),
				plugin: 'gutenberg',
			} );

			editor.on( name, this.proxyPropHandler( name ) );
		} );

		editor.on( 'init', this.onInit );
		editor.on( 'NewBlock', this.onNewBlock );
		editor.on( 'nodechange', this.onNodeChange );
		editor.on( 'keydown', this.onKeyDown );
		editor.on( 'keyup', this.onKeyUp );
		editor.on( 'BeforeExecCommand', this.onPropagateUndo );
		editor.on( 'PastePreProcess', this.onPastePreProcess, true /* Add before core handlers */ );
		editor.on( 'paste', this.onPaste, true /* Add before core handlers */ );
		editor.on( 'input', this.onChange );
		editor.on( 'focusout', this.removeZwsp );
		// The change event in TinyMCE fires every time an undo level is added.
		editor.on( 'change', this.onCreateUndoLevel );

		patterns.apply( this, [ editor ] );

		if ( this.props.onSetup ) {
			this.props.onSetup( editor );
		}
	}

	setFocusedElement() {
		if ( this.props.setFocusedElement ) {
			this.props.setFocusedElement( this.props.instanceId );
		}
	}

	/**
	 * Cleans up after TinyMCE when leaving the field, removing lingering zero-
	 * width space characters. Without removal, future horizontal navigation
	 * into the field would land on the zero-width space, where it's preferred
	 * to consistently land within an inline boundary where the zero-width
	 * space had existed to delineate.
	 */
	removeZwsp() {
		const rootNode = this.editor.getBody();

		const stack = [ ...rootNode.childNodes ];
		while ( stack.length ) {
			const node = stack.pop();
			if ( node.nodeType === Node.TEXT_NODE && node.nodeValue === TINYMCE_ZWSP ) {
				node.parentNode.removeChild( node );
			}

			stack.push( ...node.childNodes );
		}
	}

	/**
	 * Allows prop event handlers to handle an event.
	 *
	 * Allow props an opportunity to handle the event, before default RichText
	 * behavior takes effect. Should the event be handled by a prop, it should
	 * `stopImmediatePropagation` on the event to stop continued event handling.
	 *
	 * @param {string} name The name of the event.
	 *
	 * @return {void} Void.
	*/
	proxyPropHandler( name ) {
		return ( event ) => {
			// Allow props an opportunity to handle the event, before default
			// RichText behavior takes effect. Should the event be handled by a
			// prop, it should `stopImmediatePropagation` on the event to stop
			// continued event handling.
			if ( 'function' === typeof this.props[ 'on' + name ] ) {
				this.props[ 'on' + name ]( event );
			}
		};
	}

	onInit() {
		this.registerCustomFormatters();

		this.editor.shortcuts.add( rawShortcut.primary( 'k' ), '', () => this.changeFormats( { link: { isAdding: true } } ) );
		this.editor.shortcuts.add( rawShortcut.access( 'a' ), '', () => this.changeFormats( { link: { isAdding: true } } ) );
		this.editor.shortcuts.add( rawShortcut.access( 's' ), '', () => this.changeFormats( { link: undefined } ) );
		this.editor.shortcuts.add( rawShortcut.access( 'd' ), '', () => this.changeFormats( { strikethrough: ! this.state.formats.strikethrough } ) );
		this.editor.shortcuts.add( rawShortcut.access( 'x' ), '', () => this.changeFormats( { code: ! this.state.formats.code } ) );
		this.editor.shortcuts.add( rawShortcut.primary( 'z' ), '', 'Undo' );
		this.editor.shortcuts.add( rawShortcut.primaryShift( 'z' ), '', 'Redo' );

		// Remove TinyMCE Core shortcut for consistency with global editor
		// shortcuts. Also clashes with Mac browsers.
		this.editor.shortcuts.remove( 'meta+y', '', 'Redo' );
	}

	adaptFormatter( options ) {
		switch ( options.type ) {
			case 'inline-style': {
				return {
					inline: 'span',
					styles: { ...options.style },
				};
			}
		}
	}

	registerCustomFormatters() {
		forEach( this.props.formatters, ( formatter ) => {
			this.editor.formatter.register( formatter.format, this.adaptFormatter( formatter ) );
		} );
	}

	/**
	 * Handles an undo event from tinyMCE.
	 *
	 * @param {UndoEvent} event The undo event as triggered by TinyMCE.
	 */
	onPropagateUndo( event ) {
		const { onUndo, onRedo } = this.context;
		const { command } = event;

		if ( command === 'Undo' && onUndo ) {
			defer( onUndo );
			event.preventDefault();
		}

		if ( command === 'Redo' && onRedo ) {
			defer( onRedo );
			event.preventDefault();
		}
	}

	/**
	 * Handles a paste event from tinyMCE.
	 *
	 * Saves the pasted data as plain text in `pastedPlainText`.
	 *
	 * @param {PasteEvent} event The paste event as triggered by tinyMCE.
	 */
	onPaste( event ) {
		const dataTransfer =
			event.clipboardData ||
			event.dataTransfer ||
			this.editor.getDoc().dataTransfer ||
			// Removes the need for further `dataTransfer` checks.
			{ getData: () => '' };

		const { items = [], files = [], types = [] } = dataTransfer;
		const item = find( [ ...items, ...files ], ( { type } ) => /^image\/(?:jpe?g|png|gif)$/.test( type ) );
		const plainText = dataTransfer.getData( 'text/plain' );
		const HTML = dataTransfer.getData( 'text/html' );

		// Only process file if no HTML is present.
		// Note: a pasted file may have the URL as plain text.
		if ( item && ! HTML ) {
			const blob = item.getAsFile ? item.getAsFile() : item;
			const isEmptyEditor = this.isEmpty();
			const content = rawHandler( {
				HTML: `<img src="${ createBlobURL( blob ) }">`,
				mode: 'BLOCKS',
				tagName: this.props.tagName,
			} );

			// Allows us to ask for this information when we get a report.
			window.console.log( 'Received item:\n\n', blob );

			if ( isEmptyEditor && this.props.onReplace ) {
				// Necessary to allow the paste bin to be removed without errors.
				this.props.setTimeout( () => this.props.onReplace( content ) );
			} else if ( this.props.onSplit ) {
				// Necessary to get the right range.
				// Also done in the TinyMCE paste plugin.
				this.props.setTimeout( () => this.splitContent( content ) );
			}

			event.preventDefault();
		}

		this.pastedPlainText = plainText;
		this.isPlainTextPaste = types.length === 1 && types[ 0 ] === 'text/plain';
	}

	/**
	 * Handles a PrePasteProcess event from tinyMCE.
	 *
	 * Will call the paste handler with the pasted data. If it is a string tries
	 * to put it in the containing tinyMCE editor. Otherwise call the `onSplit`
	 * handler.
	 *
	 * @param {PrePasteProcessEvent} event The PrePasteProcess event as triggered
	 *                                     by tinyMCE.
	 */
	onPastePreProcess( event ) {
		const HTML = this.isPlainTextPaste ? '' : event.content;
		// Allows us to ask for this information when we get a report.
		window.console.log( 'Received HTML:\n\n', HTML );
		window.console.log( 'Received plain text:\n\n', this.pastedPlainText );

		// There is a selection, check if a link is pasted.
		if ( ! this.editor.selection.isCollapsed() ) {
			const linkRegExp = /^(?:https?:)?\/\/\S+$/i;
			const pastedText = event.content.replace( /<[^>]+>/g, '' ).trim();
			const selectedText = this.editor.selection.getContent().replace( /<[^>]+>/g, '' ).trim();

			// The pasted text is a link, and the selected text is not.
			if ( linkRegExp.test( pastedText ) && ! linkRegExp.test( selectedText ) ) {
				this.editor.execCommand( 'mceInsertLink', false, {
					href: this.editor.dom.decode( pastedText ),
				} );

				// Allows us to ask for this information when we get a report.
				window.console.log( 'Created link:\n\n', pastedText );

				event.preventDefault();

				return;
			}
		}

		const isEmptyEditor = this.isEmpty();

		let mode = 'INLINE';

		if ( isEmptyEditor && this.props.onReplace ) {
			mode = 'BLOCKS';
		} else if ( this.props.onSplit ) {
			mode = 'AUTO';
		}

		const content = rawHandler( {
			HTML,
			plainText: this.pastedPlainText,
			mode,
			tagName: this.props.tagName,
			canUserUseUnfilteredHTML: this.context.canUserUseUnfilteredHTML,
		} );

		if ( typeof content === 'string' ) {
			// Let MCE process further with the given content.
			event.content = content;
		} else if ( this.props.onSplit ) {
			// Abort pasting to split the content
			event.preventDefault();

			if ( ! content.length ) {
				return;
			}

			if ( isEmptyEditor && this.props.onReplace ) {
				this.props.onReplace( content );
			} else {
				this.splitContent( content );
			}
		}
	}

	/**
	 * Handles any case where the content of the tinyMCE instance has changed.
	 */

	onChange() {
		this.savedContent = this.getContent();
		this.props.onChange( this.savedContent );
	}

	onCreateUndoLevel( event ) {
		// TinyMCE fires a `change` event when the first letter in an instance
		// is typed. This should not create a history record in Gutenberg.
		// https://github.com/tinymce/tinymce/blob/4.7.11/src/core/main/ts/api/UndoManager.ts#L116-L125
		// In other cases TinyMCE won't fire a `change` with at least a previous
		// record present, so this is a reliable check.
		// https://github.com/tinymce/tinymce/blob/4.7.11/src/core/main/ts/api/UndoManager.ts#L272-L275
		if ( event && event.lastLevel === null ) {
			return;
		}

		// Always ensure the content is up-to-date. This is needed because e.g.
		// making something bold will trigger a TinyMCE change event but no
		// input event. Avoid dispatching an action if the original event is
		// blur because the content will already be up-to-date.
		if ( ! event || ! event.originalEvent || event.originalEvent.type !== 'blur' ) {
			this.onChange();
		}

		this.context.onCreateUndoLevel();
	}

	/**
	 * Calculates the relative position where the link toolbar should be.
	 *
	 * Based on the selection of the text inside this element a position is
	 * calculated where the toolbar should be. This can be used downstream to
	 * absolutely position the toolbar.
	 *
	 * @param {DOMRect} position Caret range rectangle.
	 *
	 * @return {{top: number, left: number}} The desired position of the toolbar.
	 */
	getFocusPosition( position ) {
		// The container is relatively positioned.
		const containerPosition = this.containerRef.current.getBoundingClientRect();
		const toolbarOffset = { top: 10, left: 0 };

		return {
			top: position.top - containerPosition.top + ( position.height ) + toolbarOffset.top,
			left: position.left - containerPosition.left + ( position.width / 2 ) + toolbarOffset.left,
		};
	}

	/**
	 * Handles a Backspace or Delete keydown event to delegate merge or remove
	 * if key event occurs while at the extent edge of the field. Prevents
	 * default browser behavior if delegated to prop callback handler.
	 *
	 * @param {KeyboardEvent} event Keydown event.
	 */
	onDeleteKeyDown( event ) {
		const { onMerge, onRemove } = this.props;
		if ( ! onMerge && ! onRemove ) {
			return;
		}

		if ( ! getSelection().isCollapsed ) {
			return;
		}

		const isForward = ( event.keyCode === DELETE );
		const rootNode = this.editor.getBody();
		if ( ! isHorizontalEdge( rootNode, ! isForward ) ) {
			return;
		}

		this.onCreateUndoLevel();

		if ( onMerge ) {
			onMerge( isForward );
		}

		if ( onRemove && this.isEmpty() ) {
			onRemove( isForward );
		}

		event.preventDefault();

		// Calling onMerge() or onRemove() will destroy the editor, so it's
		// important that other handlers (e.g. ones registered by TinyMCE) do
		// not also attempt to handle this event.
		event.stopImmediatePropagation();
	}

	/**
	 * Handles a horizontal navigation key down event to stop propagation if it
	 * can be inferred that it will be handled by TinyMCE (notably transitions
	 * out of an inline boundary node).
	 *
	 * @param {KeyboardEvent} event Keydown event.
	 */
	onHorizontalNavigationKeyDown( event ) {
		const { focusNode, focusOffset } = window.getSelection();
		const { nodeType, nodeValue } = focusNode;

		if ( nodeType !== Node.TEXT_NODE ) {
			return;
		}

		const isReverse = event.keyCode === LEFT;

		let offset = focusOffset;
		if ( isReverse ) {
			offset--;
		}

		// [WORKAROUND]: When in a new paragraph in a new inline boundary node,
		// while typing the zero-width space occurs as the first child instead
		// of at the end of the inline boundary where the caret is. This should
		// only be exempt when focusNode is not _only_ the ZWSP, which occurs
		// when caret is placed on the right outside edge of inline boundary.
		if ( ! isReverse && focusOffset === nodeValue.length &&
				nodeValue.length > 1 && nodeValue[ 0 ] === TINYMCE_ZWSP ) {
			offset = 0;
		}

		if ( nodeValue[ offset ] === TINYMCE_ZWSP ) {
			event.stopPropagation();
		}
	}

	/**
	 * Handles a keydown event from tinyMCE.
	 *
	 * @param {KeyboardEvent} event Keydown event.
	 */
	onKeyDown( event ) {
		const { keyCode } = event;
		const dom = this.editor.dom;
		const rootNode = this.editor.getBody();

		const isDeleteKey = keyCode === BACKSPACE || keyCode === DELETE;
		if ( isDeleteKey ) {
			this.onDeleteKeyDown( event );
		}

		const isHorizontalNavigation = keyCode === LEFT || keyCode === RIGHT;
		if ( isHorizontalNavigation ) {
			this.onHorizontalNavigationKeyDown( event );
		}

		// If we click shift+Enter on inline RichTexts, we avoid creating two contenteditables
		// We also split the content and call the onSplit prop if provided.
		if ( event.keyCode === ENTER ) {
			if ( this.props.multiline ) {
				if ( ! this.props.onSplit ) {
					return;
				}

				const selectedNode = this.editor.selection.getNode();

				if ( selectedNode.parentNode !== rootNode ) {
					return;
				}

				if ( ! dom.isEmpty( selectedNode ) ) {
					return;
				}

				event.preventDefault();
				this.onCreateUndoLevel();

				const childNodes = Array.from( rootNode.childNodes );
				const index = dom.nodeIndex( selectedNode );
				const beforeNodes = childNodes.slice( 0, index );
				const afterNodes = childNodes.slice( index + 1 );

				const { format } = this.props;
				const before = domToFormat( beforeNodes, format, this.editor );
				const after = domToFormat( afterNodes, format, this.editor );

				this.restoreContentAndSplit( before, after );
			} else {
				event.preventDefault();
				this.onCreateUndoLevel();

				if ( event.shiftKey || ! this.props.onSplit ) {
					this.editor.execCommand( 'InsertLineBreak', false, event );
				} else {
					this.splitContent();
				}
			}
		}
	}

	/**
	 * Handles tinyMCE key up event.
	 *
	 * @param {number} keyCode The key code that has been pressed on the keyboard.
	 */
	onKeyUp( { keyCode } ) {
		// The input event does not fire when the whole field is selected and
		// BACKSPACE is pressed.
		if ( keyCode === BACKSPACE ) {
			this.onChange();
		}

		// `scrollToRect` is called on `nodechange`, whereas calling it on
		// `keyup` *when* moving to a new RichText element results in incorrect
		// scrolling. Though the following allows false positives, it results
		// in much smoother scrolling.
		if ( this.props.isViewportSmall && keyCode !== BACKSPACE && keyCode !== ENTER ) {
			this.scrollToRect( getRectangleFromRange( this.editor.selection.getRng() ) );
		}
	}

	scrollToRect( rect ) {
		const { top: caretTop } = rect;
		const container = getScrollContainer( this.editor.getBody() );

		if ( ! container ) {
			return;
		}

		// When scrolling, avoid positioning the caret at the very top of
		// the viewport, providing some "air" and some textual context for
		// the user, and avoiding toolbars.
		const graceOffset = 100;

		// Avoid pointless scrolling by establishing a threshold under
		// which scrolling should be skipped;
		const epsilon = 10;
		const delta = caretTop - graceOffset;

		if ( Math.abs( delta ) > epsilon ) {
			container.scrollTo(
				container.scrollLeft,
				container.scrollTop + delta,
			);
		}
	}

	/**
	 * Splits the content at the location of the selection.
	 *
	 * Replaces the content of the editor inside this element with the contents
	 * before the selection. Sends the elements after the selection to the `onSplit`
	 * handler.
	 *
	 * @param {Array} blocks The blocks to add after the split point.
	 */
	splitContent( blocks = [] ) {
		if ( ! this.props.onSplit ) {
			return;
		}

		const { dom } = this.editor;
		const rootNode = this.editor.getBody();
		const beforeRange = dom.createRng();
		const afterRange = dom.createRng();
		const selectionRange = this.editor.selection.getRng();

		if ( rootNode.childNodes.length ) {
			beforeRange.setStart( rootNode, 0 );
			beforeRange.setEnd( selectionRange.startContainer, selectionRange.startOffset );

			afterRange.setStart( selectionRange.endContainer, selectionRange.endOffset );
			afterRange.setEnd( rootNode, dom.nodeIndex( rootNode.lastChild ) + 1 );

			const beforeFragment = beforeRange.extractContents();
			const afterFragment = afterRange.extractContents();

			const { format } = this.props;
			const before = domToFormat( filterEmptyNodes( beforeFragment.childNodes ), format, this.editor );
			const after = domToFormat( filterEmptyNodes( afterFragment.childNodes ), format, this.editor );

			this.restoreContentAndSplit( before, after, blocks );
		} else {
			this.restoreContentAndSplit( [], [], blocks );
		}
	}

	onNewBlock() {
		if ( this.props.multiline !== 'p' || ! this.props.onSplit ) {
			return;
		}

		// Getting the content before and after the cursor
		const childNodes = Array.from( this.editor.getBody().childNodes );
		let selectedChild = this.editor.selection.getStart();
		while ( childNodes.indexOf( selectedChild ) === -1 && selectedChild.parentNode ) {
			selectedChild = selectedChild.parentNode;
		}
		const splitIndex = childNodes.indexOf( selectedChild );
		if ( splitIndex === -1 ) {
			return;
		}
		const beforeNodes = childNodes.slice( 0, splitIndex );
		const lastNodeBeforeCursor = last( beforeNodes );
		// Avoid splitting on single enter
		if (
			! lastNodeBeforeCursor ||
			beforeNodes.length < 2 ||
			!! lastNodeBeforeCursor.textContent
		) {
			return;
		}

		const before = beforeNodes.slice( 0, beforeNodes.length - 1 );

		// Removing empty nodes from the beginning of the "after"
		// avoids empty paragraphs at the beginning of newly created blocks.
		const after = childNodes.slice( splitIndex ).reduce( ( memo, node ) => {
			if ( ! memo.length && ! node.textContent ) {
				return memo;
			}

			memo.push( node );
			return memo;
		}, [] );

		// Splitting into two blocks
		this.setContent( this.props.value );

		const { format } = this.props;
		this.restoreContentAndSplit(
			domToFormat( before, format, this.editor ),
			domToFormat( after, format, this.editor )
		);
	}

	onNodeChange( { parents } ) {
		if ( document.activeElement !== this.editor.getBody() ) {
			return;
		}

		const formatNames = this.props.formattingControls;
		const formats = this.editor.formatter.matchAll( formatNames ).reduce( ( accFormats, activeFormat ) => {
			accFormats[ activeFormat ] = {
				isActive: true,
				...getFormatProperties( activeFormat, parents ),
			};

			return accFormats;
		}, {} );

		let rect;
		const selectedAnchor = find( parents, ( node ) => node.tagName === 'A' );
		if ( selectedAnchor ) {
			// If we selected a link, position the Link UI below the link
			rect = selectedAnchor.getBoundingClientRect();
		} else {
			// Otherwise, position the Link UI below the cursor or text selection
			rect = getRectangleFromRange( this.editor.selection.getRng() );
		}
		const focusPosition = this.getFocusPosition( rect );

		this.setState( { formats, focusPosition, selectedNodeId: this.state.selectedNodeId + 1 } );

		if ( this.props.isViewportSmall ) {
			// Originally called on `focusin`, that hook turned out to be
			// premature. On `nodechange` we can work with the finalized TinyMCE
			// instance and scroll to proper position.
			this.scrollToRect( rect );
		}
	}

	updateContent() {
		// Do not trigger a change event coming from the TinyMCE undo manager.
		// Our global state is already up-to-date.
		this.editor.undoManager.ignore( () => {
			const bookmark = this.editor.selection.getBookmark( 2, true );

			this.savedContent = this.props.value;
			this.setContent( this.savedContent );
			this.editor.selection.moveToBookmark( bookmark );
		} );
	}

	setContent( content ) {
		const { format } = this.props;
		this.editor.setContent( valueToString( content, format ) );
	}

	getContent() {
		const { format } = this.props;

		switch ( format ) {
			case 'string':
				return this.editor.getContent();
			default:
				return tinyMCENodeToElement( this.editor.getContent( { format: 'tree' } ) );
		}
	}

	componentDidUpdate( prevProps ) {
		// The `savedContent` var allows us to avoid updating the content right after an `onChange` call
		if (
			!! this.editor &&
			this.props.tagName === prevProps.tagName &&
			this.props.value !== prevProps.value &&
			this.props.value !== this.savedContent &&

			// Comparing using isEqual is necessary especially to avoid unnecessary updateContent calls
			// This fixes issues in multi richText blocks like quotes when moving the focus between
			// the different editables.
			! isEqual( this.props.value, prevProps.value ) &&
			! isEqual( this.props.value, this.savedContent )
		) {
			this.updateContent();
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( 'development' === process.env.NODE_ENV ) {
			if ( ! isEqual( this.props.formatters, nextProps.formatters ) ) {
				// eslint-disable-next-line no-console
				console.error( 'Formatters passed via `formatters` prop will only be registered once. Formatters can be enabled/disabled via the `formattingControls` prop.' );
			}
		}
	}

	/**
	 * Returns true if the field is currently empty, or false otherwise.
	 *
	 * @return {boolean} Whether field is empty.
	 */
	isEmpty() {
		const { value, format } = this.props;
		if ( ! value ) {
			return true;
		}

		return (
			format === 'string' ||
			! Children.count( value )
		);
	}

	isFormatActive( format ) {
		return this.state.formats[ format ] && this.state.formats[ format ].isActive;
	}

	removeFormat( format ) {
		this.editor.focus();
		this.editor.formatter.remove( format );
	}

	applyFormat( format, args, node ) {
		this.editor.focus();
		this.editor.formatter.apply( format, args, node );
	}

	changeFormats( formats ) {
		forEach( formats, ( formatValue, format ) => {
			if ( format === 'link' ) {
				if ( formatValue !== undefined ) {
					if ( formatValue.isAdding ) {
						return;
					}

					const anchor = this.editor.dom.getParent( this.editor.selection.getNode(), 'a' );
					if ( ! anchor ) {
						this.removeFormat( 'link' );
					}
					const { value: href, ...params } = formatValue;
					this.applyFormat( 'link', { href, ...params }, anchor );
				} else {
					this.editor.execCommand( 'Unlink' );
				}
			} else {
				const isActive = this.isFormatActive( format );
				if ( isActive && ! formatValue ) {
					this.removeFormat( format );
				} else if ( ! isActive && formatValue ) {
					this.applyFormat( format );
				}
			}
		} );

		this.setState( ( state ) => ( {
			formats: merge( {}, state.formats, formats ),
		} ) );
	}

	/**
	 * Calling onSplit means we need to abort the change done by TinyMCE.
	 * we need to call updateContent to restore the initial content before calling onSplit.
	 *
	 * @param {Array}  before content before the split position
	 * @param {Array}  after  content after the split position
	 * @param {?Array} blocks blocks to insert at the split position
	 */
	restoreContentAndSplit( before, after, blocks = [] ) {
		this.updateContent();
		this.props.onSplit( before, after, ...blocks );
	}

	render() {
		const {
			tagName: Tagname = 'div',
			style,
			value,
			wrapperClassName,
			className,
			inlineToolbar = false,
			formattingControls,
			placeholder,
			multiline: MultilineTag,
			keepPlaceholderOnFocus = false,
			isSelected,
			formatters,
			autocompleters,
			format,
		} = this.props;

		const ariaProps = { ...pickAriaProps( this.props ), 'aria-multiline': !! MultilineTag };

		// Generating a key that includes `tagName` ensures that if the tag
		// changes, we unmount and destroy the previous TinyMCE element, then
		// mount and initialize a new child element in its place.
		const key = [ 'editor', Tagname ].join();
		const isPlaceholderVisible = placeholder && ( ! isSelected || keepPlaceholderOnFocus ) && this.isEmpty();
		const classes = classnames( wrapperClassName, 'editor-rich-text' );

		const formatToolbar = (
			<FormatToolbar
				selectedNodeId={ this.state.selectedNodeId }
				focusPosition={ this.state.focusPosition }
				formats={ this.state.formats }
				onChange={ this.changeFormats }
				enabledControls={ formattingControls }
				customControls={ formatters }
			/>
		);

		return (
			<div className={ classes }
				ref={ this.containerRef }
				onFocus={ this.setFocusedElement }
			>
				{ isSelected && ! inlineToolbar && (
					<BlockFormatControls>
						{ formatToolbar }
					</BlockFormatControls>
				) }
				{ isSelected && inlineToolbar && (
					<div className="editor-rich-text__inline-toolbar">
						{ formatToolbar }
					</div>
				) }
				<Autocomplete onReplace={ this.props.onReplace } completers={ autocompleters }>
					{ ( { isExpanded, listBoxId, activeId } ) => (
						<Fragment>
							<TinyMCE
								tagName={ Tagname }
								getSettings={ this.getSettings }
								onSetup={ this.onSetup }
								style={ style }
								defaultValue={ value }
								format={ format }
								isPlaceholderVisible={ isPlaceholderVisible }
								aria-label={ placeholder }
								aria-autocomplete="list"
								aria-expanded={ isExpanded }
								aria-owns={ listBoxId }
								aria-activedescendant={ activeId }
								{ ...ariaProps }
								className={ className }
								key={ key }
							/>
							{ isPlaceholderVisible &&
								<Tagname
									className={ classnames( 'editor-rich-text__tinymce', className ) }
									style={ style }
								>
									{ MultilineTag ? <MultilineTag>{ placeholder }</MultilineTag> : placeholder }
								</Tagname>
							}
							{ isSelected && <Slot name="RichText.Siblings" /> }
						</Fragment>
					) }
				</Autocomplete>
			</div>
		);
	}
}

RichText.contextTypes = {
	onUndo: noop,
	onRedo: noop,
	canUserUseUnfilteredHTML: noop,
	onCreateUndoLevel: noop,
};

RichText.defaultProps = {
	formattingControls: DEFAULT_FORMATS,
	formatters: [],
	format: 'element',
};

const RichTextContainer = compose( [
	withInstanceId,
	withBlockEditContext( ( context, ownProps ) => {
		// When explicitly set as not selected, do nothing.
		if ( ownProps.isSelected === false ) {
			return {};
		}
		// When explicitly set as selected, use the value stored in the context instead.
		if ( ownProps.isSelected === true ) {
			return {
				isSelected: context.isSelected,
			};
		}
		// Ensures that only one RichText component can be focused.
		return {
			isSelected: context.isSelected && context.focusedElement === ownProps.instanceId,
			setFocusedElement: context.setFocusedElement,
		};
	} ),
	withSelect( ( select ) => {
		const { isViewportMatch = identity } = select( 'core/viewport' ) || {};

		return {
			isViewportSmall: isViewportMatch( '< small' ),
		};
	} ),
	withSafeTimeout,
] )( RichText );

RichTextContainer.Content = ( { value, format = 'element', tagName: Tag, ...props } ) => {
	let children;
	switch ( format ) {
		case 'string':
			children = <RawHTML>{ value }</RawHTML>;
			break;
		default:
			children = value;
			break;
	}

	if ( Tag ) {
		return <Tag { ...props }>{ children }</Tag>;
	}

	return children;
};

export default RichTextContainer;
