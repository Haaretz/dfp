import conflictResolverModule from '../../objects/conflictResolver';

describe( 'conflictResolver', () => {
  let conflictResolver;
  before(() => {
    conflictResolver = new conflictResolverModule({configLine: 'somevalue'});
  });

  it( 'should not throw an error', () => {
    expect( conflictResolver ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( conflictResolver ).to.be.a.object;
  } );

  it( 'should have a configuration ', () => {
    expect( conflictResolver.config ).to.be.a.object;
  } );

} );
