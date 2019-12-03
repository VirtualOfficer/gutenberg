export function generateFontSizes( fontSize = 16, typeScale = 1.25, fallbacks = {} ) {
	return {
		H1: fallbacks.H1 || Math.round( fontSize * Math.pow( typeScale, 5 ) ),
		H2: fallbacks.H2 || Math.round( fontSize * Math.pow( typeScale, 4 ) ),
		H3: fallbacks.H3 || Math.round( fontSize * Math.pow( typeScale, 3 ) ),
		H4: fallbacks.H4 || Math.round( fontSize * Math.pow( typeScale, 2 ) ),
		H5: fallbacks.H5 || Math.round( fontSize * Math.pow( typeScale, 1 ) ),
		H6: fallbacks.H6 || fontSize,
		Body: fallbacks.Body || fontSize,
	};
}
