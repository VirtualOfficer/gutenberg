/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Icon, chevronRight } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../button';
import { MenuItemUI, BadgeUI } from './styles/navigation-styles';
import Text from '../text';

const NavigationMenuItem = ( props ) => {
	const {
		badge,
		children,
		hasChildren,
		href,
		id,
		isActive,
		LinkComponent,
		linkProps,
		onClick,
		setActiveLevelId,
		title,
	} = props;
	const classes = classnames( 'components-navigation__menu-item', {
		'is-active': isActive,
	} );

	const handleClick = () => {
		if ( children.length ) {
			setActiveLevelId( id );
			return;
		}
		if ( ! onClick ) {
			return;
		}
		onClick( props );
	};

	const LinkComponentTag = LinkComponent ? LinkComponent : Button;

	return (
		<MenuItemUI className={ classes }>
			<LinkComponentTag
				className={ classes }
				href={ ! children.length ? href : null }
				onClick={ handleClick }
				{ ...linkProps }
			>
				<Text
					className="components-navigation__menu-item-title"
					variant="body.small"
					as="span"
				>
					{ title }
				</Text>
				{ badge && (
					<BadgeUI className="components-navigation__menu-item-badge">
						{ badge }
					</BadgeUI>
				) }
				{ hasChildren ? <Icon icon={ chevronRight } /> : null }
			</LinkComponentTag>
		</MenuItemUI>
	);
};

export default NavigationMenuItem;
