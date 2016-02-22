const webpack = require('webpack');
const glob = require('glob');
// Our testing bundle is made up of our unit tests, which
// should individually load up pieces of our application.
// We also include the browser setup file.
const testFiles  = glob.sync('./src/**/*__tests__*/**/*spec.browser.js')
	.concat(glob.sync('./src/**/*__tests__*/**/*spec.server.js'));

module.exports = {
	entry:  ['./config/browser.js'].concat(testFiles),
	output: {
		filename: '__specs.js',
	},
	devtool: 'inline-source-map',
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules\/dist/,
			loader: 'babel-loader'
		}]
	},
	devServer: {
		contentBase: './',
		port: 8086,
		noInfo: false,
		hot: true,
		inline: true,
		proxy: {
			'/': {
				bypass: function(req, res, proxyOptions) {
					return '/config/runner.html';
				}
			}
		}
	},
	plugins: [
		// By default, webpack does `n=>n` compilation with entry files. This concatenates
		// them into a single chunk.
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
		new webpack.HotModuleReplacementPlugin()
	]
};
