/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Internal Dependencies
 */
import { getNextStory, getPreviousStory } from '../config';
import markdown from '../markdown';
import Tabs from './Tabs';

function MarkdownContent( { content } ) {
	const blocks = markdown( content );

	return (
		<div>
			{ blocks.map( ( block, index ) => {
				if ( block.type === 'raw' ) {
					return <div key={ index } dangerouslySetInnerHTML={ { __html: block.content } } />;
				}
				if ( block.type === 'codetabs' ) {
					return <Tabs key={ index } tabs={ block.tabs } />;
				}

				return null;
			} ) }
		</div>
	);
}

class Page extends Component {
	componentDidMount() {
		window.scrollTo( 0, 0 );
	}

	render() {
		const { story } = this.props;
		const nextStory = getNextStory( story.id );
		const previousStory = getPreviousStory( story.id );

		return (
			<div>
				{ !! story.Component && <story.Component /> }
				{ !! story.markdown && <MarkdownContent content={ story.markdown } /> }

				<div className="navigation">
					{ !! previousStory && (
						<p className="nav-older" rel="previous">
							<Link to={ previousStory.path }>{ '←' } { previousStory.title }</Link>
						</p>
					) }
					{ !! nextStory && (
						<p className="nav-newer" rel="next">
							<Link to={ nextStory.path }>{ nextStory.title } { '→' }</Link>
						</p>
					) }
				</div>
			</div>
		);
	}
}

export default Page;
