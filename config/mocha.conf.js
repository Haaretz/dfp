/* eslint-disable */
global.babel = require('babel-core/register');
global.expect = require('chai').expect;
global.sinon = require('sinon');

//var AbstractBrowser = require('mock-browser').delegates.AbstractBrowser;
var MockBrowser = require('mock-browser').mocks.MockBrowser;
//var MockBrowser = MockBrowserModule.mocks.MockBrowser;
var mock = new MockBrowser();
//
//// configure in some factory
//var opts = {};
//
//if (typeof window === 'object') {
//  // assign the browser window if it exists
//  opts.window = window;
//} else {
//  // create a mock window object for testing
//  opts.window =  MockBrowser.createWindow();
//}
//
//// create the browser object with a real window in browsers and mock when not in browser
//var browser = new AbstractBrowser( opts );
//
//var document = browser.getDocument();

global.window = mock.getWindow();
global.document = mock.getDocument();
global.localStorage = mock.getLocalStorage();
global.isHomepage = true;
