/**
 * WordPress dependencies
 */
import { Button, SearchControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function PatternCategoriesList( {
	selectedCategory,
	patternCategories,
	onClickCategory,
} ) {
	const baseClassName = 'block-editor-block-patterns-explorer__sidebar';
	return (
		<div className={ `${ baseClassName }__categories-list` }>
			{ patternCategories.map( ( patternCategory ) => {
				const { name, label } = patternCategory;
				return (
					<Button
						key={ name }
						label={ label }
						className={ `${ baseClassName }__categories-list__item` }
						isPressed={ selectedCategory.name === name }
						onClick={ () => {
							onClickCategory( patternCategory );
						} }
					>
						{ label }
					</Button>
				);
			} ) }
		</div>
	);
}

function PatternsExplorerSearch( { filterValue, setFilterValue } ) {
	const baseClassName = 'block-editor-block-patterns-explorer__search';
	return (
		<div className={ baseClassName }>
			<SearchControl
				// className="block-editor-inserter__search"
				onChange={ setFilterValue }
				value={ filterValue }
				label={ __( 'Search for patterns' ) }
				placeholder={ __( 'Search' ) }
			/>
		</div>
	);
}

function PatternExplorerSidebar( {
	selectedCategory,
	patternCategories,
	onClickCategory,
	filterValue,
	setFilterValue,
} ) {
	const baseClassName = 'block-editor-block-patterns-explorer__sidebar';
	return (
		<div className={ baseClassName }>
			<PatternsExplorerSearch
				filterValue={ filterValue }
				setFilterValue={ setFilterValue }
			/>
			{ ! filterValue && (
				<PatternCategoriesList
					selectedCategory={ selectedCategory }
					patternCategories={ patternCategories }
					onClickCategory={ onClickCategory }
				/>
			) }
		</div>
	);
}

export default PatternExplorerSidebar;
