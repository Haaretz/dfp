const webpack = require('webpack');
const glob = require('glob');
// Our testing bundle is made up of our unit tests, which
// should individually load up pieces of our application.
// We also include the browser setup file.
const testFiles  = glob.sync('./test/specs/**/*.spec.js')
	.concat(glob.sync('./test/specs/**/*.spec.browser.js'))
	.concat(glob.sync('./test/specs/**/*.spec.server.js'));
const allFiles = ['./config/browser.js'].concat(testFiles);

	//.map(function(file) { return 'mocha!' + file; });

module.exports = {
	entry: allFiles,
	output: {
		path: './test',
		filename: 'specs.js',
		publicPath: 'http://localhost:8080/'
	},
	devtool: 'source-map',
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules\/dist/,
			loader: 'babel-loader'
		}]
	},
	devServer: {
		contentBase: './',
		port: 8080,
		noInfo: true,
		hot: true,
		inline: true,
		proxy: {
			'/': {
				bypass: function(req, res, proxyOptions) {
					return '/test/index.html';
				}
			}
		}
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
};
