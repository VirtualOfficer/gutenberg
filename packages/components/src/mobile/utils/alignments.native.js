export const WIDE_ALIGNMENTS = {
	alignments: {
		wide: 'wide',
		full: 'full',
	},
	innerContainers: [ 'core/group', 'core/columns', 'core/column' ],
	excludeBlocks: [ 'core/heading' ],
};

export const ALIGNMENT_BREAKPOINTS = {
	wide: 1024,
	large: 820,
	medium: 768,
	small: 680,
	mobile: 480,
};

export const isFullWidth = ( align ) =>
	align === WIDE_ALIGNMENTS.alignments.full;

export const isWideWidth = ( align ) =>
	align === WIDE_ALIGNMENTS.alignments.wide;
