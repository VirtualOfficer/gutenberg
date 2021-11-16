/**
 * WordPress dependencies
 */
import { Path, SVG } from '@wordpress/primitives';

const commentAuthorAvatar = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path
			d="M7.25 16.4371C6.16445 15.2755 5.5 13.7153 5.5 12C5.5 8.41015 8.41015 5.5 12 5.5C15.5899 5.5 18.5 8.41015 18.5 12C18.5 13.7153 17.8356 15.2755 16.75 16.4371V16C16.75 14.4812 15.5188 13.25 14 13.25L10 13.25C8.48122 13.25 7.25 14.4812 7.25 16V16.4371ZM8.75 17.6304C9.70606 18.1835 10.8161 18.5 12 18.5C13.1839 18.5 14.2939 18.1835 15.25 17.6304V16C15.25 15.3096 14.6904 14.75 14 14.75L10 14.75C9.30964 14.75 8.75 15.3096 8.75 16V17.6304ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12ZM14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10Z"
			fillRule="evenodd"
			clipRule="evenodd"
			fill="black"
		/>
	</SVG>
);

export default commentAuthorAvatar;
