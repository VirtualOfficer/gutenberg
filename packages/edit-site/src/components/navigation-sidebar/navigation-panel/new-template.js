/**
 * External dependencies
 */
import { map, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	NavigableMenu,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import getClosestAvailableTemplate from '../../../utils/get-closest-available-template';
import { TEMPLATES_DEFAULT_DETAILS } from '../../../utils/get-template-info/constants';

export default function NewTemplate() {
	const templates = useSelect(
		( select ) =>
			select( 'core' ).getEntityRecords( 'postType', 'wp_template', {
				status: [ 'publish', 'auto-draft' ],
				per_page: -1,
			} ),
		[]
	);
	const { addTemplate } = useDispatch( 'core/edit-site' );

	const createTemplate = ( slug ) => {
		const closestAvailableTemplate = getClosestAvailableTemplate(
			slug,
			templates
		);
		addTemplate( {
			content: closestAvailableTemplate.content.raw,
			slug,
			title: slug,
			status: 'draft',
		} );
	};

	const missingTemplates = omit(
		TEMPLATES_DEFAULT_DETAILS,
		map( templates, 'slug' )
	);

	return (
		<DropdownMenu
			icon={ plus }
			label={ __( 'Add Template' ) }
			popoverProps={ {
				className: 'edit-site-navigation-panel__new-template',
				noArrow: false,
			} }
			toggleProps={ { isSmall: true, isTertiary: true } }
		>
			{ ( { onClose } ) => (
				<NavigableMenu>
					<MenuGroup label={ __( 'Add Template' ) }>
						{ map(
							missingTemplates,
							( { title, description }, slug ) => (
								<MenuItem
									info={ description }
									key={ slug }
									onClick={ () => {
										createTemplate( slug );
										onClose();
									} }
								>
									{ title }
								</MenuItem>
							)
						) }
					</MenuGroup>
					<MenuGroup>
						<MenuItem
							info={ __( 'Custom template ' ) }
							onClick={ () => {
								addTemplate( {
									title: __( 'New Template' ),
									status: 'draft',
								} );
								onClose();
							} }
						>
							{ __( 'General' ) }
						</MenuItem>
					</MenuGroup>
				</NavigableMenu>
			) }
		</DropdownMenu>
	);
}
