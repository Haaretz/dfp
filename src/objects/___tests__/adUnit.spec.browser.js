import adUnitModule from '../../objects/adUnit';
describe( 'adUnit', () => {
  let adUnit;
  before(() => {
    adUnit = new adUnitModule({configLine: 'somevalue'});
  });

  it( 'should not throw an error', () => {
    expect( adUnit ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( adUnit ).to.be.a.object;
  } );

  it( 'should have a configuration ', () => {
    expect( adUnit.config ).to.be.a.object;
  } );
} );
