/**
 * Internal dependencies
 */
import { tabThroughBlock } from './tab-through-block';
import { textContentAreasHaveFocus } from './text-content-areas-have-focus';

/**
 * Tabs through a content block with text content areas, such as a Heading, Quote, or Paragraph block. Asserts that the text content areas all receive focus.
 *
 * @param {string} blockType  The expected value of the data-type attribute of the block's external wrapper
 * @param {string} content The expected title of the block
 */

export async function tabThroughTextBlock( blockType, content ) {
	await tabThroughBlock( blockType );

	// Tab causes the block text content to receive focus
	await page.keyboard.press( 'Tab' );
	await textContentAreasHaveFocus( content );
}
