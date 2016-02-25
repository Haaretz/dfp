import adSlotModule from '../../objects/adSlot';
describe( 'adSlot', () => {
  let adSlot;
  before(() => {
    window.isHomepage = true;
    adSlot = new adSlotModule({id: 'haaretz.co.il.Web.plazma',configLine: 'somevalue'});
  });

  it( 'should throw an error if no id param is passed', () => {
    expect(() => { new adSlotModule({configLine: 'somevalue'})}).to.throw;
  } );

  it( 'should not throw an error on a well defined adSlot', () => {
    expect( adSlot ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( adSlot ).to.be.a.object;
  } );

  it( 'should have a configuration ', () => {
    expect( adSlot.config ).to.be.a.object;
  } );
} );
