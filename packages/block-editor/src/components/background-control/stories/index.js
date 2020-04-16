/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __experimentalFlex as Flex } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BackgroundControl from '../index';

export default {
	title: 'BlockEditor/BackgroundControl',
	component: BackgroundControl,
};

const backgroundImageUrl =
	'https://images.unsplash.com/photo-1586912596375-159ba6f428af?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80';

const Demo = () => {
	const [ position, setPosition ] = useState( { x: '50%', y: '50%' } );
	const [ size, setSize ] = useState( 'cover' );
	const [ fixed, setFixed ] = useState( false );
	const [ color, setColor ] = useState( '#eee' );
	const handleOnPositionChange = ( next ) => setPosition( next );

	return (
		<Flex align="top" style={ { height: '100vh' } }>
			<Flex.Block style={ { overflowY: 'auto', maxHeight: '100vh' } }>
				<div style={ { height: 2000 } }>
					<div
						style={ {
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							height: 500,
							width: '100%',
							backgroundAttachment: fixed ? 'fixed' : null,
							backgroundImage: `url(${ backgroundImageUrl })`,
							backgroundRepeat: 'no-repeat',
							backgroundColor: color,
							backgroundPosition: `${ position.x } ${ position.y }`,
							backgroundSize: size,
							transition: `background 100ms linear`,
						} }
					>
						<div style={ { color: 'white' } }>
							<h1>Cover</h1>
						</div>
					</div>
				</div>
			</Flex.Block>
			<Flex.Item style={ { width: 320 } }>
				<BackgroundControl
					color={ color }
					fixed={ fixed }
					onFixedChange={ setFixed }
					onPositionChange={ handleOnPositionChange }
					onSizeChange={ setSize }
					onColorChange={ setColor }
					size={ size }
				/>
			</Flex.Item>
		</Flex>
	);
};

export const _default = () => {
	return <Demo />;
};
