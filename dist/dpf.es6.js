/*!
 * DFP v0.0.1
 * (c) 2016 Elia Grady
 * Released under the MIT License.
 */
var babelHelpers = {};

babelHelpers.classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

babelHelpers.createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

babelHelpers;

/* globals googletag */

var DFP = function () {
  function DFP(config) {
    babelHelpers.classCallCheck(this, DFP);

    this.config = config;
    this.wasInitialized = false;
  }

  /*
   * initializes the 'googletag' global namespace and add the
    * google publish tags library to the page
   */


  babelHelpers.createClass(DFP, [{
    key: 'initGoogleTag',
    value: function initGoogleTag() {
      var _this = this;

      var promise = new Promise(function (resolve, reject) {
        if (_this.wasInitialized == true) {
          resolve();
        } else {
          // set up a place holder for the gpt code downloaded from google
          window.googletag = window.googletag || {};

          // this is a command queue used by GPT any methods added to it will be
          // executed when GPT code is available, if GPT is already available they
          // will be executed immediately
          window.googletag.cmd = window.googletag.cmd || [];
          //load googletagservices JS
          (function () {
            var _this2 = this;

            var tag = document.createElement('script');
            tag.async = true;
            tag.type = 'text/javascript';
            //var useSSL = 'https:' == document.location.protocol;
            tag.setAttribute('src', '//www.googletagservices.com/tag/js/gpt.js');
            var node = document.getElementsByTagName('script')[0];
            node.parentNode.insertBefore(tag, node);
            tag.onload = function () {
              _this2.wasInitialized = true;
              resolve();
            };
            tag.onerror = function (error) {
              _this2.wasInitialized = true;
              reject(error);
            };
          })();
        }
      });
      return promise;
    }
  }]);
  return DFP;
}();

// Correct version will be set with the 'rollup-replace plugin'
DFP.version = '0.0.1';

// Only for development mode
if ("development" !== 'production') {
  DFP.dev = '123';
}

export default DFP;