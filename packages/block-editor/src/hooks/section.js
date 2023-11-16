/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { getBlockSupport } from '@wordpress/blocks';
import {
	Button,
	PanelBody,
	__experimentalTruncate as Truncate,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import InspectorControls from '../components/inspector-controls';
import useDisplayBlockControls from '../components/use-display-block-controls';
import { store as blockEditorStore } from '../store';
import { useBlockEditingMode } from '..';

export const SECTION_SUPPORT_KEY = 'section';

const SECTION_SUPPORTED_BLOCKS = [ 'core/group' ];

function hasSectionSupport( blockType ) {
	return !! getBlockSupport( blockType, SECTION_SUPPORT_KEY );
}

/**
 * Filters the registered block settings, extending attributes to include section.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
function addAttribute( settings ) {
	if ( ! hasSectionSupport( settings ) ) {
		return settings;
	}

	if ( ! settings.attributes.section ) {
		Object.assign( settings.attributes, { section: { type: 'number' } } );
	}

	return settings;
}

/**
 * Filters registered block settings to extend the block edit wrapper to apply
 * the section class name.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
function addEditProps( settings ) {
	if (
		! hasSectionSupport( settings ) ||
		! SECTION_SUPPORTED_BLOCKS.includes( settings.name )
	) {
		return settings;
	}

	const existingGetEditWrapperProps = settings.getEditWrapperProps;
	settings.getEditWrapperProps = ( attributes ) => {
		let props = {};

		if ( existingGetEditWrapperProps ) {
			props = existingGetEditWrapperProps( attributes );
		}

		// A render hook will handle class application on the PHP side
		if ( attributes.section === undefined ) {
			return props;
		}

		// TODO: Handle fallback logic if the current section index isn't available.
		const sectionClass = `wp-section-${ attributes.section }`;
		const newClassName = classnames( props.className, sectionClass );

		props.className = newClassName ? newClassName : undefined;

		return props;
	};

	return settings;
}

function SectionsSelector( { attributes, sections, setAttributes } ) {
	return (
		<div className="block-editor-sections">
			{ sections.map( ( section, index ) => (
				<Button
					__next40pxDefaultSize
					className={ classnames( 'block-editor-sections__item', {
						'is-active': attributes.section === index,
					} ) }
					key={ `section-${ index }` }
					variant="secondary"
					label={ section.title } // TODO: Make sure this is translatable in theme.json
					onClick={ () => setAttributes( { section: index } ) }
					aria-current={ attributes.section === index }
				>
					<Truncate
						numberOfLines={ 1 }
						className="block-editor-sections__item-text"
					>
						{ section.title }
					</Truncate>
				</Button>
			) ) }
		</div>
	);
}

function SectionPanel( props ) {
	const sections = useSelect( ( select ) => {
		return select( blockEditorStore ).getSettings().__experimentalStyles
			?.sections;
	} );

	// TODO: Add theme.json setting to disable section styling.

	if ( ! sections || ! hasSectionSupport( props.name ) ) {
		return null;
	}

	return (
		<InspectorControls group="section">
			<div>
				<PanelBody title={ __( 'Sections' ) }>
					<SectionsSelector { ...props } sections={ sections } />
				</PanelBody>
			</div>
		</InspectorControls>
	);
}

const withSectionControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! hasSectionSupport( props.name ) ) {
			return <BlockEdit key="edit" { ...props } />;
		}

		const shouldDisplayControls = useDisplayBlockControls();
		const blockEditingMode = useBlockEditingMode();

		return (
			<>
				{ shouldDisplayControls && blockEditingMode === 'default' && (
					<SectionPanel { ...props } />
				) }
				<BlockEdit key="edit" { ...props } />
			</>
		);
	},
	'withSectionControls'
);

addFilter(
	'blocks.registerBlockType',
	'core/section/addAttribute',
	addAttribute
);

addFilter(
	'blocks.registerBlockType',
	'core/section/addEditProps',
	addEditProps
);

addFilter(
	'editor.BlockEdit',
	'core/section/with-section-controls',
	withSectionControls
);
