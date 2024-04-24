/**
 * WordPress dependencies
 */
import { __, _x } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useBlockProps, BlockControls } from '@wordpress/block-editor';
import { __experimentalFetchUrlData } from '@wordpress/core-data';
import {
	Placeholder,
	Spinner,
	Button,
	ToolbarGroup,
	ToolbarButton,
	Notice,
} from '@wordpress/components';
import { link, edit } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { Content } from './content';

export default function LinkPreviewEdit( props ) {
	const { attributes, setAttributes } = props;
	const { url, title } = attributes;
	const [ isFetching, setIsFetching ] = useState( false );
	const [ isEditingUrl, setIsEditingUrl ] = useState( ! url );
	const [ urlValue, setURLValue ] = useState( url );
	const [ hasError, setHasError ] = useState( false );

	const blockProps = useBlockProps( {
		onClick: isEditingUrl
			? undefined
			: ( event ) => {
					event.preventDefault();
			  },
	} );

	useEffect( () => {
		if ( url && ! title ) {
			setIsFetching( true );
			__experimentalFetchUrlData( url )
				.catch( () => {
					setHasError( true );
				} )
				.then( ( data ) => {
					if ( ! data || ! data.title ) {
						setHasError( true );
					} else {
						setHasError( false );
						setIsEditingUrl( false );
						setAttributes( {
							title: data.title,
							icon: data.icon,
							image: data.image,
							description: data.description,
						} );
					}
				} )
				.finally( () => {
					setIsFetching( false );
				} );
		}
	}, [ url, title, setAttributes ] );

	if ( isEditingUrl || hasError ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ link }
					label={ __( 'URL' ) }
					instructions={ __(
						'Paste a link to the content you want to display on your site.'
					) }
				>
					{ hasError && (
						<Notice status="error" isDismissible={ false }>
							{ __( 'No data found for this URL.' ) }
						</Notice>
					) }
					<form
						onSubmit={ ( event ) => {
							event.preventDefault();
							setAttributes( {
								url: urlValue,
								title: '',
								icon: '',
								image: '',
								description: '',
							} );
						} }
					>
						<input
							type="url"
							value={ urlValue }
							className="components-placeholder__input"
							aria-label={ __( 'URL' ) }
							placeholder={ __( 'Enter URL to embed here…' ) }
							onChange={ ( event ) => {
								setURLValue( event.target.value );
							} }
						/>
						<Button variant="primary" type="submit">
							{ _x( 'Embed', 'button label' ) }
						</Button>
						{ isFetching && <Spinner /> }
					</form>
				</Placeholder>
			</div>
		);
	}

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						className="components-toolbar__control"
						label={ __( 'Edit URL' ) }
						icon={ edit }
						onClick={ () => {
							setIsEditingUrl( true );
							setURLValue( url );
						} }
					/>
				</ToolbarGroup>
			</BlockControls>
			<Content props={ blockProps } attributes={ attributes } />
		</>
	);
}
