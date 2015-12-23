/*!
 * boily v0.3.2
 * (c) 2015 KFlash
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.Inferno = factory();
}(this, function () { 'use strict';

    var boily = {

        foo: 123
    };

    // Correct version will be set by 'rollup'
    boily.version = '0.3.2';

    return boily;

}));
//# sourceMappingURL=boily.js.map