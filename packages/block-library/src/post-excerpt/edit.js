/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import { useMemo, useEffect } from '@wordpress/element';
import {
	AlignmentToolbar,
	BlockControls,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function usePostContentExcerpt( wordCount, postId, postType ) {
	const [ , , { raw: rawPostContent } ] = useEntityProp(
		'postType',
		postType,
		'content',
		postId
	);
	return useMemo( () => {
		if ( ! rawPostContent ) {
			return '';
		}
		const excerptElement = document.createElement( 'div' );
		excerptElement.innerHTML = rawPostContent;
		const excerpt =
			excerptElement.textContent || excerptElement.innerText || '';
		return excerpt.trim().split( ' ', wordCount ).join( ' ' );
	}, [ rawPostContent, wordCount ] );
}

export default function PostExcerptEdit( {
	attributes: { align, wordCount, moreText, showMoreOnNewLine },
	setAttributes,
	isSelected,
	context: { postId, postType },
} ) {
	// Set the initial moreText based on local.
	useEffect( () => {
		if ( moreText === null || moreText === undefined ) {
			setAttributes( { moreText: __( 'Read more…' ) } );
		}
	}, [] );

	const [ excerpt, setExcerpt ] = useEntityProp(
		'postType',
		postType,
		'excerpt',
		postId
	);
	const postContentExcerpt = usePostContentExcerpt(
		wordCount,
		postId,
		postType
	);
	return (
		<>
			<BlockControls>
				<AlignmentToolbar
					value={ align }
					onChange={ ( newAlign ) =>
						setAttributes( { align: newAlign } )
					}
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Post Excerpt Settings' ) }>
					{ ! excerpt && (
						<RangeControl
							label={ __( 'Max words' ) }
							value={ wordCount }
							onChange={ ( newExcerptLength ) =>
								setAttributes( { wordCount: newExcerptLength } )
							}
							min={ 10 }
							max={ 100 }
						/>
					) }
					<ToggleControl
						label={ __( 'Show link on new line' ) }
						checked={ showMoreOnNewLine }
						onChange={ ( newShowMoreOnNewLine ) =>
							setAttributes( {
								showMoreOnNewLine: newShowMoreOnNewLine,
							} )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div
				className={ classnames( 'wp-block-post-excerpt', {
					[ `has-text-align-${ align }` ]: align,
				} ) }
			>
				<RichText
					className={
						! showMoreOnNewLine &&
						'wp-block-post-excerpt__excerpt is-inline'
					}
					placeholder={ postContentExcerpt }
					value={
						excerpt ||
						( isSelected
							? ''
							: postContentExcerpt ||
							  __( 'No post excerpt found' ) )
					}
					onChange={ setExcerpt }
					keepPlaceholderOnFocus
				/>
				{ ! showMoreOnNewLine && ' ' }
				{ showMoreOnNewLine ? (
					<p className="wp-block-post-excerpt__more-text">
						<RichText
							tagName="a"
							placeholder={ __( 'Read more…' ) }
							value={ moreText }
							onChange={ ( newMoreText ) =>
								setAttributes( { moreText: newMoreText } )
							}
						/>
					</p>
				) : (
					<RichText
						tagName="a"
						placeholder={ __( 'Read more…' ) }
						value={ moreText }
						onChange={ ( newMoreText ) =>
							setAttributes( { moreText: newMoreText } )
						}
					/>
				) }
			</div>
		</>
	);
}
