/**
 * External dependencies
 */
import { map } from 'lodash';
import scrollView from 'dom-scroll-into-view';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';
import { withSafeTimeout } from '@wordpress/compose';

function SuggestionsList( {
	selectedIndex,
	scrollIntoView,
	match = '',
	onHover = () => {},
	onSelect = () => {},
	suggestions = Object.freeze( [] ),
	displayTransform,
	instanceId,
	setTimeout,
} ) {
	const [ scrollingIntoView, setScrollingIntoView ] = useState( true );
	const [ list, setList ] = useState();

	useEffect( () => {
		// only have to worry about scrolling selected suggestion into view
		// when already expanded
		if (
			selectedIndex > -1 &&
			scrollIntoView &&
			list.children[ selectedIndex ]
		) {
			setScrollingIntoView( true );
			scrollView( list.children[ selectedIndex ], list, {
				onlyScrollIfNeeded: true,
			} );

			setTimeout( () => {
				setScrollingIntoView( false );
			}, 100 );
		}
	}, [ selectedIndex, scrollIntoView, list ] );

	const bindList = ( ref ) => {
		setList( ref );
	};

	const handleHover = ( suggestion ) => {
		return () => {
			if ( ! scrollingIntoView ) {
				onHover( suggestion );
			}
		};
	};

	const handleClick = ( suggestion ) => {
		return () => {
			onSelect( suggestion );
		};
	};

	const handleMouseDown = ( e ) => {
		// By preventing default here, we will not lose focus of <input> when clicking a suggestion
		e.preventDefault();
	};

	const computeSuggestionMatch = ( suggestion ) => {
		const matchText = displayTransform( match || '' ).toLocaleLowerCase();
		if ( matchText.length === 0 ) {
			return null;
		}

		suggestion = displayTransform( suggestion );
		const indexOfMatch = suggestion
			.toLocaleLowerCase()
			.indexOf( matchText );

		return {
			suggestionBeforeMatch: suggestion.substring( 0, indexOfMatch ),
			suggestionMatch: suggestion.substring(
				indexOfMatch,
				indexOfMatch + matchText.length
			),
			suggestionAfterMatch: suggestion.substring(
				indexOfMatch + matchText.length
			),
		};
	};

	// We set `tabIndex` here because otherwise Firefox sets focus on this
	// div when tabbing off of the input in `TokenField` -- not really sure
	// why, since usually a div isn't focusable by default
	// TODO does this still apply now that it's a <ul> and not a <div>?
	return (
		<ul
			ref={ bindList }
			className="components-form-token-field__suggestions-list"
			id={ `components-form-token-suggestions-${ instanceId }` }
			role="listbox"
		>
			{ map( suggestions, ( suggestion, index ) => {
				const matchText = computeSuggestionMatch( suggestion );
				const classeName = classnames(
					'components-form-token-field__suggestion',
					{
						'is-selected': index === selectedIndex,
					}
				);

				/* eslint-disable jsx-a11y/click-events-have-key-events */
				return (
					<li
						id={ `components-form-token-suggestions-${ instanceId }-${ index }` }
						role="option"
						className={ classeName }
						key={
							suggestion?.value
								? suggestion.value
								: displayTransform( suggestion )
						}
						onMouseDown={ handleMouseDown }
						onClick={ handleClick( suggestion ) }
						onMouseEnter={ handleHover( suggestion ) }
						aria-selected={ index === selectedIndex }
					>
						{ matchText ? (
							<span aria-label={ displayTransform( suggestion ) }>
								{ matchText.suggestionBeforeMatch }
								<strong className="components-form-token-field__suggestion-match">
									{ matchText.suggestionMatch }
								</strong>
								{ matchText.suggestionAfterMatch }
							</span>
						) : (
							displayTransform( suggestion )
						) }
					</li>
				);
				/* eslint-enable jsx-a11y/click-events-have-key-events */
			} ) }
		</ul>
	);
}

export default withSafeTimeout( SuggestionsList );
