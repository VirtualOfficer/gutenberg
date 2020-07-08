/**
 * External dependencies
 */
import moment from 'moment';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { __experimentalGetSettings as getDateSettings } from '@wordpress/date';

/**
 * Internal dependencies
 */
import Tooltip from '../tooltip';

const TimeZone = () => {
	const { timezone } = getDateSettings();
	const offset =
		timezone.offset > 0 ? '+' + timezone.offset : timezone.offset;
	const zoneAbbr = moment.tz( new Date(), timezone.string ).zoneAbbr();
	const timezoneDetail =
		'UTC' === timezone.string
			? __( 'Coordinated Universal Time' )
			: '(UTC' + offset + ') ' + timezone.string.replace( '_', ' ' );
	const timezoneAbbr =
		'' !== timezone.string && isNaN( zoneAbbr ) ? zoneAbbr : 'UTC' + offset;

	return (
		<Tooltip position="top center" text={ timezoneDetail }>
			<div className="components-datetime__timezone">
				{ timezoneAbbr }
			</div>
		</Tooltip>
	);
};

export default TimeZone;
