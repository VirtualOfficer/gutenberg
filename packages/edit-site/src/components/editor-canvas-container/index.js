/**
 * WordPress dependencies
 */
import { Children, cloneElement, useState } from '@wordpress/element';
import {
	Button,
	privateApis as componentsPrivateApis,
	__experimentalUseSlotFills as useSlotFills,
} from '@wordpress/components';
import { ESCAPE } from '@wordpress/keycodes';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { closeSmall } from '@wordpress/icons';
import { useFocusOnMount, useFocusReturn } from '@wordpress/compose';
import { store as preferencesStore } from '@wordpress/preferences';
import {
	store as editorStore,
	privateApis as editorPrivateApis,
} from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { store as editSiteStore } from '../../store';

const { ResizableEditor } = unlock( editorPrivateApis );

/**
 * Returns a translated string for the title of the editor canvas container.
 *
 * @param {string} view Editor canvas container view.
 *
 * @return {string} Translated string corresponding to value of view. Default is ''.
 */
function getEditorCanvasContainerTitle( view ) {
	switch ( view ) {
		case 'style-book':
			return __( 'Style Book' );
		case 'global-styles-revisions':
		case 'global-styles-revisions:style-book':
			return __( 'Style Revisions' );
		default:
			return '';
	}
}

// Creates a private slot fill.
const { createPrivateSlotFill } = unlock( componentsPrivateApis );
const SLOT_FILL_NAME = 'EditSiteEditorCanvasContainerSlot';
const {
	privateKey,
	Slot: EditorCanvasContainerSlot,
	Fill: EditorCanvasContainerFill,
} = createPrivateSlotFill( SLOT_FILL_NAME );

function EditorCanvasContainer( {
	children,
	closeButtonLabel,
	onClose,
	enableResizing = false,
} ) {
	const { editorCanvasContainerView, showListViewByDefault } = useSelect(
		( select ) => {
			const _editorCanvasContainerView = unlock(
				select( editSiteStore )
			).getEditorCanvasContainerView();

			const _showListViewByDefault = select( preferencesStore ).get(
				'core',
				'showListViewByDefault'
			);

			return {
				editorCanvasContainerView: _editorCanvasContainerView,
				showListViewByDefault: _showListViewByDefault,
			};
		},
		[]
	);
	const [ isClosed, setIsClosed ] = useState( false );
	const { setEditorCanvasContainerView } = unlock(
		useDispatch( editSiteStore )
	);
	const { setIsListViewOpened } = useDispatch( editorStore );

	const focusOnMountRef = useFocusOnMount( 'firstElement' );
	const sectionFocusReturnRef = useFocusReturn();

	function onCloseContainer() {
		setIsListViewOpened( showListViewByDefault );
		setEditorCanvasContainerView( undefined );
		setIsClosed( true );
		if ( typeof onClose === 'function' ) {
			onClose();
		}
	}

	function closeOnEscape( event ) {
		if ( event.keyCode === ESCAPE && ! event.defaultPrevented ) {
			event.preventDefault();
			onCloseContainer();
		}
	}

	const childrenWithProps = Array.isArray( children )
		? Children.map( children, ( child, index ) =>
				index === 0
					? cloneElement( child, {
							ref: sectionFocusReturnRef,
					  } )
					: child
		  )
		: cloneElement( children, {
				ref: sectionFocusReturnRef,
		  } );

	if ( isClosed ) {
		return null;
	}

	const title = getEditorCanvasContainerTitle( editorCanvasContainerView );
	const shouldShowCloseButton = onClose || closeButtonLabel;

	return (
		<EditorCanvasContainerFill>
			<div className="edit-site-editor-canvas-container">
				<ResizableEditor enableResizing={ enableResizing }>
					{ /* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */ }
					<section
						className="edit-site-editor-canvas-container__section"
						ref={ shouldShowCloseButton ? focusOnMountRef : null }
						onKeyDown={ closeOnEscape }
						aria-label={ title }
					>
						{ shouldShowCloseButton && (
							<Button
								className="edit-site-editor-canvas-container__close-button"
								icon={ closeSmall }
								label={ closeButtonLabel || __( 'Close' ) }
								onClick={ onCloseContainer }
							/>
						) }
						{ childrenWithProps }
					</section>
				</ResizableEditor>
			</div>
		</EditorCanvasContainerFill>
	);
}
function useHasEditorCanvasContainer() {
	const fills = useSlotFills( privateKey );
	return !! fills?.length;
}

EditorCanvasContainer.Slot = EditorCanvasContainerSlot;
export default EditorCanvasContainer;
export { useHasEditorCanvasContainer, getEditorCanvasContainerTitle };
