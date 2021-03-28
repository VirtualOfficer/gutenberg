/**
 * External dependencies
 */
import Textarea from 'react-autosize-textarea';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { parse } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useInstanceId } from '@wordpress/compose';
import { VisuallyHidden } from '@wordpress/components';

export const DEBOUNCE_TIME = 300;
export default function PostTextEditor() {
	const postContent = useSelect(
		( select ) => select( 'core/editor' ).getEditedPostContent(),
		[]
	);

	const { editPost, resetEditorBlocks } = useDispatch( 'core/editor' );

	const [ value, setValue ] = useState( postContent );
	const [ isDirty, setIsDirty ] = useState( false );
	const [ isValid, setIsValid ] = useState( true );

	const instanceId = useInstanceId( PostTextEditor );

	if ( ! isDirty && value !== postContent ) {
		setValue( postContent );
	}

	const saveText = () => {
		const blocks = parse( value );
		const content = blocks[ 0 ]?.originalContent;
		if ( checkHTML( content ) ) {
			setIsValid( true );

			resetEditorBlocks( blocks );
		} else {
			setIsValid( false );
		}
	};

	useEffect( () => {
		const timeoutId = setTimeout( saveText, DEBOUNCE_TIME );
		return () => {
			clearTimeout( timeoutId );
		};
	}, [ value ] );

	/**
	 * Handles a textarea change event to notify the onChange prop callback and
	 * reflect the new value in the component's own state. This marks the start
	 * of the user's edits, if not already changed, preventing future props
	 * changes to value from replacing the rendered value. This is expected to
	 * be followed by a reset to dirty state via `stopEditing`.
	 *
	 * @see stopEditing
	 *
	 * @param {Event} event Change event.
	 */
	const onChange = ( event ) => {
		const newValue = event.target.value;
		editPost( { content: newValue } );
		setValue( newValue );
		setIsDirty( true );
	};

	/**
	 * Function called when the user has completed their edits, responsible for
	 * ensuring that changes, if made, are surfaced to the onPersist prop
	 * callback and resetting dirty state.
	 */
	const stopEditing = () => {
		if ( isDirty ) {
			saveText();
			setIsDirty( false );
		}
	};

	//Function that checks if html is valid
	const checkHTML = ( html ) => {
		const doc = document.createElement( 'div' );
		doc.innerHTML = html;
		return doc.innerHTML === html;
	};
	return (
		<>
			<div className={ isValid ? 'hide' : 'show' }>
				<h3>
					Warning ! Your code is not valid and will be not saved !
				</h3>
			</div>
			<VisuallyHidden
				as="label"
				htmlFor={ `post-content-${ instanceId }` }
			>
				{ __( 'Type text or HTML' ) }
			</VisuallyHidden>
			<Textarea
				autoComplete="off"
				dir="auto"
				value={ value }
				onChange={ onChange }
				onBlur={ stopEditing }
				className="editor-post-text-editor"
				id={ `post-content-${ instanceId }` }
				placeholder={ __( 'Start writing with text or HTML' ) }
			/>
		</>
	);
}
