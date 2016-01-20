const path = require('path');

// Karma configuration
module.exports = function(config, specificOptions) {
	/*
	// Use ENV vars on Travis and sauce.json locally to get credentials
	if (!process.env.SAUCE_USERNAME) {
		if (!fs.existsSync("sauce.json")) {
			console.log("Create a sauce.json with your credentials based on the https://github.com/saucelabs/karma-sauce-example/blob/master/sauce-sample.json file.");
			process.exit(1);
		} else {
			process.env.SAUCE_USERNAME = require("./sauce").username;
			process.env.SAUCE_ACCESS_KEY = require("./sauce").accessKey;
		}
	}*/

	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'sinon-chai'],

		// list of files / patterns to load in the browser
		files: [
			'../src/**/*__tests__*/**/*spec.browser.js',
			'../src/**/*__tests__*/**/*spec.server.js',
		],
		// list of files to exclude
		exclude: [],
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'../src/**/*__tests__*/**/*spec.server.js': ['webpack'],
			'../src/**/*__tests__*/**/*spec.browser.js': ['webpack'],
		},
		webpack: {
			module: {
				postLoaders: [{
					test: /(\.jsx)|(\.js)$/,
					exclude: /test|.git|node_modules\/dist/,
					loader: 'isparta',
					include: path.join(__dirname, '../src')
				}],
				loaders: [{
					test: /\.js$/,
					exclude: /(src\/dist|.git|node_modules)/,
					loader: 'babel-loader'
				}]
			}
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
			colors: {
				success: 'green',
				info: 'bgYellow',
				warning: 'cyan',
				error: 'bgRed'
			},
			divider: ''
		},
		coverageReporter: {
			reporters: [{
				type: 'html',
				dir: '../coverage'
			}, {
				type: 'text',
				dir: '../coverage'
			}, {
				type: 'lcov',
				dir: '../coverage'
			}]
		},

		// SauceLabs config for local development.
		/*	sauceLabs: {
		 testName: specificOptions.testName || 'Boily',
		 startConnect: true,
		 options: {
		 // We need selenium version +2.46 for Firefox 39 and the last selenium version for OS X is 2.45.
		 // TODO: Uncomment when there is a selenium 2.46 available for OS X.
		 // 'selenium-version': '2.46.0'
		 }
		 },*/
		// BrowserStack config for local development.
		/*	browserStack: {
		 project: 'Boily',
		 name: specificOptions.testName,
		 startTunnel: true,
		 timeout: 600 // 10min
		 },
		 */
		 	// TestingBot config for local development.
		/*	testingbot: {
		 project: 'Boily',
		 testName: specificOptions.testName || 'Boily',
		 connectOptions: {
        verbose: true,
        'se-port': 4445,
        logfile: 'testingbot_tunnel.log'
      },
		 timeout: 600 // 10min
		 },
		 */
		browsers: ['Chrome'],

		customLaunchers: {

		// For more browsers on Sauce Labs see:
		// https://saucelabs.com/docs/platforms/webdriver

			/*
			 'SL_Chrome': {
			 base: 'SauceLabs',
			 browserName: 'chrome',
			 platform: "Windows 10",
			 version: '45'
			 },
			 'SL_Firefox': {
			 base: 'SauceLabs',
			 browserName: 'firefox',
			 version: '39'
			 },
			 'SL_Safari': {
			 base: 'SauceLabs',
			 browserName: 'safari',
			 platform: 'OS X 10.10',
			 version: '8'
			 },
			 'SL_IE_9': {
			 base: 'SauceLabs',
			 browserName: 'internet explorer',
			 platform: 'Windows 2008',
			 version: '9'
			 },
			 'SL_IE_10': {
			 base: 'SauceLabs',
			 browserName: 'internet explorer',
			 platform: 'Windows 2012',
			 version: '10'
			 },
			 'SL_IE_11': {
			 base: 'SauceLabs',
			 browserName: 'internet explorer',
			 platform: 'Windows 8.1',
			 version: '11'
			 },
			 'SL_MICROSOFTEDGE': {
			 base: "SauceLabs",
			 browserName: "microsoftedge",
			 platform: "Windows 10"
			 },
			 'SL_iOS': {
			 base: "SauceLabs",
			 browserName: "iphone",
			 platform: "OS X 10.10",
			 version: "8.1"
			 },
			'SL_iOS_SAFARI_9': {
			 base: "SauceLabs",
			 browserName: "iphone",
			 platform: "OS X 10.10",
			 version: "9.2"
			 },
			 SL_ANDROID_5_1: {
			 base: "SauceLabs",
			 browserName: "android",
			 platform: "Linux",
			 version: "5.1"
			 },
			 'BS_Chrome': {
			 base: 'BrowserStack',
			 browser: 'chrome',
			 os: 'OS X',
			 os_version: 'Yosemite'
			 },
			 'BS_Safari': {
			 base: 'BrowserStack',
			 browser: 'safari',
			 os: 'OS X',
			 os_version: 'Yosemite'
			 },
			 'BS_Firefox': {
			 base: 'BrowserStack',
			 browser: 'firefox',
			 os: 'Windows',
			 os_version: '8'
			 },
			 'BS_IE_9': {
			 base: 'BrowserStack',
			 browser: 'ie',
			 browser_version: '9.0',
			 os: 'Windows',
			 os_version: '7'
			 },
			 'BS_IE_10': {
			 base: 'BrowserStack',
			 browser: 'ie',
			 browser_version: '10.0',
			 os: 'Windows',
			 os_version: '8'
			 },
			 'BS_IE_11': {
			 base: 'BrowserStack',
			 browser: 'ie',
			 browser_version: '11.0',
			 os: 'Windows',
			 os_version: '8.1'
			 },
			 'BS_iOS': {
			 base: 'BrowserStack',
			 device: 'iPhone 6',
			 os: 'ios',
			 os_version: '8.0'
			 },
			 'TB_Chrome': {
        base: 'TestingBot',
        browserName: 'chrome'
      },
      'TB_Firefox': {
        base: 'TestingBot',
        browserName: 'firefox'
      }

			 */
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

		/*
		 config.browserStack.build = buildLabel;
		 config.browserStack.startTunnel = false;
		 config.browserStack.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

		 config.sauceLabs.build = buildLabel;
		 config.sauceLabs.startConnect = false;
		 config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
		 config.sauceLabs.recordScreenshots = true; */

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
