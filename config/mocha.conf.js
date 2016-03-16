//OLD

/* eslint-disable */
global.babel = require('babel-core/register');
global.expect = require('chai').expect;
global.sinon = require('sinon');

//var AbstractBrowser = require('mock-browser').delegates.AbstractBrowser;
var MockBrowser = require('mock-browser').mocks.MockBrowser;
var mock = new MockBrowser();

//// configure in some factory
//var opts = {};
//
//if (typeof window === 'object') {
//  // assign the browser window if it exists
//  opts.window = window;
//} else {
//  // create a mock window object for testing
//  opts.window =  MockBrowser.createWindow();
//  opts.window.location = 'localhost';
//}

// create the browser object with a real window in browsers and mock when not in browser
//var mock = new AbstractBrowser( opts );


global.window = mock.getWindow();
global.document = mock.getDocument();
global.location = mock.getLocation();
////global.localStorage = storage;// || mock.getLocalStorage();
global.localStorage = global.window.localStorage = mock.getLocalStorage();
//global.isHomepage = true;
////global.googletag = global.googletag || {};

// NEW
//
///* eslint-disable */
//global.babel = require('babel-core/register');
//global.expect = require('chai').expect;
//global.sinon = require('sinon');
//var jsdom = require('jsdom');
//
//jsdom.defaultDocumentFeatures = {
//  FetchExternalResources   : ['script'],
//  ProcessExternalResources : ['script'],
//  //MutationEvents           : '2.0',
//  QuerySelector            : false
//};
//
//var htmlDoc = `
//<html>
//<head>
//<title>Test Document</title>
//<script>var testVar = true</script>
//<script>
//console.log("running script");
//var tag = document.createElement('script');
//tag.type = 'text/javascript';
//tag.setAttribute('src','//www.googletagservices.com/tag/js/gpt.js');
//var node = document.getElementsByTagName('script')[0];
//tag.onload = function() {
//console.log("tag onload fired!!");
//};
//tag.onerror = function() {
//console.log("tag onerror fired!!");
//};
//node.parentNode.insertBefore(tag, node);
//</script>
//<!--<script type='text/javascript' src='http://www.googletagservices.com/tag/js/gpt.js'></script>-->
//</head>
//<body>
//</body>
//</html>`;
//var document = jsdom.jsdom(htmlDoc);
//
//
//global.document = document;
//global.window = document.defaultView;
//global.location = window.location;
//////global.localStorage = storage;// || mock.getLocalStorage();
//global.localStorage = global.window.localStorage =   mock.getLocalStorage();
////global.isHomepage = true;
//////global.googletag = global.googletag || {};
