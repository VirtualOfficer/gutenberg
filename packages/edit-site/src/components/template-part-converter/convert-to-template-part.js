/**
 * External dependencies
 */
import { kebabCase } from 'lodash';

/**
 * WordPress dependencies
 */
import { useDispatch } from '@wordpress/data';
import {
	BlockSettingsMenuControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	MenuItem,
	Icon,
	TextControl,
	BaseControl,
	Flex,
	FlexItem,
	FlexBlock,
	Button,
	Modal,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';

import { createBlock, serialize } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { store as coreStore } from '@wordpress/core-data';
import { store as noticesStore } from '@wordpress/notices';

export default function ConvertToTemplatePart( { clientIds, blocks } ) {
	const instanceId = useInstanceId( ConvertToTemplatePart );
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ title, setTitle ] = useState( '' );
	const { replaceBlocks } = useDispatch( blockEditorStore );
	const { saveEntityRecord } = useDispatch( coreStore );
	const { createSuccessNotice } = useDispatch( noticesStore );
	const [ area, setArea ] = useState( 'uncategorized' );

	const onConvert = async ( templatePartTitle ) => {
		const defaultTitle = __( 'Untitled Template Part' );
		const templatePart = await saveEntityRecord(
			'postType',
			'wp_template_part',
			{
				slug: kebabCase( templatePartTitle || defaultTitle ),
				title: templatePartTitle || defaultTitle,
				content: serialize( blocks ),
				area,
			}
		);
		replaceBlocks(
			clientIds,
			createBlock( 'core/template-part', {
				slug: templatePart.slug,
				theme: templatePart.theme,
			} )
		);
		createSuccessNotice( __( 'Template part created.' ), {
			type: 'snackbar',
		} );
	};

	return (
		<BlockSettingsMenuControls>
			{ ( { onClose } ) => (
				<>
					<MenuItem
						onClick={ () => {
							setIsModalOpen( true );
						} }
					>
						{ __( 'Make template part' ) }
					</MenuItem>
					{ isModalOpen && (
						<Modal
							title={ __( 'Create a template part' ) }
							closeLabel={ __( 'Close' ) }
							onRequestClose={ () => {
								setIsModalOpen( false );
								setTitle( '' );
							} }
							overlayClassName="edit-site-template-part-converter__modal"
						>
							<form
								onSubmit={ ( event ) => {
									event.preventDefault();
									onConvert( title );
									setIsModalOpen( false );
									setTitle( '' );
									onClose();
								} }
							>
								<TextControl
									label={ __( 'Name' ) }
									value={ title }
									onChange={ setTitle }
								/>
								<label
									className="edit-site-template-part-converter__area-control-label"
									htmlFor={ `edit-site-template-part-converter__area-control-${ instanceId }` }
								>
									{ __( 'Area' ) }
								</label>
								<BaseControl
									className="edit-site-template-part-converter__area-control"
									id={ `edit-site-template-part-converter__area-control-${ instanceId }` }
								>
									{ AREA_OPTIONS.map(
										( {
											icon,
											label,
											value,
											description,
										} ) => (
											<Button
												key={ label }
												onClick={ () =>
													setArea( value )
												}
												disabled={ area === value }
												className="edit-site-template-part-converter__area-button"
											>
												<Flex
													align="start"
													justify="start"
												>
													<FlexItem>
														<Icon icon={ icon } />
													</FlexItem>
													<FlexBlock>
														{ label }
														<div>
															{ description }
														</div>
													</FlexBlock>
													{ area === value && (
														<FlexItem>
															<Icon
																icon={ check }
															/>
														</FlexItem>
													) }
												</Flex>
											</Button>
										)
									) }
								</BaseControl>
								<Flex
									className="edit-site-template-part-converter__convert-modal-actions"
									justify="flex-end"
								>
									<FlexItem>
										<Button
											isSecondary
											onClick={ () => {
												setIsModalOpen( false );
												setTitle( '' );
											} }
										>
											{ __( 'Cancel' ) }
										</Button>
									</FlexItem>
									<FlexItem>
										<Button isPrimary type="submit">
											{ __( 'Create' ) }
										</Button>
									</FlexItem>
								</Flex>
							</form>
						</Modal>
					) }
				</>
			) }
		</BlockSettingsMenuControls>
	);
}

import { footer, header, layout, check } from '@wordpress/icons';
const AREA_OPTIONS = [
	{
		description: __(
			'General templates often perform a specific role like displaying post content, and are not tied to any particular area.'
		),
		icon: layout,
		label: __( 'General' ),
		value: 'uncategorized',
	},
	{
		description: __(
			'The Header template defines a page area that typically contains a title, logo, and main navigation.'
		),
		icon: header,
		label: __( 'Header' ),
		value: 'header',
	},
	{
		description: __(
			'The Footer template defines a page area that typically contains site credits, social links, or any other combination of blocks.'
		),
		icon: footer,
		label: __( 'Footer' ),
		value: 'footer',
	},
];
