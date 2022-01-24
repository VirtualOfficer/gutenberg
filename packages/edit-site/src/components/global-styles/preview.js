/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	__unstableIframe as Iframe,
	__unstableEditorStyles as EditorStyles,
} from '@wordpress/block-editor';
import { Card } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useStyle } from './hooks';
import { useGlobalStylesOutput } from './use-global-styles-output';

const StylesPreview = ( { height = 150, ...props } ) => {
	const [ fontFamily = 'serif' ] = useStyle( 'typography.fontFamily' );
	const [ textColor = 'black' ] = useStyle( 'color.text' );
	const [ linkColor = 'blue' ] = useStyle( 'elements.link.color.text' );
	const [ backgroundColor = 'white' ] = useStyle( 'color.background' );
	const [ gradientValue ] = useStyle( 'color.gradient' );
	const [ styles ] = useGlobalStylesOutput();

	return (
		<Card
			{ ...props }
			style={ {
				height,
				...props.style,
			} }
			className={ classnames(
				'edit-site-global-styles-preview',
				props.className
			) }
		>
			<Iframe
				className="edit-site-global-styles-preview__iframe"
				head={ <EditorStyles styles={ styles } /> }
				style={ { height } }
			>
				<div
					style={ {
						display: 'flex',
						gap: 20,
						alignItems: 'center',
						justifyContent: 'center',
						height: '100%',
						transform: `scale(${ height / 150 })`,
						background: gradientValue ?? backgroundColor,
						cursor: 'pointer',
					} }
				>
					<div style={ { fontFamily, fontSize: '80px' } }>Aa</div>
					<div
						style={ {
							display: 'flex',
							gap: 20,
							flexDirection: 'column',
						} }
					>
						<div
							style={ {
								height: 40,
								width: 40,
								background: textColor,
								borderRadius: 20,
							} }
						/>{ ' ' }
						<div
							style={ {
								height: 40,
								width: 40,
								background: linkColor,
								borderRadius: 20,
							} }
						/>
					</div>
				</div>
			</Iframe>
		</Card>
	);
};

export default StylesPreview;
