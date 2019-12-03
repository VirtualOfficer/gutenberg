/**
 * External dependencies
 */
import { uniqBy } from 'lodash';

function mergeColorSets( a, b ) {
	return uniqBy( [ ...b, ...a ], 'slug' );
}

export default function withColorOverrides( WrappedComponent ) {
	return ( props ) => {
		const { colors: baseColors = [], attributes: { globalColors = [] } } = props;
		const mergedColors = mergeColorSets( baseColors, globalColors );

		return <WrappedComponent { ...props } colors={ mergedColors } />;
	};
}
