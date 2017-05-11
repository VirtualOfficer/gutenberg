/**
 * WordPress dependencies
 */
import { __ } from 'i18n';
import Button from 'components/button';
import Placeholder from 'components/placeholder';

/**
 * Internal dependencies
 */
import './style.scss';
import { registerBlock, query } from '../../api';
import Editable from '../../editable';

const { attr, children } = query;

registerBlock( 'core/embed', {
	title: __( 'Embed' ),

	icon: 'video-alt3',

	category: 'common',

	attributes: {
		url: attr( 'iframe', 'src' ),
		title: attr( 'iframe', 'title' ),
		caption: children( 'figcaption' )
	},

	edit( { attributes, setAttributes, focus, setFocus } ) {
		const { url, title, caption } = attributes;

		if ( ! url ) {
			return (
				<Placeholder icon="cloud" label={ __( 'Embed URL' ) } className="blocks-embed">
					<input type="url" className="placeholder__input" placeholder={ __( 'Enter URL to embed here...' ) } />
					<Button isLarge>
						{ __( 'Embed' ) }
					</Button>
				</Placeholder>
			);
		}

		return (
			<figure className="blocks-embed">
				<div className="iframe-overlay">
					<iframe src={ url } title={ title } />
				</div>
				{ ( caption && caption.length > 0 ) || !! focus ? (
					<Editable
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						focus={ focus }
						onFocus={ setFocus }
						onChange={ ( value ) => setAttributes( { caption: value } ) }
						inline
						inlineToolbar
					/>
				) : null }
			</figure>
		);
	},

	save( { attributes } ) {
		const { url, title, caption } = attributes;
		const iframe = <iframe src={ url } title={ title } />;

		if ( ! caption || ! caption.length ) {
			return iframe;
		}

		return (
			<figure>
				{ iframe }
				<figcaption>{ caption }</figcaption>
			</figure>
		);
	}
} );
