/*!
 * boily v0.8.4
 * (c) 2016 KFlash
 * Released under the MIT License.
 */
var boily = {

	foo: 123
};

// Correct version will be set by 'rollup'
boily.version = '0.8.4';

// Only for development mode
if ("development" !== 'production') {
	boily.dev = '123';
}

export default boily;