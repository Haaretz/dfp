# A DoubleClick For Publishers implementation
 "Google's [DoubleClick for Publishers (DFP)](https://developers.google.com/doubleclick-publishers/) ad management solution is designed to meet the
 growing needs of publishers."

[![Build Status](https://travis-ci.org/eliagrady/dfp.svg?branch=master)](https://travis-ci.org/eliagrady/dfp)
[![Coverage Status](https://coveralls.io/repos/github/eliagrady/dfp/badge.svg?branch=master)](https://coveralls.io/github/eliagrady/dfp?branch=master)
[![npm version](https://badge.fury.io/js/boily.svg)](https://badge.fury.io/js/boily)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm](https://img.shields.io/npm/l/express.svg?style=flat-square)](https://github.com/kflash/boily/blob/master/LICENSE.md)

### Based on the excellent Boilerplate 'boily' created by Kflash: https://github.com/kflash/boily

> Boily is a starter kit to get you up and running with a bunch of awesome new front-end
technologies using Babel, Rollup, Webpack, Mocha, Sinon-chai, Isparta, and ESLint without any framework dependencies.

## Features

* [ES6 with Babel](http://babeljs.io/) for ES6 and ES7
* [Webpack](https://webpack.github.io/) for unit tests
* [Rollup](http://rollupjs.org/) for bundling
* [ESLint](http://eslint.org/) to maintain a consistent code style
* [Karma](http://karma-runner.github.io/0.13/index.html) as the test runner
* [Universal Module Definition (UMD) API](https://github.com/umdjs/umd), which provides compatibility with the most popular script loaders, to the output.
* Unit tests written with ES2015 get transpiled on the fly
* [Easier way of committing your changes](https://github.com/commitizen/cz-cli), with command line tool
* Browser tests in the browser
* [SauceLab](https://saucelabs.com/) and [BrowserStack](https://www.browserstack.com/) ready
* [TestingBot](https://testingbot.com/) ready
* Node >= 4.2

## Installation

Just clone the repo and install the necessary node modules.

```js
$ git clone https://github.com/eliagrady/dfp.git dfp
$ cd dfp
$ npm install                   # Install Node modules listed in ./package.json
$ npm run build                 # Build a minified and a non-minified version of the library
```
## Workflow

* `npm run build` - Build task that generate a minified and a non-minified script
* `npm run build:prod` - Build task that generate a production bundle
* `npm run build:dev` - Build task that generate a development bundle
* `npm run build:es6` - Build task that generate and preserves ES6 imports and exports into a ES2015 development bundle
* `npm run lint:source` - Lint the source
* `npm run lint:tests` - Lint the unit tests
* `npm run clean` - Remove the coverage report - and the *dist* folder
* `npm run test` - Runs unit tests for both server and the browser
* `npm run test:browser` - Runs the unit tests for browser
* `npm run test:server` - Runs the unit tests on the server
* `npm run karma:chrome` - Runs the unit tests for browser with Chrome
* `npm run karma:phantom` - Runs the unit tests for browser with PhantomJS
* `npm run karma:ie` - Runs the unit tests for browser with Internet Explorer
* `npm run karma:firefox` - Runs the unit tests for browser with Firefox
* `npm run watch:server` - Run all unit tests for server & watch files for changes
* `npm run watch:browser` - Run all unit tests for browser & watch files for changes
* `npm run packages` - List installed packages
* `npm run package:purge` - Remove all dependencies
* `npm run package:reinstall` - Reinstall all dependencies
* `npm run package:check` - shows a list over dependencies with a higher version number then the current one - if any
* `npm run package:upgrade` - Automaticly upgrade all devDependencies & dependencies, and update package.json
* `npm run package:dev` - Automaticly upgrade all devDependencies and update package.json
* `npm run package:prod` - Automaticly upgrade all dependencies and update package.json
* `npm run browser` - runs browser unit tests in the browser. All of your unit tests get bundled automatically.
* `npm run commit` - commit latest changes to the Master branch on Github.

## Testing environment

This project uses Mocha to run your unit tests, it uses Karma as the test runner, it enables the feature that you are able to render your tests to the browser (e.g: Firefox, Chrome etc.).

To add a unit test, simply create a `.spec.browser.js` or a `.spec.server.js` file inside the `~../src/**/*__tests__*/**/` folder. Karma will pick up on these files automatically, and Mocha and Chai will be available within your unit tests without the need to import them.

To run unit tests only for the browser ( *client*), or for the server, create either a `~/.spec.browser.js` or `~/spec.server` file inside the same folder.

To run the tests in the project, just simply `npm run test` for both server and client unit tests, or `npm run test:server`. for server or `npm run test:browser`. for browser tests.

To keep watching the common test suites that you are working on, simply do `npm run watch:browser` or `npm run watch:server`.

### Adding other test files

- *Browser:*, simply open up the `karma.conf.js` file in the  `~/config` folder and add your files to the `files:` and `preprocessors:` section.
- *NodeJS:* open up the `mocha.opts` file in the  `~/config` folder and add your files to the top of the file.

*Note!* Karma runs both browser and NodeJS unit tests by default.

## Browser tests

To run your unit tests in the browser, do `npm run browser`, and open `port 8080`. Hot module replacement (WDS) are supported.

## Coveralls

This library is set up to integrate with Coveralls, and will automatically publish your coverage report to **coveralls.io** if you have created an account there.

##Rollup

Rollup are used as the library bundler. It produces a cleaner and more lightweight source code then what you get with for example webpack and browserify.

## Package management

Boily has build-in some nice features to always make sure your dependency tree are up to date.

To check for the latest dependencies, simply run `npm run package:check`.

If you want to update your packages, you can simply do `npm run package:upgrade`.

*Note!* Your `package.json` will be automatically updated so make sure you have saved your changes before running this.

To reinstall all packages, do `npm run package:reinstall`, and to remove all packages  `npm run package:purge`.

## Pre-commit

This boilerplate uses a [pre-commit hook](https://www.npmjs.com/package/pre-commit) to ensure that your npm test (or other specified scripts) passes before you can commit your changes. This all conveniently configured in your package.json.

## Linting

This boilerplate project uses ESLint to lint your source. To change the rules, edit the .eslintrc file in the root directory, respectively.

## Installation

Download the package, and run this from the command line:

```
npm install
```

## License
MIT Â© [KFlash](https://github.com/kflash)
