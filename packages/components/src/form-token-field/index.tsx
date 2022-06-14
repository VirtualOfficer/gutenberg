/**
 * External dependencies
 */
import {
	last,
	clone,
	uniq,
	map,
	difference,
	each,
	identity,
	some,
} from 'lodash';
import classnames from 'classnames';
import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

/**
 * WordPress dependencies
 */
import { useEffect, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useDebounce, useInstanceId, usePrevious } from '@wordpress/compose';
import { speak } from '@wordpress/a11y';
import {
	BACKSPACE,
	ENTER,
	UP,
	DOWN,
	LEFT,
	RIGHT,
	SPACE,
	DELETE,
	ESCAPE,
} from '@wordpress/keycodes';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import Token from './token';
import TokenInput from './token-input';
import SuggestionsList from './suggestions-list';
import type { FormTokenFieldProps, TokenItem } from './types';

/**
 * A `FormTokenField` is a field similar to the tags and categories fields in the interim editor chrome,
 * or the "to" field in Mail on OS X. Tokens can be entered by typing them or selecting them from a list of suggested tokens.
 *
 * Up to one hundred suggestions that match what the user has typed so far will be shown from which the user can pick from (auto-complete).
 * Tokens are separated by the "," character. Suggestions can be selected with the up or down arrows and added with the tab or enter key.
 *
 * The `value` property is handled in a manner similar to controlled form components.
 * See [Forms](http://facebook.github.io/react/docs/forms.html) in the React Documentation for more information.
 */
export function FormTokenField( props: FormTokenFieldProps ) {
	const {
		autoCapitalize,
		autoComplete,
		maxLength,
		placeholder,
		label = __( 'Add item' ),
		className,
		suggestions = [],
		maxSuggestions = 100,
		value = [],
		displayTransform = identity,
		saveTransform = ( token ) => token.trim(),
		onChange = () => {},
		onInputChange = () => {},
		onFocus = undefined,
		isBorderless = false,
		disabled = false,
		tokenizeOnSpace = false,
		messages = {
			added: __( 'Item added.' ),
			removed: __( 'Item removed.' ),
			remove: __( 'Remove item' ),
			__experimentalInvalid: __( 'Invalid item' ),
		},
		__experimentalExpandOnFocus = false,
		__experimentalValidateInput = () => true,
		__experimentalShowHowTo = true,
	} = props;

	const instanceId = useInstanceId( FormTokenField );

	// We reset to these initial values again in the onBlur
	const [ incompleteTokenValue, setIncompleteTokenValue ] = useState( '' );
	const [ inputOffsetFromEnd, setInputOffsetFromEnd ] = useState( 0 );
	const [ isActive, setIsActive ] = useState( false );
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ selectedSuggestionIndex, setSelectedSuggestionIndex ] =
		useState( -1 );
	const [ selectedSuggestionScroll, setSelectedSuggestionScroll ] =
		useState( false );

	const prevSuggestions = usePrevious< string[] >( suggestions );
	const prevValue = usePrevious< ( string | TokenItem )[] >( value );

	const input = useRef< HTMLInputElement >( null );
	const tokensAndInput = useRef< HTMLInputElement >( null );

	const debouncedSpeak = useDebounce( speak, 500 );

	useEffect( () => {
		// Make sure to focus the input when the isActive state is true.
		if ( isActive && ! hasFocus() ) {
			focus();
		}
	}, [ isActive ] );

	useEffect( () => {
		const suggestionsDidUpdate = ! isShallowEqual(
			suggestions,
			prevSuggestions || []
		);

		if ( suggestionsDidUpdate || value !== prevValue ) {
			updateSuggestions( suggestionsDidUpdate );
		}

		// TODO: updateSuggestions() should first be refactored so its actual deps are clearer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ suggestions, prevSuggestions, value, prevValue ] );

	useEffect( () => {
		updateSuggestions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ incompleteTokenValue ] );

	if ( disabled && isActive ) {
		setIsActive( false );
		setIncompleteTokenValue( '' );
	}

	function focus() {
		input.current?.focus();
	}

	function hasFocus() {
		return input.current === input.current?.ownerDocument.activeElement;
	}

	function onFocusHandler( event: FocusEvent ) {
		// If focus is on the input or on the container, set the isActive state to true.
		if ( hasFocus() || event.target === tokensAndInput.current ) {
			setIsActive( true );
			setIsExpanded( __experimentalExpandOnFocus || isExpanded );
		} else {
			/*
			 * Otherwise, focus is on one of the token "remove" buttons and we
			 * set the isActive state to false to prevent the input to be
			 * re-focused, see componentDidUpdate().
			 */
			setIsActive( false );
		}

		if ( 'function' === typeof onFocus ) {
			onFocus( event );
		}
	}

	function onBlur() {
		if ( inputHasValidValue() ) {
			setIsActive( false );
		} else {
			// Reset to initial state
			setIncompleteTokenValue( '' );
			setInputOffsetFromEnd( 0 );
			setIsActive( false );
			setIsExpanded( false );
			setSelectedSuggestionIndex( -1 );
			setSelectedSuggestionScroll( false );
		}
	}

	function onKeyDown( event: KeyboardEvent ) {
		let preventDefault = false;

		if ( event.defaultPrevented ) {
			return;
		}
		// TODO: replace to event.code;
		switch ( event.keyCode ) {
			case BACKSPACE:
				preventDefault = handleDeleteKey( deleteTokenBeforeInput );
				break;
			case ENTER:
				preventDefault = addCurrentToken();
				break;
			case LEFT:
				preventDefault = handleLeftArrowKey();
				break;
			case UP:
				preventDefault = handleUpArrowKey();
				break;
			case RIGHT:
				preventDefault = handleRightArrowKey();
				break;
			case DOWN:
				preventDefault = handleDownArrowKey();
				break;
			case DELETE:
				preventDefault = handleDeleteKey( deleteTokenAfterInput );
				break;
			case SPACE:
				if ( tokenizeOnSpace ) {
					preventDefault = addCurrentToken();
				}
				break;
			case ESCAPE:
				preventDefault = handleEscapeKey( event );
				break;
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	}

	function onKeyPress( event: KeyboardEvent ) {
		let preventDefault = false;
		// TODO: replace to event.code;
		switch ( event.charCode ) {
			case 44: // Comma.
				preventDefault = handleCommaKey();
				break;
			default:
				break;
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	}

	function onContainerTouched( event: MouseEvent | TouchEvent ) {
		// Prevent clicking/touching the tokensAndInput container from blurring
		// the input and adding the current token.
		if ( event.target === tokensAndInput.current && isActive ) {
			event.preventDefault();
		}
	}

	function onTokenClickRemove( event: { value: string } ) {
		deleteToken( event.value );
		focus();
	}

	function onSuggestionHovered( suggestion: string ) {
		const index = getMatchingSuggestions().indexOf( suggestion );

		if ( index >= 0 ) {
			setSelectedSuggestionIndex( index );
			setSelectedSuggestionScroll( false );
		}
	}

	function onSuggestionSelected( suggestion: string ) {
		addNewToken( suggestion );
	}

	function onInputChangeHandler( event: { value: string } ) {
		const text = event.value;
		const separator = tokenizeOnSpace ? /[ ,\t]+/ : /[,\t]+/;
		const items = text.split( separator );
		const tokenValue = last( items ) || '';

		if ( items.length > 1 ) {
			addNewTokens( items.slice( 0, -1 ) );
		}
		setIncompleteTokenValue( tokenValue );
		onInputChange( tokenValue );
	}

	function handleDeleteKey( _deleteToken: () => void ) {
		let preventDefault = false;
		if ( hasFocus() && isInputEmpty() ) {
			_deleteToken();
			preventDefault = true;
		}

		return preventDefault;
	}

	function handleLeftArrowKey() {
		let preventDefault = false;
		if ( isInputEmpty() ) {
			moveInputBeforePreviousToken();
			preventDefault = true;
		}

		return preventDefault;
	}

	function handleRightArrowKey() {
		let preventDefault = false;
		if ( isInputEmpty() ) {
			moveInputAfterNextToken();
			preventDefault = true;
		}

		return preventDefault;
	}

	function handleUpArrowKey() {
		setSelectedSuggestionIndex( ( index ) => {
			return (
				( index === 0
					? getMatchingSuggestions(
							incompleteTokenValue,
							suggestions,
							value,
							maxSuggestions,
							saveTransform
					  ).length
					: index ) - 1
			);
		} );
		setSelectedSuggestionScroll( true );

		return true; // PreventDefault.
	}

	function handleDownArrowKey() {
		setSelectedSuggestionIndex( ( index ) => {
			return (
				( index + 1 ) %
				getMatchingSuggestions(
					incompleteTokenValue,
					suggestions,
					value,
					maxSuggestions,
					saveTransform
				).length
			);
		} );

		setSelectedSuggestionScroll( true );
		return true; // PreventDefault.
	}

	function handleEscapeKey( event: KeyboardEvent ) {
		if ( event.target instanceof HTMLInputElement ) {
			setIncompleteTokenValue( event.target.value );
			setIsExpanded( false );
			setSelectedSuggestionIndex( -1 );
			setSelectedSuggestionScroll( false );
		}

		return true; // PreventDefault.
	}

	function handleCommaKey() {
		if ( inputHasValidValue() ) {
			addNewToken( incompleteTokenValue );
		}

		return true; // PreventDefault.
	}

	function moveInputToIndex( index: number ) {
		setInputOffsetFromEnd( value.length - Math.max( index, -1 ) - 1 );
	}

	function moveInputBeforePreviousToken() {
		setInputOffsetFromEnd( ( prevInputOffsetFromEnd ) => {
			return Math.min( prevInputOffsetFromEnd + 1, value.length );
		} );
	}

	function moveInputAfterNextToken() {
		setInputOffsetFromEnd( ( prevInputOffsetFromEnd ) => {
			return Math.max( prevInputOffsetFromEnd - 1, 0 );
		} );
	}

	function deleteTokenBeforeInput() {
		const index = getIndexOfInput() - 1;

		if ( index > -1 ) {
			deleteToken( value[ index ] );
		}
	}

	function deleteTokenAfterInput() {
		const index = getIndexOfInput();

		if ( index < value.length ) {
			deleteToken( value[ index ] );
			// Update input offset since it's the offset from the last token.
			moveInputToIndex( index );
		}
	}

	function addCurrentToken() {
		let preventDefault = false;
		const selectedSuggestion = getSelectedSuggestion();

		if ( selectedSuggestion ) {
			addNewToken( selectedSuggestion );
			preventDefault = true;
		} else if ( inputHasValidValue() ) {
			addNewToken( incompleteTokenValue );
			preventDefault = true;
		}

		return preventDefault;
	}

	function addNewTokens( tokens: string[] ) {
		const tokensToAdd = uniq(
			tokens
				.map( saveTransform )
				.filter( Boolean )
				.filter( ( token ) => ! valueContainsToken( token ) )
		);

		if ( tokensToAdd.length > 0 ) {
			const newValue = clone( value );
			newValue.splice( getIndexOfInput(), 0, ...tokensToAdd );
			onChange( newValue );
		}
	}

	function addNewToken( token: string ) {
		if ( ! __experimentalValidateInput( token ) ) {
			speak( messages.__experimentalInvalid, 'assertive' );
			return;
		}
		addNewTokens( [ token ] );
		speak( messages.added, 'assertive' );

		setIncompleteTokenValue( '' );
		setSelectedSuggestionIndex( -1 );
		setSelectedSuggestionScroll( false );
		setIsExpanded( ! __experimentalExpandOnFocus );

		if ( isActive ) {
			focus();
		}
	}

	function deleteToken( token: string | TokenItem ) {
		const newTokens = value.filter( ( item ) => {
			return getTokenValue( item ) !== getTokenValue( token );
		} );
		onChange( newTokens );
		speak( messages.removed, 'assertive' );
	}

	function getTokenValue( token: { value: string } | string ) {
		if ( 'object' === typeof token ) {
			return token.value;
		}

		return token;
	}

	function getMatchingSuggestions(
		searchValue = incompleteTokenValue,
		_suggestions = suggestions,
		_value = value,
		_maxSuggestions = maxSuggestions,
		_saveTransform = saveTransform
	) {
		let match = _saveTransform( searchValue );
		const startsWithMatch: string[] = [];
		const containsMatch: string[] = [];
		const normalizedValue = _value.map( ( item ) => {
			if ( typeof item === 'string' ) {
				return item;
			}
			return item.value;
		} );

		if ( match.length === 0 ) {
			_suggestions = difference( _suggestions, normalizedValue );
		} else {
			match = match.toLocaleLowerCase();

			each( _suggestions, ( suggestion ) => {
				const index = suggestion.toLocaleLowerCase().indexOf( match );
				if ( normalizedValue.indexOf( suggestion ) === -1 ) {
					if ( index === 0 ) {
						startsWithMatch.push( suggestion );
					} else if ( index > 0 ) {
						containsMatch.push( suggestion );
					}
				}
			} );

			_suggestions = startsWithMatch.concat( containsMatch );
		}

		return _suggestions.slice( 0, _maxSuggestions );
	}

	function getSelectedSuggestion() {
		if ( selectedSuggestionIndex !== -1 ) {
			return getMatchingSuggestions()[ selectedSuggestionIndex ];
		}

		return undefined;
	}

	function valueContainsToken( token: string ) {
		return some( value, ( item ) => {
			return getTokenValue( token ) === getTokenValue( item );
		} );
	}

	function getIndexOfInput() {
		return value.length - inputOffsetFromEnd;
	}

	function isInputEmpty() {
		return incompleteTokenValue.length === 0;
	}

	function inputHasValidValue() {
		return saveTransform( incompleteTokenValue ).length > 0;
	}

	function updateSuggestions( resetSelectedSuggestion = true ) {
		const inputHasMinimumChars = incompleteTokenValue.trim().length > 1;
		const matchingSuggestions =
			getMatchingSuggestions( incompleteTokenValue );
		const hasMatchingSuggestions = matchingSuggestions.length > 0;

		setIsExpanded(
			__experimentalExpandOnFocus ||
				( inputHasMinimumChars && hasMatchingSuggestions )
		);

		if ( resetSelectedSuggestion ) {
			setSelectedSuggestionIndex( -1 );
			setSelectedSuggestionScroll( false );
		}

		if ( inputHasMinimumChars ) {
			const message = hasMatchingSuggestions
				? sprintf(
						/* translators: %d: number of results. */
						_n(
							'%d result found, use up and down arrow keys to navigate.',
							'%d results found, use up and down arrow keys to navigate.',
							matchingSuggestions.length
						),
						matchingSuggestions.length
				  )
				: __( 'No results.' );

			debouncedSpeak( message, 'assertive' );
		}
	}

	function renderTokensAndInput() {
		const components = map( value, renderToken );
		components.splice( getIndexOfInput(), 0, renderInput() );

		return components;
	}

	function renderToken(
		token: string | TokenItem,
		index: number,
		tokens: ( string | TokenItem )[]
	) {
		const _value = getTokenValue( token );
		const status = typeof token !== 'string' ? token.status : undefined;
		const termPosition = index + 1;
		const termsCount = tokens.length;

		return (
			<Token
				key={ 'token-' + _value }
				value={ _value }
				status={ status }
				title={ typeof token !== 'string' ? token.title : undefined }
				displayTransform={ displayTransform }
				onClickRemove={ onTokenClickRemove }
				isBorderless={
					( typeof token !== 'string' && token.isBorderless ) ||
					isBorderless
				}
				onMouseEnter={
					typeof token !== 'string' ? token.onMouseEnter : undefined
				}
				onMouseLeave={
					typeof token !== 'string' ? token.onMouseLeave : undefined
				}
				disabled={ 'error' !== status && disabled }
				messages={ messages }
				termsCount={ termsCount }
				termPosition={ termPosition }
			/>
		);
	}

	function renderInput() {
		const inputProps = {
			instanceId,
			autoCapitalize,
			autoComplete,
			placeholder: value.length === 0 ? placeholder : '',
			key: 'input',
			disabled,
			value: incompleteTokenValue,
			onBlur,
			isExpanded,
			selectedSuggestionIndex,
		};

		return (
			<TokenInput
				{ ...inputProps }
				onChange={
					! ( maxLength && value.length >= maxLength )
						? onInputChangeHandler
						: undefined
				}
				ref={ input }
			/>
		);
	}

	const classes = classnames(
		className,
		'components-form-token-field__input-container',
		{
			'is-active': isActive,
			'is-disabled': disabled,
		}
	);

	let tokenFieldProps = {
		className: 'components-form-token-field',
		tabIndex: -1,
	};
	const matchingSuggestions = getMatchingSuggestions();

	if ( ! disabled ) {
		tokenFieldProps = Object.assign( {}, tokenFieldProps, {
			onKeyDown,
			onKeyPress,
			onFocus: onFocusHandler,
		} );
	}

	// Disable reason: There is no appropriate role which describes the
	// input container intended accessible usability.
	// TODO: Refactor click detection to use blur to stop propagation.
	/* eslint-disable jsx-a11y/no-static-element-interactions */
	return (
		<div { ...tokenFieldProps }>
			<label
				htmlFor={ `components-form-token-input-${ instanceId }` }
				className="components-form-token-field__label"
			>
				{ label }
			</label>
			<div
				ref={ tokensAndInput }
				className={ classes }
				tabIndex={ -1 }
				onMouseDown={ onContainerTouched }
				onTouchStart={ onContainerTouched }
			>
				{ renderTokensAndInput() }
				{ isExpanded && (
					<SuggestionsList
						instanceId={ instanceId }
						match={ saveTransform( incompleteTokenValue ) }
						displayTransform={ displayTransform }
						suggestions={ matchingSuggestions }
						selectedIndex={ selectedSuggestionIndex }
						scrollIntoView={ selectedSuggestionScroll }
						onHover={ onSuggestionHovered }
						onSelect={ onSuggestionSelected }
					/>
				) }
			</div>
			{ __experimentalShowHowTo && (
				<p
					id={ `components-form-token-suggestions-howto-${ instanceId }` }
					className="components-form-token-field__help"
				>
					{ tokenizeOnSpace
						? __(
								'Separate with commas, spaces, or the Enter key.'
						  )
						: __( 'Separate with commas or the Enter key.' ) }
				</p>
			) }
		</div>
	);
	/* eslint-enable jsx-a11y/no-static-element-interactions */
}

export default FormTokenField;
