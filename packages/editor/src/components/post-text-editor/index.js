/**
 * External dependencies
 */
import Textarea from 'react-autosize-textarea';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { parse } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';
import { useInstanceId, compose } from '@wordpress/compose';
import { VisuallyHidden } from '@wordpress/components';

export function PostTextEditor( { onChange, onPersist, ...props } ) {
	const [ value, setValue ] = useState( props.value );
	const [ isDirty, setIsDirty ] = useState( false );
	const instanceId = useInstanceId( PostTextEditor );

	if ( ! isDirty && value !== props.value ) {
		setValue( props.value );
	}

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
	const edit = ( event ) => {
		const val = event.target.value;

		onChange( val );

		setValue( val );
		setIsDirty( true );
	};

	/**
	 * Function called when the user has completed their edits, responsible for
	 * ensuring that changes, if made, are surfaced to the onPersist prop
	 * callback and resetting dirty state.
	 */
	const stopEditing = () => {
		if ( isDirty ) {
			onPersist( value );
			setIsDirty( false );
		}
	};

	return (
		<>
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
				onChange={ edit }
				onBlur={ stopEditing }
				className="editor-post-text-editor"
				id={ `post-content-${ instanceId }` }
				placeholder={ __( 'Start writing with text or HTML' ) }
			/>
		</>
	);
}

export default compose( [
	withSelect( ( select ) => {
		const { getEditedPostContent } = select( 'core/editor' );
		return {
			value: getEditedPostContent(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { editPost, resetEditorBlocks } = dispatch( 'core/editor' );
		return {
			onChange( content ) {
				editPost( { content } );
			},
			onPersist( content ) {
				const blocks = parse( content );
				resetEditorBlocks( blocks );
			},
		};
	} ),
] )( PostTextEditor );
