/**
 * External dependencies
 */
import fastDeepEqual from 'fast-deep-equal/es6';

/**
 * WordPress dependencies
 */
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { Disabled } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useContext, useEffect, useRef, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import useNavigationMenu from '../use-navigation-menu';

const EMPTY_OBJECT = {};
const DRAFT_MENU_PARAMS = [
	'postType',
	'wp_navigation',
	{ status: 'draft', per_page: -1 },
];

const DEFAULT_BLOCK = {
	name: 'core/navigation-link',
};

const ALLOWED_BLOCKS = [
	'core/navigation-link',
	'core/search',
	'core/social-links',
	'core/page-list',
	'core/spacer',
	'core/home-link',
	'core/site-title',
	'core/site-logo',
	'core/navigation-submenu',
];

export default function UnsavedInnerBlocks( {
	blocks,
	createNavigationMenu,

	hasSelection,
} ) {
	const originalBlocks = useRef();

	useEffect( () => {
		// Initially store the uncontrolled inner blocks for
		// dirty state comparison.
		if ( ! originalBlocks?.current ) {
			originalBlocks.current = blocks;
		}
	}, [ blocks ] );

	let innerBlocksAreDirty = false;

	if (
		originalBlocks.current &&
		blocks?.length === 1 &&
		blocks[ 0 ]?.name === 'core/page-list'
	) {
		// If the blocks are a page list, we need to ignore
		// inner blocks and compare remaining attributes only.
		// Why? Because Page List block dynamically sets its
		// child inner blocks async following a REST API request.
		// This means that the inner blocks are empty when the
		// block is first inserted, and then populated later once
		// the REST API request resolves. This causes the original
		// check to always return dirty as the inner blocks change.
		// This is a workaround for this specific scenario.
		const originalPageListBlock = originalBlocks.current[ 0 ];
		const currentPageListBlock = blocks[ 0 ];

		const {
			innerBlocks: discardedOriginalInnerBlocks,
			...originalPageListBlockWithoutInnerBlocks
		} = originalPageListBlock;

		const {
			innerBlocks: discardedCurrentInnerBlocks,
			...currentPageListBlockWithoutInnerBlocks
		} = currentPageListBlock;

		innerBlocksAreDirty = ! fastDeepEqual(
			originalPageListBlockWithoutInnerBlocks,
			currentPageListBlockWithoutInnerBlocks
		);
	} else {
		// If the current inner blocks object does not display referential equality
		// with the original inner blocks from the post content then the
		// user has made changes to the inner blocks. At this point the inner
		// blocks can be considered "dirty".
		// We also make sure the current innerBlocks had a chance to be set.
		innerBlocksAreDirty =
			!! originalBlocks.current && blocks !== originalBlocks.current;
	}

	const shouldDirectInsert = useMemo(
		() =>
			blocks.every(
				( { name } ) =>
					name === 'core/navigation-link' ||
					name === 'core/navigation-submenu' ||
					name === 'core/page-list'
			),
		[ blocks ]
	);

	// The block will be disabled in a block preview, use this as a way of
	// avoiding the side-effects of this component for block previews.
	const isDisabled = useContext( Disabled.Context );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'wp-block-navigation__container',
		},
		{
			renderAppender: hasSelection ? undefined : false,
			allowedBlocks: ALLOWED_BLOCKS,
			__experimentalDefaultBlock: DEFAULT_BLOCK,
			__experimentalDirectInsert: shouldDirectInsert,
		}
	);

	const { isSaving, draftNavigationMenus, hasResolvedDraftNavigationMenus } =
		useSelect(
			( select ) => {
				if ( isDisabled ) {
					return EMPTY_OBJECT;
				}

				const {
					getEntityRecords,
					hasFinishedResolution,
					isSavingEntityRecord,
				} = select( coreStore );

				return {
					isSaving: isSavingEntityRecord(
						'postType',
						'wp_navigation'
					),
					draftNavigationMenus: getEntityRecords(
						...DRAFT_MENU_PARAMS
					),
					hasResolvedDraftNavigationMenus: hasFinishedResolution(
						'getEntityRecords',
						DRAFT_MENU_PARAMS
					),
				};
			},
			[ isDisabled ]
		);

	const { hasResolvedNavigationMenus, navigationMenus } = useNavigationMenu();

	// Automatically save the uncontrolled blocks.
	useEffect( () => {
		// The block will be disabled when used in a BlockPreview.
		// In this case avoid automatic creation of a wp_navigation post.
		// Otherwise the user will be spammed with lots of menus!
		//
		// Also ensure other navigation menus have loaded so an
		// accurate name can be created.
		//
		// Don't try saving when another save is already
		// in progress.
		//
		// And finally only create the menu when the block is selected,
		// which is an indication they want to start editing.
		if (
			isDisabled ||
			isSaving ||
			! hasResolvedDraftNavigationMenus ||
			! hasResolvedNavigationMenus ||
			! hasSelection ||
			! innerBlocksAreDirty
		) {
			return;
		}

		createNavigationMenu( null, blocks );
	}, [
		isDisabled,
		isSaving,
		hasResolvedDraftNavigationMenus,
		hasResolvedNavigationMenus,
		draftNavigationMenus,
		navigationMenus,
		hasSelection,
		createNavigationMenu,
		blocks,
	] );

	const Wrapper = isSaving ? Disabled : 'div';

	return <Wrapper { ...innerBlocksProps } />;
}
