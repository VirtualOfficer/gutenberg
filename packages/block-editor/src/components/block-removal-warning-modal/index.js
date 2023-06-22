/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	Modal,
	Button,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __, _n } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import { unlock } from '../../lock-unlock';

// In certain editing contexts, we'd like to prevent accidental removal of
// important blocks. For example, in the site editor, the Query Loop block is
// deemed important. In such cases, we'll ask the user for confirmation that
// they intended to remove such block(s).
//
// @see https://github.com/WordPress/gutenberg/pull/51145
export const blockTypePromptMessages = {
	'core/query': __( 'Query Loop displays a list of posts or pages.' ),
	'core/post-content': __(
		'Post Content displays the content of a post or page.'
	),
};

export function BlockRemovalWarningModal() {
	const { clientIds, selectPrevious, blockNamesForPrompt } = useSelect(
		( select ) =>
			unlock( select( blockEditorStore ) ).isRemovalPromptDisplayed()
	);

	const {
		clearRemovalPrompt,
		toggleRemovalPromptSupport,
		privateRemoveBlocks,
	} = unlock( useDispatch( blockEditorStore ) );

	// Signalling the removal prompt is in place.
	useEffect( () => {
		toggleRemovalPromptSupport( true );
		return () => {
			toggleRemovalPromptSupport( false );
		};
	}, [ toggleRemovalPromptSupport ] );

	if ( ! blockNamesForPrompt ) {
		return;
	}

	const onConfirmRemoval = () => {
		privateRemoveBlocks( clientIds, selectPrevious, /* force */ true );
		clearRemovalPrompt();
	};

	return (
		<Modal
			title={ _n(
				'Really delete this block?',
				'Really delete these blocks?',
				clientIds.length
			) }
			onRequestClose={ clearRemovalPrompt }
		>
			{ blockNamesForPrompt.length === 1 ? (
				<p>{ blockTypePromptMessages[ blockNamesForPrompt[ 0 ] ] }</p>
			) : (
				<ul style={ { listStyleType: 'disc', paddingLeft: '1rem' } }>
					{ blockNamesForPrompt.map( ( name ) => (
						<li key={ name }>
							{ blockTypePromptMessages[ name ] }
						</li>
					) ) }
				</ul>
			) }
			<p>
				{ _n(
					'Removing this block is not advised.',
					'Removing these blocks is not advised.',
					blockNamesForPrompt.length
				) }
			</p>
			<HStack justify="right">
				<Button variant="tertiary" onClick={ clearRemovalPrompt }>
					{ __( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ onConfirmRemoval }>
					{ __( 'Confirm' ) }
				</Button>
			</HStack>
		</Modal>
	);
}
