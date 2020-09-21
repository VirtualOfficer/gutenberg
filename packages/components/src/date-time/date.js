/**
 * External dependencies
 */
import ReactDatePicker from 'react-datepicker';
import { format, setMonth, getMonth, getYear } from 'date-fns';

/**
 * WordPress dependencies
 */
import { Icon, Button } from '../';

/**
 * Module Constants
 */
const TIMEZONELESS_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
const isRTL = () => document.documentElement.dir === 'rtl';

const DatePickerHeader = ( { date, decreaseMonth, increaseMonth } ) => (
	<div className={ 'components-datetime__date-header' }>
		<Button
			className={ `components-datetime__date-header-month-button is-previous-month` }
			icon={ 'arrow-left-alt' }
			isSmall={ true }
			onClick={ increaseMonth }
		/>
		<div className={ 'components-datetime__date-header-month' }>
			<strong>{ format( date, 'MMMM YYYY' ) }</strong>
		</div>
		<Button
			className={ `components-datetime__date-header-month-button is-previous-month` }
			icon={ 'arrow-right-alt' }
			isSmall={ true }
			onClick={ decreaseMonth }
		/>
	</div>
);

const DatePicker = ( { onChange, currentDate, isInvalidDate } ) => {
	const selected = typeof currentDate === 'string' ? new Date( currentDate ) : currentDate;
	return (
		<ReactDatePicker
			calendarClassName={ 'components-datetime__date' }
			selected={ selected }
			onChange={ onChange }
			inline
			useWeekdaysShort={ true }
		/>
	);
};

/*
class DatePicker extends Component {
	constructor() {
		super( ...arguments );

		this.onChangeMoment = this.onChangeMoment.bind( this );
		this.nodeRef = createRef();
		this.keepFocusInside = this.keepFocusInside.bind( this );
		this.isDayHighlighted = this.isDayHighlighted.bind( this );
	}

	/*
	 * Todo: We should remove this function ASAP.
	 * It is kept because focus is lost when we click on the previous and next month buttons.
	 * This focus loss closes the date picker popover.
	 * Ideally we should add an upstream commit on react-dates to fix this issue.
	 *
	keepFocusInside( newMonthDate ) {
		// Trigger onMonthChange callback.
		if ( this.props.onMonthChange ) {
			this.props.onMonthChange( newMonthDate.toISOString() );
		}

		if ( ! this.nodeRef.current ) {
			return;
		}
		// If focus was lost.
		if (
			! document.activeElement ||
			! this.nodeRef.current.contains( document.activeElement )
		) {
			// Retrieve the focus region div.
			const focusRegion = this.nodeRef.current.querySelector(
				'.DayPicker_focusRegion'
			);
			if ( ! focusRegion ) {
				return;
			}
			// Keep the focus on focus region.
			focusRegion.focus();
		}
	}

	onChangeMoment( newDate ) {
		const { currentDate, onChange } = this.props;

		// If currentDate is null, use now as momentTime to designate hours, minutes, seconds.
		const momentDate = currentDate ? moment( currentDate ) : moment();
		const momentTime = {
			hours: momentDate.hours(),
			minutes: momentDate.minutes(),
			seconds: 0,
		};

		onChange( newDate.set( momentTime ).format( TIMEZONELESS_FORMAT ) );
	}

	/**
	 * Create a Moment object from a date string. With no currentDate supplied, default to a Moment
	 * object representing now. If a null value is passed, return a null value.
	 *
	 * @param {?string} currentDate Date representing the currently selected date or null to signify no selection.
	 * @return {?moment.Moment} Moment object for selected date or null.
	 *
	getMomentDate( currentDate ) {
		if ( null === currentDate ) {
			return null;
		}
		return currentDate ? moment( currentDate ) : moment();
	}

	isDayHighlighted( date ) {
		if ( this.props.onMonthPreviewed ) {
			this.props.onMonthPreviewed( date.toISOString() );
		}

		// Do not highlight when no events.
		if ( ! this.props.events?.length ) {
			return false;
		}

		// Compare date against highlighted events.
		return this.props.events.some( ( highlighted ) =>
			date.isSame( highlighted.date, 'day' )
		);
	}

	render() {
		const { currentDate, isInvalidDate, events } = this.props;
		const momentDate = this.getMomentDate( currentDate );
		const key = `datepicker-controller-${
			momentDate ? momentDate.format( 'MM-YYYY' ) : 'null'
		}${ events?.length ? '-events-' + events.length : '' }`;

		return (
			<div className="components-datetime__date" ref={ this.nodeRef }>
				<DayPickerSingleDateController
					date={ momentDate }
					daySize={ 30 }
					focused
					hideKeyboardShortcutsPanel
					// This is a hack to force the calendar to update on month or year change
					// https://github.com/airbnb/react-dates/issues/240#issuecomment-361776665
					key={ key }
					noBorder
					numberOfMonths={ 1 }
					onDateChange={ this.onChangeMoment }
					transitionDuration={ 0 }
					weekDayFormat="ddd"
					isRTL={ isRTL() }
					isOutsideRange={ ( date ) => {
						return isInvalidDate && isInvalidDate( date.toDate() );
					} }
					isDayHighlighted={ this.isDayHighlighted }
					onPrevMonthClick={ this.keepFocusInside }
					onNextMonthClick={ this.keepFocusInside }
				/>
			</div>
		);
	}
}
*/

export default DatePicker;

