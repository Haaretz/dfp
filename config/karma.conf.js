const path = require('path');
const webpack = require('webpack');
const glob = require('glob');

// Our testing bundle is made up of our unit tests, which
// should individually load up pieces of our application.
// We also include the browser setup file.
const testFiles  = glob.sync('./src/**/*__tests__*/**/*.spec.browser.js');
//.concat(glob.sync('./src/**/*__tests__*/**/*spec.server.js'));
const allFiles = ['./config/browser.js'].concat(testFiles);


// Karma configuration
module.exports = function(config, specificOptions) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai', 'dirty-chai'],

    // list of files / patterns to load in the browser
    files: [
      '../node_modules/babel-polyfill/dist/polyfill.js',
      '../src/**/*__tests__*/**/*spec.browser.js',
      //'../src/**/*__tests__*/**/*spec.server.js',
    ],
    // list of files to exclude
    exclude: [],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '../src/**/*.js': ['sourcemap'],
      //'../src/**/*__tests__*/**/*spec.server.js': ['webpack'],
      '../src/**/*__tests__*/**/*spec.browser.js': ['webpack','sourcemap'],
    },
    webpack: {
      entry: allFiles,
      cache: true,
      devtool: 'inline-source-map',
      module: {
        preLoaders: [{
          test: /\.js?$/,
          exclude: /(src\/dist|packages|.git|node_modules|__tests__)/,
          loader: 'isparta',
          include: path.join(__dirname, '../src'),
          query: {
            cacheDirectory: true,
          }
        }],
        loaders: [
          {
            test: /\.js$/,
            exclude: /(src\/dist|.git|node_modules)/,
            loader: 'babel-loader',
            query: {
              cacheDirectory: true,
            }
          }
        ]
      },
      plugins: [
        // By default, webpack does `n=>n` compilation with entry files. This concatenates
        // them into a single chunk.
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
        new webpack.HotModuleReplacementPlugin(),
      ]
    },
    webpackMiddleware: {
      noInfo: true
    },
    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],
    // reporter options
    mochaReporter: {
      // first run will have the full output
      // next runs will just output the summary and errors in mocha style
      output: 'autowatch',
      colors: {
        success: 'green',
        info: 'bgYellow',
        warning: 'cyan',
        error: 'bgRed'
      },
      divider: ''
    },
    coverageReporter: {
      includeAllSources: true,
      instrumenters: {
        isparta: require("isparta-instrumenter-loader")
      },
      instrumenter: {
        "**/*.js": 'isparta'
      },
      instrumenterOptions: {
        isparta: {
          babel: {
            stage: 1
          }
        }
      },
      reporters: [
        {
          type: 'html',
          dir: '../coverage',
        },
        {
          type: 'text',
          dir: '../coverage',
        },
        {
          type: 'lcov',
          dir: '../coverage',
        },
        //{
        //  type: 'json',
        //  file : 'coverage-final.json',
        //  dir: '../coverage',
        //  instrumenter: {
        //    '**/*.js': 'isparta' // Force the use of the isparta instrumenter to cover JS files
        //  },
        //  //subdir: '.'
        //}
      ]
    },

    browsers: ['Chrome'],

    customLaunchers: {
      Chrome_for_Travis_CI: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    },

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 2,
    // concurrency level how many browser should be started simultaneously
    concurrency: 4,
    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 100000,
    client: {
      useIframe: true,
      clearContext: false
    },
    browserNoActivityTimeout: 30000,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });

  if (process.env.TRAVIS) {

    // Use Chrome as default browser for Travis CI
    config.browsers = ['Chrome_for_Travis_CI'];
    // Used by Travis to push coveralls info corretly to example coveralls.io
    config.reporters = ['mocha', 'coverage', 'coveralls'];
    // Karma (with socket.io 1.x) buffers by 50 and 50 tests can take a long time on IEs;-)
    config.browserNoActivityTimeout = 120000;

    if (process.env.BROWSER_PROVIDER === 'saucelabs' || !process.env.BROWSER_PROVIDER) {
      // Allocating a browser can take pretty long (eg. if we are out of capacity and need to wait
      // for another build to finish) and so the `captureTimeout` typically kills
      // an in-queue-pending request, which makes no sense.
      config.captureTimeout = 0;
    }
  }
};
