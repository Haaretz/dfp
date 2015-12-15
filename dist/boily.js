/*!
 * boily v0.0.14
 * (c) 2015 KFlash
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.boily = factory();
}(this, function () { 'use strict';

	var plugin = {

		foo: 123
	};

	plugin.version = '1.3.0';

	return plugin;

}));