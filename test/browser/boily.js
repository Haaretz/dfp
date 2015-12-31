import boily from '../../src';

describe( 'Boily - AT for browser', () => {

	it( 'should be a object', () => {
		expect( boily ).to.be.a.object;
	} );

	it( 'should contain 123', () => {
		expect( boily.foo ).to.equal( 123 );
	} );
} );