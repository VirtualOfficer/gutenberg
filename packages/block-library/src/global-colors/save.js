/**
 * Internal dependencies
 */
import Markup from './components/markup';

export default function save( props ) {
	const { attributes: { globalColors } } = props;
	return <Markup colors={ globalColors } />;
}
