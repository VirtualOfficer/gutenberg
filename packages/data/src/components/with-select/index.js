/**
 * WordPress dependencies
 */
import {
	Component,
	createElement,
	createHigherOrderComponent,
} from '@wordpress/element';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import { RegistryConsumer } from '../registry-provider';

/**
 * Higher-order component used to inject state-derived props using registered
 * selectors.
 *
 * @param {Function} mapStateToProps Function called on every state change,
 *                                   expected to return object of props to
 *                                   merge with the component's own props.
 *
 * @return {Component} Enhanced component with merged state data props.
 */
const withSelect = ( mapStateToProps ) => createHigherOrderComponent( ( WrappedComponent ) => {
	const DEFAULT_MERGE_PROPS = {};

	class ComponentWithSelect extends Component {
		constructor() {
			super( ...arguments );

			this.subscribe();

			this.state = {};
		}

		static getDerivedStateFromProps( props ) {
			// A constant value is used as the fallback since it can be more
			// efficiently shallow compared in case component is repeatedly
			// rendered without its own merge props.
			const mergeProps = (
				mapStateToProps( props.registry.select, props.ownProps ) ||
				DEFAULT_MERGE_PROPS
			);

			return { mergeProps };
		}

		componentDidMount() {
			this.canRunSelection = true;
		}

		componentWillUnmount() {
			this.canRunSelection = false;
			this.unsubscribe();
		}

		shouldComponentUpdate( nextProps, nextState ) {
			return (
				! isShallowEqual( this.props.ownProps, nextProps.ownProps ) ||
				! isShallowEqual( this.state.mergeProps, nextState.mergeProps )
			);
		}

		subscribe() {
			this.unsubscribe = this.props.registry.subscribe( () => {
				if ( ! this.canRunSelection ) {
					return;
				}

				// Trigger an update. Behavior of `getDerivedStateFromProps` as
				// of React 16.4.0 is such that it will be called by any update
				// to the component, including state changes.
				//
				// See: https://reactjs.org/blog/2018/05/23/react-v-16-4.html#bugfix-for-getderivedstatefromprops
				this.setState( () => ( {} ) );
			} );
		}

		render() {
			return <WrappedComponent { ...this.props.ownProps } { ...this.state.mergeProps } />;
		}
	}

	return ( ownProps ) => (
		<RegistryConsumer>
			{ ( registry ) => (
				<ComponentWithSelect
					ownProps={ ownProps }
					registry={ registry }
				/>
			) }
		</RegistryConsumer>
	);
}, 'withSelect' );

export default withSelect;
