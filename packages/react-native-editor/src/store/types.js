/**
 * @format
 * @flow
 */

export type BlockType = {
	clientId: string,
	name: string,
	isValid: boolean,
	attributes: Object,
	innerBlocks: Array<BlockType>,
};

export type StateType = {
	blocks: Array<BlockType>,
	initialHtmlHash: string,
	fullparse: boolean,
};
