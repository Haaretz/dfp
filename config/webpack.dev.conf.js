const webpack = require('webpack');
const glob = require('glob');

const entries = glob.sync('./test/specs/**/*.spec.js')
	.concat(glob.sync('./test/specs/**/*.spec.browser.js'))
	.concat(glob.sync('./test/specs/**/*.spec.server.js'))
	.map(function(file) { return 'mocha!' + file; });

module.exports = {
  entry: entries,
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
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
