import adManagerModule from '../../Objects/adManager';
describe( 'adManager', () => {
  let adManager;
  before(() => {
    adManager = new adManagerModule({configLine: 'somevalue'});
  });

  it( 'should not throw an error', () => {
    expect( adManager ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( adManager ).to.be.a.object;
  } );

  it( 'should have a configuration ', () => {
    expect( adManager.config ).to.be.a.object;
  } );
} );
