import adSlotModule from '../../objects/adSlot';
describe( 'adSlot', () => {
  let adSlot;
  before(() => {
    adSlot = new adSlotModule({configLine: 'somevalue'});
  });

  it( 'should not throw an error', () => {
    expect( adSlot ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( adSlot ).to.be.a.object;
  } );

  it( 'should have a configuration ', () => {
    expect( adSlot.config ).to.be.a.object;
  } );
} );
