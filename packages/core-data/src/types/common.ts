export interface AvatarUrls {
	/**
	 * Avatar URL with image size of 24 pixels.
	 */
	'24'?: string;
	/**
	 * Avatar URL with image size of 48 pixels.
	 */
	'48'?: string;
	/**
	 * Avatar URL with image size of 96 pixels.
	 */
	'96'?: string;

	[ k: string ]: string;
}

export type MediaType = 'image' | 'file';
export type CommentStatus = 'open' | 'closed';
export type PingStatus = 'open' | 'closed';
export type PostStatus = 'publish' | 'future' | 'draft' | 'pending' | 'private';
export type PostFormat =
	| 'standard'
	| 'aside'
	| 'chat'
	| 'gallery'
	| 'link'
	| 'image'
	| 'quote'
	| 'status'
	| 'video'
	| 'audio';

export type Context = 'view' | 'edit' | 'embed';
export type ContextualField<
	FieldType,
	AvailableInContexts extends Context,
	C extends Context
> = AvailableInContexts extends C ? FieldType : never;

export type OmitNevers<
	T,
	Nevers = {
		[ K in keyof T ]: Exclude< T[ K ], undefined > extends never
			? never
			: T[ K ] extends Record< string, unknown >
			? OmitNevers< T[ K ] >
			: T[ K ];
	}
> = Pick<
	Nevers,
	{
		[ K in keyof Nevers ]: Nevers[ K ] extends never ? never : K;
	}[ keyof Nevers ]
>;

/**
 * A string that the server renders which often involves
 * modifications from the raw source string.
 *
 * For example, block HTML with the comment delimiters exists
 * in `post_content` but those comments are stripped out when
 * rendering to a page view. Similarly, plugins might modify
 * content or replace shortcodes.
 */
export interface RenderedText< C extends Context > {
	/**
	 * The source string which will be rendered on page views.
	 */
	raw: ContextualField< string, 'edit', C >;
	/**
	 * The output of the raw source after processing and filtering on the server.
	 */
	rendered: string;
}
