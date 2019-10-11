/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { MediaUI } from './styles/card.styles';

export function Media( props ) {
	const { className, ...additionalProps } = props;

	const classes = classnames( 'components-card-media', className );

	return <MediaUI { ...additionalProps } className={ classes } />;
}

export default Media;
