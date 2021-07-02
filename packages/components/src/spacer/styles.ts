/**
 * External dependencies
 */
import styled from '@emotion/styled';
import { css } from '@emotion/react';
// eslint-disable-next-line no-restricted-imports
import type { CSSProperties } from 'react';

/**
 * Internal dependencies
 */
import type { InnerProps } from './types';
import { space } from '../ui/utils/space';

const isDefined = < T >( o: T ): o is Exclude< T, null | undefined > =>
	typeof o !== 'undefined' && o !== null;

const renderProperty = (
	name: keyof InnerProps,
	cssKeys: ( keyof CSSProperties )[] = [ name as keyof CSSProperties ]
) => ( props: InnerProps ) => {
	const value = props[ name ];

	if ( ! isDefined( value ) ) {
		return undefined;
	}

	const resolvedValue = space( value );
	return css(
		cssKeys.reduce(
			( acc, key ) => ( { ...acc, [ key ]: resolvedValue } ),
			{}
		)
	);
};

export const SpacerView = styled.div< InnerProps >`
	${ renderProperty( 'margin' ) }
	${ renderProperty( 'marginY', [ 'marginTop', 'marginBottom' ] ) }
	${ renderProperty( 'marginX', [ 'marginLeft', 'marginRight' ] ) }
	${ renderProperty( 'marginTop' ) }
	${ renderProperty( 'marginBottom' ) }
	${ renderProperty( 'marginLeft' ) }
	${ renderProperty( 'marginRight' ) }

	${ renderProperty( 'padding' ) }
	${ renderProperty( 'paddingY', [ 'paddingTop', 'paddingBottom' ] ) }
	${ renderProperty( 'paddingX', [ 'paddingLeft', 'paddingRight' ] ) }
	${ renderProperty( 'paddingTop' ) }
	${ renderProperty( 'paddingBottom' ) }
	${ renderProperty( 'paddingLeft' ) }
	${ renderProperty( 'paddingRight' ) }
`;
