/*!
 * boily v0.0.11
 * (c) 2015 KFlash
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this, function () { 'use strict';

	var boily = {};

	// correct 'version' will be retrieved from package.json
	boily.version = '0.0.11';

	module.exports = boily;

}));