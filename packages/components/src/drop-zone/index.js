/**
 * External dependencies
 */
import classnames from 'classnames';
import { includes, throttle } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useRef } from '@wordpress/element';
import { upload, Icon } from '@wordpress/icons';
import { getFilesFromDataTransfer } from '@wordpress/dom';
import { useRefEffect } from '@wordpress/compose';

function getDragEventType( { dataTransfer } ) {
	if ( dataTransfer ) {
		// Use lodash `includes` here as in the Edge browser `types` is implemented
		// as a DomStringList, whereas in other browsers it's an array. `includes`
		// happily works with both types.
		if (
			includes( dataTransfer.types, 'Files' ) ||
			getFilesFromDataTransfer( dataTransfer ).length > 0
		) {
			return 'file';
		}

		if ( includes( dataTransfer.types, 'text/html' ) ) {
			return 'html';
		}
	}

	return 'default';
}

function useFreshRef( value ) {
	const ref = useRef();
	ref.current = value;
	return ref;
}

export function useDropZone( {
	onFilesDrop,
	onHTMLDrop,
	onDrop: _onDrop,
	onDragStart,
	onDragEnter: _onDragEnter,
	onDragLeave: _onDragLeave,
	onDragEnd,
	isDisabled,
	onDragOver: _onDragOver,
} ) {
	const onFilesDropRef = useFreshRef( onFilesDrop );
	const onHTMLDropRef = useFreshRef( onHTMLDrop );
	const onDropRef = useFreshRef( _onDrop );
	const onDragStartRef = useFreshRef( onDragStart );
	const onDragEnterRef = useFreshRef( _onDragEnter );
	const onDragLeaveRef = useFreshRef( _onDragLeave );
	const onDragEndRef = useFreshRef( onDragEnd );
	const onDragOverRef = useFreshRef( _onDragOver );

	return useRefEffect(
		( element ) => {
			if ( isDisabled ) {
				return;
			}

			let isDraggingGlobally = false;

			element.setAttribute( 'data-is-drop-target', 'true' );

			const { ownerDocument } = element;
			const { defaultView } = ownerDocument;

			function onDragEnter( event ) {
				element.setAttribute( 'data-is-dragging', 'true' );

				if ( onDragEnterRef.current ) {
					onDragEnterRef.current( event );
				}
			}

			function updateDragZones( event ) {
				if ( onDragOverRef.current ) {
					onDragOverRef.current( event );
				}
			}

			const throttledUpdateDragZones = throttle( updateDragZones, 200 );

			function onDragOver( event ) {
				if ( event.target !== element ) {
					event.preventDefault();
				} else {
					throttledUpdateDragZones( event );
					event.preventDefault();
				}
			}

			function onDragLeave( event ) {
				if ( onDragLeaveRef.current ) {
					onDragLeaveRef.current( event );
				}
			}

			function resetDragState( event ) {
				throttledUpdateDragZones.cancel();

				element.removeAttribute( 'data-is-dragging' );

				if ( onDragEndRef.current && isDraggingGlobally ) {
					onDragEndRef.current( event );
				}
			}

			function onDrop( event ) {
				// This seemingly useless line has been shown to resolve a Safari issue
				// where files dragged directly from the dock are not recognized
				event.dataTransfer && event.dataTransfer.files.length; // eslint-disable-line no-unused-expressions

				const type = getDragEventType( event );

				if ( type === 'file' && onFilesDropRef.current ) {
					onFilesDropRef.current(
						getFilesFromDataTransfer( event.dataTransfer )
					);
				} else if ( type === 'html' && onHTMLDropRef.current ) {
					onHTMLDropRef.current(
						event.dataTransfer.getData( 'text/html' )
					);
				} else if ( type === 'default' && onDropRef.current ) {
					onDropRef.current( event );
				}

				resetDragState( event );

				event.stopPropagation();
				event.preventDefault();
			}

			function onGlobalDragOver( event ) {
				isDraggingGlobally = true;
				if ( onDragStartRef.current ) {
					onDragStartRef.current( event );
				}
				defaultView.removeEventListener( 'dragover', onGlobalDragOver );
			}

			element.addEventListener( 'drop', onDrop );
			element.addEventListener( 'dragenter', onDragEnter );
			element.addEventListener( 'dragover', onDragOver );
			element.addEventListener( 'dragleave', onDragLeave );
			defaultView.addEventListener( 'mouseup', resetDragState );
			// Note that `dragend` doesn't fire consistently for file and HTML drag
			// events where the drag origin is outside the browser window.
			// In Firefox it may also not fire if the originating node is removed.
			defaultView.addEventListener( 'dragend', resetDragState );
			defaultView.addEventListener( 'dragover', onGlobalDragOver );

			return () => {
				element.removeAttribute( 'data-is-drop-target' );
				element.removeEventListener( 'drop', onDrop );
				element.removeEventListener( 'dragenter', onDragEnter );
				element.removeEventListener( 'dragover', onDragOver );
				element.removeEventListener( 'dragleave', onDragLeave );
				defaultView.removeEventListener( 'mouseup', resetDragState );
				defaultView.removeEventListener( 'dragend', resetDragState );
				defaultView.addEventListener( 'dragover', onGlobalDragOver );
				throttledUpdateDragZones.cancel();
			};
		},
		[ isDisabled ]
	);
}

export default function DropZoneComponent( {
	className,
	label,
	onFilesDrop,
	onHTMLDrop,
	onDrop,
} ) {
	const [ isDraggingOverDocument, setIsDraggingOverDocument ] = useState();
	const [ isDraggingOverElement, setIsDraggingOverElement ] = useState();
	const [ type, setType ] = useState();
	const ref = useDropZone( {
		onFilesDrop,
		onHTMLDrop,
		onDrop,
		onDragStart( event ) {
			setIsDraggingOverDocument( true );
			setType( getDragEventType( event ) );
		},
		onDragEnd() {
			setIsDraggingOverDocument( false );
			setType();
		},
		onDragEnter() {
			setIsDraggingOverElement( true );
		},
		onDragLeave() {
			setIsDraggingOverElement( false );
		},
	} );

	let children;

	if ( isDraggingOverElement ) {
		children = (
			<div className="components-drop-zone__content">
				<Icon
					icon={ upload }
					className="components-drop-zone__content-icon"
				/>
				<span className="components-drop-zone__content-text">
					{ label ? label : __( 'Drop files to upload' ) }
				</span>
			</div>
		);
	}

	const classes = classnames( 'components-drop-zone', className, {
		'is-active':
			( isDraggingOverDocument || isDraggingOverElement ) &&
			( ( type === 'file' && onFilesDrop ) ||
				( type === 'html' && onHTMLDrop ) ||
				( type === 'default' && onDrop ) ),
		'is-dragging-over-document': isDraggingOverDocument,
		'is-dragging-over-element': isDraggingOverElement,
		[ `is-dragging-${ type }` ]: !! type,
	} );

	return (
		<div ref={ ref } className={ classes }>
			{ children }
		</div>
	);
}
