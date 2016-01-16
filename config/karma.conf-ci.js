const fs = require('fs');

module.exports = function(config) {

	// Use ENV vars on Travis and sauce.json locally to get credentials
	if (!process.env.SAUCE_USERNAME) {
		if (!fs.existsSync('sauce.json')) {
			console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
			process.exit(1);
		} else {
			process.env.SAUCE_USERNAME = require('./sauce').username;
			process.env.SAUCE_ACCESS_KEY = require('./sauce').accessKey;
		}
	}

	// Browsers to run on Sauce Labs
	const customLaunchers = {
		'SL_Chrome': {
			base: 'SauceLabs',
			browserName: 'chrome',
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
		'SL_iOS': {
			base: 'SauceLabs',
			browserName: 'iphone',
			platform: 'OS X 10.10',
			version: '8.1'
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
		}
	};

	config.set({
		// list of files / patterns to load in the browser
		files: [
			'../src/**/*__tests__*/**/*.js', // UT
			'../test/specs/**/*spec.browser.js', // AT
			'../test/specs/**/*spec.server.js', // AT
			'../test/specs/**/*spec.js' // AT
		],
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'sinon-chai', 'expect'],
		preprocessors: {
			'../src/**/*__tests__*/**/*.js': ['webpack'], // UT
			'../test/specs/**/*spec.server.js': ['webpack'], // AT
			'../test/specs/**/*spec.browser.js': ['webpack'], // AT
			'../test/specs/**/*spec.js': ['webpack'], // AT
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
		reporters: ['progress', 'saucelabs'],
		port: 9876,
		colors: true,
		logLevel: config.LOG_DEBUG,
		sauceLabs: {
			testName: 'Karma and Sauce Labs demo',
			recordScreenshots: false,
			connectOptions: {
				port: 5757,
				logfile: 'sauce_connect.log'
			},
			public: 'public'
		},
		captureTimeout: 120000,
		customLaunchers: customLaunchers,
		webpackMiddleware: {
			noInfo: true
		},
		plugins: [
			require('karma-webpack'),
			require('karma-mocha'),
			require('karma-phantomjs-launcher'),
			require('karma-spec-reporter'),
			require('karma-sauce-launcher')
		],
		browsers: Object.keys(customLaunchers),
		singleRun: true
	});
};