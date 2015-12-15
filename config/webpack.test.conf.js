const webpack = require('webpack')

module.exports = {
  entry: 'mocha!./test/bootstrap.js',
  output: {
    path: './test/shared',
    filename: 'specs.js',
    publicPath: '/'
  },
  devtool: 'source-map',
  module: {
    preLoaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }],
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules|\/dist/,
      loader: 'babel'
    }]
  },
  devServer: {
    contentBase: './test',
    port: 8080,
    hot: true,
    inline: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
