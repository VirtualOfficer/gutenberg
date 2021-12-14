/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * WordPress dependencies
 */
import { Button, PanelBody, PanelRow } from '@wordpress/components';
import { __, _n } from '@wordpress/i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { Fragment, useState } from '@wordpress/element';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import EntityRecordItem from './entity-record-item';

export default function DiscardEntityChangesPanel( { closePanel, savables } ) {
	const isSaving = useSelect( ( select ) =>
		savables.some( ( { kind, name, key } ) =>
			select( coreStore ).isSavingEntityRecord( kind, name, key )
		)
	);

	const {
		__experimentalResetEditedEntityRecord: resetEditedEntityRecord,
		__experimentalResetSpecifiedEntityEdits: resetSpecifiedEntityEdits,
	} = useDispatch( coreStore );

	const { createSuccessNotice } = useDispatch( noticesStore );

	// Selected entities to be discarded.
	const [ selectedEntities, _setSelectedEntities ] = useState( [] );

	const setSelectedEntities = ( { kind, name, key, property }, checked ) => {
		if ( ! checked ) {
			_setSelectedEntities(
				selectedEntities.filter(
					( elt ) =>
						elt.kind !== kind ||
						elt.name !== name ||
						elt.key !== key ||
						elt.property !== property
				)
			);
		} else {
			_setSelectedEntities( [
				...selectedEntities,
				{ kind, name, key, property },
			] );
		}
	};

	const discardCheckedEntities = () => {
		closePanel();

		const numberOfSelectedEntities = selectedEntities.length;

		const siteItemsToDiscard = [];
		selectedEntities.forEach( ( { kind, name, key, property } ) => {
			if ( 'root' === kind && 'site' === name ) {
				siteItemsToDiscard.push( property );
			} else {
				resetEditedEntityRecord( kind, name, key );
			}
		} );
		resetSpecifiedEntityEdits(
			'root',
			'site',
			undefined,
			siteItemsToDiscard
		);

		if ( numberOfSelectedEntities === savables.length ) {
			createSuccessNotice( __( 'All changes discarded.' ), {
				type: 'snackbar',
			} );
		} else {
			createSuccessNotice(
				_n(
					'Change discarded.',
					'Some changes discarded.',
					numberOfSelectedEntities
				),
				{
					type: 'snackbar',
				}
			);
		}
	};

	return (
		<Fragment>
			<div>
				<div className="entities-saved-states__text-prompt">
					<strong>{ __( 'Changes saved!' ) }</strong>
				</div>
				<div className="entities-saved-states__text-prompt">
					<strong>{ __( "What's next?" ) }</strong>
					<p>
						{ __(
							'Your template still has some unsaved changes.'
						) }
					</p>
					<p>
						{ __(
							'You can select and discard them now, or close the panel and deal with them later.'
						) }
					</p>
				</div>

				<PanelBody initialOpen={ true }>
					{ isSaving && (
						<ul className="entities-saved-states__discard-changes__saving">
							<li className="entities-saved-states__discard-changes-item">
								&#8203;
							</li>
							<li className="entities-saved-states__discard-changes-item">
								&#8203;
							</li>
							<li className="entities-saved-states__discard-changes-item">
								&#8203;
							</li>
						</ul>
					) }
					{ ! isSaving &&
						savables.map( ( record ) => (
							<EntityRecordItem
								key={ record.key || record.property }
								record={ record }
								checked={ some(
									selectedEntities,
									( elt ) =>
										elt.kind === record.kind &&
										elt.name === record.name &&
										elt.key === record.key &&
										elt.property === record.property
								) }
								onChange={ ( value ) =>
									setSelectedEntities( record, value )
								}
							/>
						) ) }
					<PanelRow>
						<Button
							disabled={
								selectedEntities.length === 0 || isSaving
							}
							isDestructive
							onClick={ discardCheckedEntities }
						>
							{ __( 'Discard changes' ) }
						</Button>
					</PanelRow>
				</PanelBody>
			</div>
		</Fragment>
	);
}
