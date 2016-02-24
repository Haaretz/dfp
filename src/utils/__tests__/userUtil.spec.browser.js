import User from '../../utils/userUtil';
describe( 'a user', () => {
  let user;
  before(() => {
    user = new User();
  });

  it( 'should not throw an error', () => {
    expect( user ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( user ).to.be.a.object;
  } );

  it( 'should have a user type string property ', () => {
    expect( user.userType ).to.be.a.string;
  } );

  it( 'should have an impression map initialized ', () => {
    expect( user.impressionMap ).to.be.a.object;
  } );
} );
