import DFP from '../../src';
describe( 'DFP - unit tests for browser', () => {
  let dfp;
  before(() => {
    dfp = new DFP({configLine: 'somevalue'});
  });

  it( 'should not throw an error', () => {
    expect( dfp ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( dfp ).to.be.a.object;
  } );

  it( 'should have a configuration ', () => {
    expect( dfp.config ).to.be.a.object;
  } );
} );
