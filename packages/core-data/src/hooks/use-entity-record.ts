/**
 * WordPress dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import deprecated from '@wordpress/deprecated';
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useQuerySelect from './use-query-select';
import { store as coreStore } from '../';
import type { Options, EntityRecordResolution } from './types';

/**
 * Resolves the specified entity record.
 *
 * @since 6.1.0 Introduced in WordPress core.
 *
 * @param    kind     Kind of the entity, e.g. `root` or a `postType`. See rootEntitiesConfig in ../entities.ts for a list of available kinds.
 * @param    name     Name of the entity, e.g. `plugin` or a `post`. See rootEntitiesConfig in ../entities.ts for a list of available names.
 * @param    recordId ID of the requested entity record.
 * @param    options  Optional hook options.
 * @example
 * ```js
 * import { useEntityRecord } from '@wordpress/core-data';
 *
 * function PageTitleDisplay( { id } ) {
 *   const { record, isResolving } = useEntityRecord( 'postType', 'page', id );
 *
 *   if ( isResolving ) {
 *     return 'Loading...';
 *   }
 *
 *   return record.title;
 * }
 *
 * // Rendered in the application:
 * // <PageTitleDisplay id={ 1 } />
 * ```
 *
 * In the above example, when `PageTitleDisplay` is rendered into an
 * application, the page and the resolution details will be retrieved from
 * the store state using `getEntityRecord()`, or resolved if missing.
 *
 * @example
 * ```js
 * import { useDispatch } from '@wordpress/data';
 * import { useCallback } from '@wordpress/element';
 * import { __ } from '@wordpress/i18n';
 * import { TextControl } from '@wordpress/components';
 * import { store as noticeStore } from '@wordpress/notices';
 * import { useEntityRecord } from '@wordpress/core-data';
 *
 * function PageRenameForm( { id } ) {
 * 	const page = useEntityRecord( 'postType', 'page', id );
 * 	const { createSuccessNotice, createErrorNotice } =
 * 		useDispatch( noticeStore );
 *
 * 	const setTitle = useCallback( ( title ) => {
 * 		page.edit( { title } );
 * 	}, [ page.edit ] );
 *
 * 	if ( page.isResolving ) {
 * 		return 'Loading...';
 * 	}
 *
 * 	async function onRename( event ) {
 * 		event.preventDefault();
 * 		try {
 * 			await page.save();
 * 			createSuccessNotice( __( 'Page renamed.' ), {
 * 				type: 'snackbar',
 * 			} );
 * 		} catch ( error ) {
 * 			createErrorNotice( error.message, { type: 'snackbar' } );
 * 		}
 * 	}
 *
 * 	return (
 * 		<form onSubmit={ onRename }>
 * 			<TextControl
 * 				label={ __( 'Name' ) }
 * 				value={ page.editedRecord.title }
 * 				onChange={ setTitle }
 * 			/>
 * 			<button type="submit">{ __( 'Save' ) }</button>
 * 		</form>
 * 	);
 * }
 *
 * // Rendered in the application:
 * // <PageRenameForm id={ 1 } />
 * ```
 *
 * In the above example, updating and saving the page title is handled
 * via the `edit()` and `save()` mutation helpers provided by
 * `useEntityRecord()`;
 *
 * @return Entity record data.
 * @template RecordType
 */
export default function useEntityRecord< RecordType >(
	kind: string,
	name: string,
	recordId: string | number,
	options: Options = { enabled: true }
): EntityRecordResolution< RecordType > {
	const { editEntityRecord, saveEditedEntityRecord } =
		useDispatch( coreStore );

	const mutations = useMemo(
		() => ( {
			edit: ( record ) =>
				editEntityRecord( kind, name, recordId, record ),
			save: ( saveOptions: any = {} ) =>
				saveEditedEntityRecord( kind, name, recordId, {
					throwOnError: true,
					...saveOptions,
				} ),
		} ),
		[ editEntityRecord, kind, name, recordId, saveEditedEntityRecord ]
	);

	const { editedRecord, hasEdits } = useSelect(
		( select ) => ( {
			editedRecord: select( coreStore ).getEditedEntityRecord(
				kind,
				name,
				recordId
			),
			hasEdits: select( coreStore ).hasEditsForEntityRecord(
				kind,
				name,
				recordId
			),
		} ),
		[ kind, name, recordId ]
	);

	const { data: record, ...querySelectRest } = useQuerySelect(
		( query ) => {
			if ( ! options.enabled ) {
				return {
					data: null,
				};
			}
			return query( coreStore ).getEntityRecord( kind, name, recordId );
		},
		[ kind, name, recordId, options.enabled ]
	);

	return {
		record,
		editedRecord,
		hasEdits,
		...querySelectRest,
		...mutations,
	};
}

export function __experimentalUseEntityRecord(
	kind: string,
	name: string,
	recordId: any,
	options: any
) {
	deprecated( `wp.data.__experimentalUseEntityRecord`, {
		alternative: 'wp.data.useEntityRecord',
		since: '6.1',
	} );
	return useEntityRecord( kind, name, recordId, options );
}
