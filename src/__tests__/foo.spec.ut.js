import foo from '../foo';

describe( 'foo.js unit tests', () => {
	it( 'should contain 123', () => {
		expect( foo.foo ).to.equal( 123 );
	} );
} );