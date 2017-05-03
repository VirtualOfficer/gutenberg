/**
 * External dependencies
 */
import './style.scss';
import classnames from 'classnames';

function Button( { isPrimary, isLarge, isToggled, className, ...additionalProps } ) {
	const classes = classnames( 'editor-button', className, {
		button: ( isPrimary || isLarge ),
		'button-primary': isPrimary,
		'button-large': isLarge,
		'is-toggled': isToggled,
	} );

	return (
		<button
			type="button"
			{ ...additionalProps }
			className={ classes } />
	);
}

export default Button;
