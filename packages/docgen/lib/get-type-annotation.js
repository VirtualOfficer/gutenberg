/**
 * External dependencies
 */
const { types: babelTypes } = require( '@babel/core' );

/* eslint-disable jsdoc/valid-types */
/** @typedef {ReturnType<import('comment-parser').parse>[0]} CommentBlock */
/** @typedef {CommentBlock['tags'][0]} CommentTag */
/** @typedef {babelTypes.TSType} TypeAnnotation  */

/**
 * @param {babelTypes.TSCallSignatureDeclaration | babelTypes.TSFunctionType} typeAnnotation
 * @param {' => ' | ': '} returnIndicator The return indicator to use. Allows using the same function for function annotations and object call properties.
 */
function getFunctionTypeAnnotation( typeAnnotation, returnIndicator ) {
	const params = typeAnnotation.parameters
		.map(
			( p ) => `${ p.name }: ${ getTypeAnnotation( p.typeAnnotation ) }`
		)
		.join( ', ' );
	const returnType = getTypeAnnotation( typeAnnotation.returnType );
	return `( ${ params } )${ returnIndicator }${ returnType }`;
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralCallSignatureDeclarationTypeAnnotations(
	typeAnnotation
) {
	const callProperties = typeAnnotation.members
		.filter( ( m ) => babelTypes.isTSCallSignatureDeclaration( m ) )
		.map( ( callProperty ) => {
			return getFunctionTypeAnnotation( callProperty, ': ' );
		} );

	if ( callProperties.length ) {
		return `${ callProperties.join( '; ' ) } `;
	}
	return '';
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralIndexSignatureTypeAnnotations( typeAnnotation ) {
	const indexers = typeAnnotation.members
		.map( ( m ) => babelTypes.isTSIndexSignature( m ) )
		.map( ( indexer ) => {
			const parameter = indexer.parameters[ 0 ];
			return `[ ${ parameter.name }: ${ getTypeAnnotation(
				parameter.typeAnnotation
			) } ]: ${ getTypeAnnotation( indexer.typeAnnotation ) }`;
		} );

	if ( indexers.length ) {
		return `${ indexers.join( '; ' ) } `;
	}
	return '';
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralPropertyTypeAnnotations( typeAnnotation ) {
	const properties = typeAnnotation.members
		.filter( ( m ) => babelTypes.isTSPropertySignature( m ) )
		.map( ( prop ) => {
			return `${ prop.key.name }: ${ getTypeAnnotation(
				prop.typeAnnotation
			) }`;
		} );

	if ( properties.length ) {
		return `${ properties.join( '; ' ) } `;
	}
	return '';
}

/**
 * @param {babelTypes.TSTypeLiteral} typeAnnotation
 */
function getTypeLiteralTypeAnnotation( typeAnnotation ) {
	const callProperties = getTypeLiteralCallSignatureDeclarationTypeAnnotations(
		typeAnnotation
	);
	const indexers = getTypeLiteralIndexSignatureTypeAnnotations(
		typeAnnotation
	);
	const properties = getTypeLiteralPropertyTypeAnnotations( typeAnnotation );

	return `{ ${ callProperties }${ indexers }${ properties }}`;
}

/**
 * @param {babelTypes.TSUnionType} typeAnnotation
 */
function getUnionTypeAnnotation( typeAnnotation ) {
	return typeAnnotation.types.map( getTypeAnnotation ).join( ' | ' );
}

/**
 * @param {babelTypes.TSIntersectionType} typeAnnotation
 */
function getIntersectionTypeAnnotation( typeAnnotation ) {
	return typeAnnotation.types.map( getTypeAnnotation ).join( ' & ' );
}

/**
 * @param {babelTypes.TSArrayType} typeAnnotation
 * @return {string} The type annotation
 */
function getArrayTypeAnnotation( typeAnnotation ) {
	return `${ getTypeAnnotation( typeAnnotation ) }[]`;
}

/**
 * @param {babelTypes.TSTupleType} typeAnnotation
 */
function getTupleTypeAnnotation( typeAnnotation ) {
	const types = typeAnnotation.elementTypes
		.map( getTypeAnnotation )
		.join( ', ' );
	if ( types.length ) {
		return `[ ${ types.join( ', ' ) } ]`;
	}
	return '[]';
}

/**
 * @param {babelTypes.TSQualifiedName} qualifiedName
 */
function unifyQualifiedName( qualifiedName ) {
	if ( ! qualifiedName.right ) {
		if ( ! qualifiedName.left ) {
			return qualifiedName.name;
		}
		return qualifiedName.left.name;
	}
	return `${ unifyQualifiedName( qualifiedName.left ) }.${
		qualifiedName.right.name
	}`;
}

/**
 * @param {babelTypes.TSImportType} typeAnnotation
 */
function getImportTypeAnnotation( typeAnnotation ) {
	// Should this just return the unqualified name (i.e., typeAnnotation.name || typeAnnotation.right.name)?
	return `import('${ typeAnnotation.argument.value }').${ unifyQualifiedName(
		typeAnnotation.qualifier
	) }`;
}

/**
 *
 * @param {babelTypes.TSType} objectType
 */
function getIndexedAccessTypeAnnotationObjectName( objectType ) {
	if ( babelTypes.isTSImportType( objectType ) ) {
		return objectType.qualifier.name;
	}
	return objectType.typeName.name;
}

/**
 * @param {babelTypes.TSIndexedAccessType} typeAnnotation
 */
function getIndexedAccessTypeAnnotation( typeAnnotation ) {
	const objName = getIndexedAccessTypeAnnotationObjectName(
		typeAnnotation.objectType
	);
	const index = typeAnnotation.indexType.literal.value;
	return `${ objName }[ '${ index }' ]`;
}

/**
 *
 * @param {babelTypes.TSLiteralType} typeAnnotation
 */
function getLiteralTypeAnnotation( typeAnnotation ) {
	switch ( typeAnnotation.literal.type ) {
		case 'BigIntLiteral': {
			return `${ typeAnnotation.literal.value }n`;
		}
		case 'NumericLiteral':
		case 'BooleanLiteral': {
			return typeAnnotation.literal.value;
		}
		case 'StringLiteral': {
			return `'${ typeAnnotation.literal.value }'`;
		}
	}
}

/**
 * @param {babelTypes.TSMappedType} typeAnnotation
 */
function getMappedTypeAnnotation( typeAnnotation ) {
	const typeParam = typeAnnotation.typeParameter.name;
	const constraintOperator = typeAnnotation.typeParameter.constraint.operator;
	const constraintAnnotation = getTypeAnnotation(
		typeAnnotation.typeParameter.constraint.typeAnnotation
	);
	const mappedValue = getTypeAnnotation( typeAnnotation.typeAnnotation );
	return `[ ${ typeParam } in ${ constraintOperator } ${ constraintAnnotation } ]: ${ mappedValue }`;
}

/**
 * @param {babelTypes.TSTypeReference} typeAnnotation
 */
function getTypeReferenceTypeAnnotation( typeAnnotation ) {
	if ( ! typeAnnotation.typeParameters ) {
		return typeAnnotation.typeName.name;
	}
	const typeParams = typeAnnotation.typeParameters.params
		.map( getTypeAnnotation )
		.join( ', ' );
	return `${ typeAnnotation.typeName.name }< ${ typeParams } >`;
}

/**
 * @param {TypeAnnotation} typeAnnotation
 * @return {string | null} The type or null if not an identifiable type.
 */
function getTypeAnnotation( typeAnnotation ) {
	switch ( typeAnnotation.type ) {
		case 'TSAnyKeyword': {
			return 'any';
		}
		case 'TSArrayType': {
			return getArrayTypeAnnotation( typeAnnotation );
		}
		case 'TSBigIntKeyword': {
			return 'BigInt';
		}
		case 'TSBooleanKeyword': {
			return 'boolean';
		}
		case 'TSConditionalType': {
			// Unsure what this is
			return '';
		}
		case 'TSConstructorType': {
			return `new ${ getFunctionTypeAnnotation( typeAnnotation ) }`;
		}
		case 'TSExpressionWithTypeArguments': {
			// Unsure with this is
			return '';
		}
		case 'TSFunctionType': {
			return getFunctionTypeAnnotation( typeAnnotation );
		}
		case 'TSImportType': {
			return getImportTypeAnnotation( typeAnnotation );
		}
		case 'TSIndexedAccessType': {
			return getIndexedAccessTypeAnnotation( typeAnnotation );
		}
		case 'TSIntersectionType': {
			return getIntersectionTypeAnnotation( typeAnnotation );
		}
		case 'TSLiteralType': {
			return getLiteralTypeAnnotation( typeAnnotation );
		}
		case 'TSMappedType': {
			return getMappedTypeAnnotation( typeAnnotation );
		}
		case 'TSNeverKeyword': {
			return 'never';
		}
		case 'TSNullKeyword': {
			return 'null';
		}
		case 'TSNumberKeyword': {
			return 'number';
		}
		case 'TSObjectKeyword': {
			return 'object';
		}
		case 'TSOptionalType': {
			return `${ getTypeAnnotation( typeAnnotation.typeAnnotation ) }?`;
		}
		case 'TSParenthesizedType': {
			// string parens
			return getTypeAnnotation( typeAnnotation.typeAnnotation );
		}
		case 'TSRestType': {
			return `...${ getTypeAnnotation( typeAnnotation.typeAnnotation ) }`;
		}
		case 'TSStringKeyword': {
			return 'string';
		}
		case 'TSSymbolKeyword': {
			return 'symbol';
		}
		case 'TSThisType': {
			return 'this';
		}
		case 'TSTupleType': {
			return getTupleTypeAnnotation( typeAnnotation );
		}
		case 'TSTypeLiteral': {
			return getTypeLiteralTypeAnnotation( typeAnnotation );
		}
		case 'TSTypeOperator': {
			return `${ typeAnnotation.operator } ${ getTypeAnnotation(
				typeAnnotation.typeAnnotation
			) }`;
		}
		case 'TSTypePredicate': {
			return `${
				typeAnnotation.parameterName.name
			} is ${ getTypeAnnotation( typeAnnotation.typeAnnotation ) }`;
		}
		case 'TSTypeQuery': {
			// unsure what this is
			return '';
		}
		case 'TSTypeReference': {
			return getTypeReferenceTypeAnnotation( typeAnnotation );
		}
		case 'TSUndefinedKeyword': {
			return 'undefined';
		}
		case 'TSUnionType': {
			return getUnionTypeAnnotation( typeAnnotation );
		}
		case 'TSUnknownKeyword': {
			return 'unknown';
		}
		case 'TSVoidKeyword': {
			return 'void';
		}
		default: {
			return '';
		}
	}
}

/**
 * @param {CommentTag} tag The documented parameter.
 * @param {import('@babel/core').Node} token The function the parameter is documented on.
 * @return {null | string} The parameter's type annotation.
 */
function getParamTypeAnnotation( tag, token ) {
	// search for the param token corresponding to the tag
	// use the tag's `name` property

	// if the file is using JSDoc type annotations, just use the JSDoc
	if ( tag.type ) {
		return tag.type;
	}

	if ( babelTypes.isExportNamedDeclaration( token ) ) {
		token = token.declaration;
	}

	if ( babelTypes.isVariableDeclaration( token ) ) {
		// ignore multiple variable declarations
		token = token.declarations[ 0 ].init;
	}

	// otherwise find the corresponding parameter token for the documented parameter
	/** @type {babelTypes.Identifier} */
	const paramToken = token.params.reduce( ( found, pToken ) => {
		if ( found ) return found;
		return pToken.name === tag.name ? pToken : found;
	}, null );

	// This shouldn't happen due to our ESLint enforcing correctly documented parameter names but just in case
	// we'll give a descriptive error so that it's easy to diagnose the issue.
	if ( ! paramToken ) {
		throw new Error(
			`Cound not find corresponding parameter token for documented parameter ${ tag.name } in function ${ token.id.name }.`
		);
	}

	/** @type {babelTypes.TSTypeAnnotation} */
	const typeAnnotation = paramToken.typeAnnotation.typeAnnotation;

	return getTypeAnnotation( typeAnnotation );
}

/**
 * @param {CommentTag} tag A return comment tag.
 * @param {import('@babel/core').Node} token A function token.
 * @return {null | string} The function's return type annoation.
 */
function getReturnTypeAnnotation( tag, token ) {
	// if the file is using JSDoc type annotations, just use the JSDoc
	if ( tag.type ) {
		return tag.type;
	}

	if ( babelTypes.isExportNamedDeclaration( token ) ) {
		token = token.declaration;
	}

	if ( babelTypes.isVariableDeclaration( token ) ) {
		// ignore multiple variable declarations
		token = token.declarations[ 0 ].init;
	}

	return getTypeAnnotation( token.returnType.typeAnnotation );
}

module.exports =
	/**
	 * @param {CommentBlock['tags'][0]} tag A comment tag.
	 * @param {import('@babel/core').Node} token A function token.
	 * @return {null | string} The type annotation for the given tag or null if the tag has no type annotation.
	 */
	function ( tag, token ) {
		switch ( tag.tag ) {
			case 'param': {
				return getParamTypeAnnotation( tag, token );
			}
			case 'return': {
				return getReturnTypeAnnotation( tag, token );
			}
			default: {
				return tag.type;
			}
		}
	};
/* eslint-enable jsdoc/valid-types */
