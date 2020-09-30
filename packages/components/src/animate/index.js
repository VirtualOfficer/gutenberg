/**
 * External dependencies
 */
import { isFunction } from 'lodash';

/**
 * Internal dependencies
 */
import {
	AppearingWrapper,
	SlidingWrapper,
	LoadingWrapper,
} from './styles/animate-styles';

function Animate( { type, options = {}, children } ) {
	/**
	 * For backwards compatability we need to handle when
	 * children as a function is passed in. By passing an
	 * empty string for className we should prevent any
	 * conventional usage of this component from before the
	 * change from breaking.
	 */
	const safeChildren = isFunction( children )
		? () => children( { className: '' } )
		: () => children;

	if ( type === 'appear' ) {
		const { origin = 'top' } = options;
		const [ yAxis, xAxis = 'center' ] = origin.split( ' ' );

		return (
			<AppearingWrapper
				// @todo(saramarcondes) deprecate "middle"
				yAxis={ yAxis === 'middle' ? 'center' : yAxis }
				xAxis={ xAxis }
			>
				{ safeChildren() }
			</AppearingWrapper>
		);
	}

	if ( type === 'slide-in' ) {
		const { origin = 'left' } = options;

		return (
			<SlidingWrapper origin={ origin }>
				{ safeChildren() }
			</SlidingWrapper>
		);
	}

	if ( type === 'loading' ) {
		return <LoadingWrapper>{ safeChildren() }</LoadingWrapper>;
	}

	return safeChildren( {} );
}

export default Animate;
