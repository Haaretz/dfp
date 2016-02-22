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

babelHelpers;

var DFP = function DFP(config) {
  babelHelpers.classCallCheck(this, DFP);

  this.config = config;
};

// Correct version will be set with the 'rollup-replace plugin'
DFP.version = '0.0.1';

// Only for development mode
if ("development" !== 'production') {
  DFP.dev = '123';
}

export default DFP;