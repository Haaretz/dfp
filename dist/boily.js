/*!
 * boily v0.0.12
 * (c) 2015 KFlash
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}(this, function () { 'use strict';

	const boily = {};

	// correct 'version' will be retrieved from package.json
	boily.version = '0.0.12'

	module.exports = boily;

}));