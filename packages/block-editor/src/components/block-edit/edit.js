/**
 * External dependencies
 */
import classnames from 'classnames';
import { pick } from 'lodash';

/**
 * WordPress dependencies
 */
import { withFilters } from '@wordpress/components';
import {
	getBlockDefaultClassName,
	hasBlockSupport,
	getBlockType,
} from '@wordpress/blocks';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockContext from '../block-context';

/**
 * Default value used for blocks which do not define their own context needs,
 * used to guarantee that a block's `context` prop will always be an object. It
 * is assigned as a constant since it is always expected to be an empty object,
 * and in order to avoid unnecessary React reconciliations of a changing object.
 *
 * @type {{}}
 */
const DEFAULT_BLOCK_CONTEXT = {};

export const Edit = ( props ) => {
	const { attributes = {}, name } = props;
	const blockType = getBlockType( name );
	const blockContext = useContext( BlockContext );

	if ( ! blockType ) {
		return null;
	}

	// `edit` and `save` are functions or components describing the markup
	// with which a block is displayed. If `blockType` is valid, assign
	// them preferentially as the render value for the block.
	const Component = blockType.edit || blockType.save;
	const lightBlockWrapper = hasBlockSupport(
		blockType,
		'lightBlockWrapper',
		false
	);

	if ( lightBlockWrapper ) {
		return <Component { ...props } />;
	}

	// Generate a class name for the block's editable form
	const generatedClassName = hasBlockSupport( blockType, 'className', true )
		? getBlockDefaultClassName( name )
		: null;
	const className = classnames( generatedClassName, attributes.className );

	// Assign context values using the block type's declared context needs.
	const context = blockType.context
		? pick( blockContext, blockType.context )
		: DEFAULT_BLOCK_CONTEXT;

	return (
		<Component { ...props } context={ context } className={ className } />
	);
};

export default withFilters( 'editor.BlockEdit' )( Edit );
