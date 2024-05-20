module.exports = ( api ) => {
	api.cache( true );
	return {
		presets: [ 'module:@react-native/babel-preset' ],
		plugins: [
			'@babel/plugin-proposal-async-generator-functions',
			'@babel/plugin-transform-runtime',
			[
				'react-native-platform-specific-extensions',
				{
					extensions: [ 'css', 'scss', 'sass' ],
				},
			],
			'react-native-reanimated/plugin',
			'@babel/plugin-proposal-export-namespace-from',
			'@babel/plugin-transform-dynamic-import',
		],
		overrides: [
			{
				// Transforms JSX into JS function calls and use `createElement` instead of the default `React.createElement`
				plugins: [
					[
						'@babel/plugin-transform-react-jsx',
						{
							runtime: 'automatic',
						},
					],
				],
				exclude: /node_modules\/react-native/,
			},
		],
		env: {
			development: {
				plugins: [ '@babel/transform-react-jsx-source' ],
			},
		},
	};
};
