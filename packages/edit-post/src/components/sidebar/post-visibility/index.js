/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { PanelRow, Dropdown, Button } from '@wordpress/components';
import {
	PostVisibility as PostVisibilityForm,
	PostVisibilityLabel,
	PostVisibilityCheck,
	usePostVisibilityLabel,
} from '@wordpress/editor';
import { useState } from '@wordpress/element';

export function PostVisibility() {
	// Use internal state instead of a ref to make sure that the component
	// re-renders when then anchor's ref updates.
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );

	return (
		<PostVisibilityCheck
			render={ ( { canEdit } ) => (
				<PanelRow
					ref={ setPopoverAnchor }
					className="edit-post-post-visibility"
				>
					<span>{ __( 'Visibility' ) }</span>
					{ ! canEdit && (
						<span>
							<PostVisibilityLabel />
						</span>
					) }
					{ canEdit && (
						<Dropdown
							position="bottom left"
							contentClassName="edit-post-post-visibility__dialog"
							popoverProps={ {
								// Anchor the popover to the middle of the
								// entire row so that it doesn't move around
								// when the label changes.
								anchor: popoverAnchor,
							} }
							focusOnMount
							renderToggle={ ( { isOpen, onToggle } ) => (
								<PostVisibilityToggle
									isOpen={ isOpen }
									onClick={ onToggle }
								/>
							) }
							renderContent={ ( { onClose } ) => (
								<PostVisibilityForm onClose={ onClose } />
							) }
						/>
					) }
				</PanelRow>
			) }
		/>
	);
}

function PostVisibilityToggle( { isOpen, onClick } ) {
	const label = usePostVisibilityLabel();
	return (
		<Button
			className="edit-post-post-visibility__toggle"
			variant="tertiary"
			aria-expanded={ isOpen }
			// translators: %s: Current post visibility.
			aria-label={ sprintf( __( 'Select visibility: %s' ), label ) }
			onClick={ onClick }
		>
			{ label }
		</Button>
	);
}

export default PostVisibility;
