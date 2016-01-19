/*!
 * boily v1.0.6
 * (c) 2016 KFlash
 * Released under the MIT License.
 */
var boily = {

	foo: 123
};

// Correct version will be set with the 'rollup-replace plugin'
boily.version = '1.0.6';

// Only for development mode
if ("development" !== 'production') {
	boily.dev = '123';
}

export default boily;