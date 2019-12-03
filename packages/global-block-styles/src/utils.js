export function generateFontSizes( fontSize = 16, typeScale = 1.25 ) {
	return {
		h1: fontSize * Math.pow( typeScale, 5 ),
		h2: fontSize * Math.pow( typeScale, 4 ),
		h3: fontSize * Math.pow( typeScale, 3 ),
		h4: fontSize * Math.pow( typeScale, 2 ),
		h5: fontSize * Math.pow( typeScale, 1 ),
		h6: fontSize,
		body: fontSize,
	};
}
