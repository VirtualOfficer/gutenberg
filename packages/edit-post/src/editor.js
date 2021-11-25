/**
 * External dependencies
 */
import { size, map, without } from 'lodash';

/**
 * WordPress dependencies
 */
import { store as blocksStore } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	EditorProvider,
	ErrorBoundary,
	PostLockedModal,
	store as editorStore,
} from '@wordpress/editor';
import { StrictMode, useMemo } from '@wordpress/element';
import { KeyboardShortcuts, SlotFillProvider } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { ShortcutProvider } from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import preventEventDiscovery from './prevent-event-discovery';
import Layout from './components/layout';
import EditorInitialization from './components/editor-initialization';
import EditPostSettings from './components/edit-post-settings';
import { store as editPostStore } from './store';

function Editor( {
	postId,
	postType,
	settings,
	initialEdits,
	onError,
	...props
} ) {
	const {
		hasFixedToolbar,
		focusMode,
		hasReducedUI,
		hasThemeStyles,
		post,
		preferredStyleVariations,
		hiddenBlockTypes,
		blockTypes,
		__experimentalLocalAutosaveInterval,
		keepCaretInsideBlock,
		isTemplateMode,
		template,
	} = useSelect(
		( select ) => {
			const {
				isFeatureActive,
				getPreference,
				__experimentalGetPreviewDeviceType,
				isEditingTemplate,
				getEditedPostTemplate,
			} = select( editPostStore );
			const { getEntityRecord, getPostType, getEntityRecords } = select(
				coreStore
			);
			const { getEditorSettings } = select( editorStore );
			const { getBlockTypes } = select( blocksStore );
			const isTemplate = [ 'wp_template', 'wp_template_part' ].includes(
				postType
			);
			// Ideally the initializeEditor function should be called using the ID of the REST endpoint.
			// to avoid the special case.
			let postObject;
			if ( isTemplate ) {
				const posts = getEntityRecords( 'postType', postType, {
					wp_id: postId,
				} );
				postObject = posts?.[ 0 ];
			} else {
				postObject = getEntityRecord( 'postType', postType, postId );
			}
			const supportsTemplateMode = getEditorSettings()
				.supportsTemplateMode;
			const isViewable = getPostType( postType )?.viewable ?? false;

			return {
				hasFixedToolbar:
					isFeatureActive( 'fixedToolbar' ) ||
					__experimentalGetPreviewDeviceType() !== 'Desktop',
				focusMode: isFeatureActive( 'focusMode' ),
				hasReducedUI: isFeatureActive( 'reducedUI' ),
				hasThemeStyles: isFeatureActive( 'themeStyles' ),
				preferredStyleVariations: getPreference(
					'preferredStyleVariations'
				),
				hiddenBlockTypes: getPreference( 'hiddenBlockTypes' ),
				blockTypes: getBlockTypes(),
				__experimentalLocalAutosaveInterval: getPreference(
					'localAutosaveInterval'
				),
				keepCaretInsideBlock: isFeatureActive( 'keepCaretInsideBlock' ),
				isTemplateMode: isEditingTemplate(),
				template:
					supportsTemplateMode && isViewable
						? getEditedPostTemplate()
						: null,
				post: postObject,
			};
		},
		[ postType, postId ]
	);

	const { updatePreferredStyleVariations, setIsInserterOpened } = useDispatch(
		editPostStore
	);

	const editorSettings = useMemo( () => {
		const result = {
			...settings,
			__experimentalPreferredStyleVariations: {
				value: preferredStyleVariations,
				onChange: updatePreferredStyleVariations,
			},
			hasFixedToolbar,
			focusMode,
			hasReducedUI,
			__experimentalLocalAutosaveInterval,

			// This is marked as experimental to give time for the quick inserter to mature.
			__experimentalSetIsInserterOpened: setIsInserterOpened,
			keepCaretInsideBlock,
		};

		// Defer to passed setting for `allowedBlockTypes` if provided as
		// anything other than `true` (where `true` is equivalent to allow
		// all block types).
		const defaultAllowedBlockTypes =
			true === settings.allowedBlockTypes
				? map( blockTypes, 'name' )
				: settings.allowedBlockTypes || [];
		if ( size( hiddenBlockTypes ) > 0 ) {
			// Omit hidden block types if exists and non-empty.
			result.allowedBlockTypes = without(
				defaultAllowedBlockTypes,
				...hiddenBlockTypes
			);
		}
		// Hide `Template Part` when we are not in template mode.
		if ( ! isTemplateMode ) {
			result.allowedBlockTypes = without(
				defaultAllowedBlockTypes,
				'core/template-part'
			);
		}
		return result;
	}, [
		settings,
		hasFixedToolbar,
		focusMode,
		hasReducedUI,
		hiddenBlockTypes,
		blockTypes,
		preferredStyleVariations,
		__experimentalLocalAutosaveInterval,
		setIsInserterOpened,
		updatePreferredStyleVariations,
		keepCaretInsideBlock,
		isTemplateMode,
	] );

	const styles = useMemo( () => {
		const themeStyles = [];
		const presetStyles = [];
		settings.styles.forEach( ( style ) => {
			if ( ! style.__unstableType || style.__unstableType === 'theme' ) {
				themeStyles.push( style );
			} else {
				presetStyles.push( style );
			}
		} );
		const defaultEditorStyles = [
			...settings.defaultEditorStyles,
			...presetStyles,
		];
		return hasThemeStyles && themeStyles.length
			? settings.styles
			: defaultEditorStyles;
	}, [ settings, hasThemeStyles ] );

	if ( ! post ) {
		return null;
	}

	return (
		<StrictMode>
			<ShortcutProvider>
				<EditPostSettings.Provider value={ settings }>
					<SlotFillProvider>
						<EditorProvider
							settings={ editorSettings }
							post={ post }
							initialEdits={ initialEdits }
							useSubRegistry={ false }
							__unstableTemplate={
								isTemplateMode ? template : undefined
							}
							{ ...props }
						>
							<ErrorBoundary onError={ onError }>
								<EditorInitialization postId={ postId } />
								<Layout styles={ styles } />
								<KeyboardShortcuts
									shortcuts={ preventEventDiscovery }
								/>
							</ErrorBoundary>
							<PostLockedModal />
						</EditorProvider>
					</SlotFillProvider>
				</EditPostSettings.Provider>
			</ShortcutProvider>
		</StrictMode>
	);
}

export default Editor;
