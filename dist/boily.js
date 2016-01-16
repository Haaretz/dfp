/*!
 * boily v0.8.4
 * (c) 2016 KFlash
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Boily = factory());
}(this, function () { 'use strict';

	var boily = {

		foo: 123
	};

	// Correct version will be set by 'rollup'
	boily.version = '0.8.4';

	// Only for development mode
	if ("development" !== 'production') {
		boily.dev = '123';
	}

	return boily;

}));