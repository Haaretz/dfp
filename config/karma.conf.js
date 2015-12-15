module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        // list of files to exclude
        exclude: [],
        // list of files / patterns to load in the browser
        files: [
            '../src/index.js',
            '../test/browser/**/*.js',
            '../test/shared/**/*.js',
            '../test/node/**/*.js',
        ],
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai'],
        preprocessors: {
            '../src/index.js': ['webpack'],
            // browser unit tests
            '../test/browser/**/*.js': ['webpack'],
            // shared unit tests
            '../test/shared/*/*.js': ['webpack'],
            // node unit tests
            '../test/node/*/*.js': ['webpack']

        },
        // test results reporter to use
        reporters: ['progress', 'coverage'],
        coverageReporter: {
            reporters: [{
                type: 'text'
            }, {
                type: 'lcov',
				dir: '../coverage', 
                subdir: '.'
            }]
        },
        webpack: {
            devtool: 'source-map',
            module: {
                loaders: [{
                    test: /\.js$/,
                    exclude: /test|node_modules/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015']
                    }
                }],
                postLoaders: [{
                    test: /\.js$/,
                    exclude: /test|node_modules/,
                    loader: 'istanbul-instrumenter'
                }]
            }
        },

        webpackMiddleware: {
            noInfo: true
        },
        browsers: ['PhantomJS'],
		// custom launchers
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
        // Karma (with socket.io 1.x) buffers by 50 and 50 tests can take a long time on IEs;-)
        config.browserNoActivityTimeout = 120000;
    }
};