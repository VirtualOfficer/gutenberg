/**
 * External dependencies
 */
import YouTube from 'react-native-youtube';

export function getEmbedEditComponent( title, icon, responsive = true ) {
	return class extends Component {
		constructor() {
			super( ...arguments );

			this.state = {
				editingURL: false,
				url: this.props.attributes.url,
			};
		}

		render() {
			return (
				<YouTube
					videoId="liJVSwOiiwg" // The YouTube video ID
					apiKey="AIzaSyAueRcTPuHYIj6AN9MSYNBkHaB-9Uv-zIE"
					play // control playback of video with true/false
					loop // control whether the video should loop when ended
					onReady={ ( e ) => this.setState( { isReady: true } ) }
					onChangeState={ ( e ) =>
						this.setState( { status: e.state } )
					}
					onChangeQuality={ ( e ) =>
						this.setState( { quality: e.quality } )
					}
					onError={ ( e ) => this.setState( { error: e.error } ) }
					style={ { alignSelf: 'stretch', height: 300 } }
				/>
			);
		}
	};
}
