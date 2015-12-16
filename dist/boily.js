/*!
 * boily v0.0.25
 * (c) 2015 KFlash
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.boily = factory();
}(this, function () { 'use strict';

    var boily = {

        foo: 123
    };

    // Correct version will be corrected by 'rollup'
    boily.version = '0.0.25';

    return boily;

}));