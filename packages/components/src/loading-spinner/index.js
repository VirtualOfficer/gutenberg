/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import {
	SpinnerWrapper,
	SpinnerSVG,
	SpinnerCircle,
	defaultSpinnerColor,
} from './styles';

export default function LoadingSpinner( {
	className,
	color = defaultSpinnerColor,
	opacity = 1,
	size = 16,
	speed = 1400,
	...props
} ) {
	const classes = classnames( 'components-loading-spinner', className );

	const svgProps = {
		className: 'components-loading-spinner__svg',
		opacity,
		speed,
		size,
		viewBox: '22 22 44 44',
	};

	const circleProps = {
		className: 'components-loading-spinner__circle',
		color,
		cx: 44,
		cy: 44,
		r: 20.2,
		speed,
		size,
	};

	return (
		<SpinnerWrapper
			{ ...props }
			aria-busy={ true }
			className={ classes }
			size={ size }
		>
			<SpinnerSVG { ...svgProps }>
				<SpinnerCircle { ...circleProps } />
			</SpinnerSVG>
		</SpinnerWrapper>
	);
}
