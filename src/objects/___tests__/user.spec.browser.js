import User from '../../objects/user';
import CookieData from './../../utils/__tests__/cookieData.mock.js';
import getCookieAsMap, { ssoKey } from '../../utils/cookieUtils';
import globalConfigMock from '../../__tests__/globalConfig.mock';
const globalConfig = globalConfigMock;

function deleteAllCookies() {
  document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" +
        new Date().toUTCString() + ";path=/"); });
}


describe( ' User module', function() {
  this.timeout(5000);
  let user;
  before(done => {
    deleteAllCookies();
    done();
  });
  describe(' HTZ & TM', () => {
    describe( ' An anonymous user', () => {

      before(done => {
        deleteAllCookies();
        CookieData.htzAnonCookie.split(';').map(cookie => document.cookie = cookie);
        user = new User(globalConfig);
        done();
      });
      it( 'should not throw an error', () => {
        expect( user ).to.not.throw;
      } );

      it( 'should be a object', () => {
        expect( user ).to.be.an('object');
      } );

      it( 'should have a user type string property ', () => {
        expect( user.type ).to.be.a('string') && expect( user.type ).to.not.be.an('undefined');
      } );

      it( 'should have an impression manager initialized ', () => {
        expect( user.impressionManager ).to.be.an('object');
      } );

      it( 'can never have an age property', () => {
        expect( user.age ).to.be.an('undefined');
      } );

      it( 'can never have a gender property', () => {
        expect( user.gender ).to.be.an('undefined')
      } );
    });

    describe( ' Registered user', () => {
      before(done => {
        deleteAllCookies();
        CookieData.htzRegisteredCookie.split(';').map(cookie => document.cookie = cookie);
        user = new User(globalConfig);
        done();
      });

      it( 'should not throw an error', () => {
        expect( user ).to.not.throw;
      } );

      it( 'should be a object', () => {
        expect( user ).to.be.an('object');
      } );

      it( 'should have a user type string property ', () => {
        expect( user.type ).to.be.a('string') && expect( user.type ).to.not.be.an('undefined');
      } );

      it( 'should have an impression manager initialized ', () => {
        expect( user.impressionManager ).to.be.an('object');
      } );

      it( 'should have an age property within 1-120', () => {
        expect( user.age ).to.be.within(1,120);
      } );

      it( 'should have an gender property that is either 1 or 2', () => {
        expect( user.gender ).to.be.oneOf([1,2]);
      } );
      });

    describe( ' Paying user', () => {

      before(done => {
        deleteAllCookies();
        CookieData.htzPayingCookie.split(';').map(cookie => document.cookie = cookie);
        user = new User(globalConfig);
        done();
      });

      it( 'should not throw an error', () => {
        expect( user ).to.not.throw;
      } );

      it( 'should be a object', () => {
        expect( user ).to.be.an('object');
      } );

      it( 'should have a user type string property ', () => {
        expect( user.type ).to.be.a('string') && expect( user.type ).to.not.be.an('undefined');
      } );

      it( 'should have an impression manager initialized ', () => {
        expect( user.impressionManager ).to.be.an('object');
      } );

      it( 'should have an age property within 1-120', () => {
        expect( user.age ).to.be.within(1,120);
      } );

      it( 'should have an gender property that is either 1 or 2', () => {
        expect( user.gender ).to.be.oneOf([1,2]);
      } );
    });

  });
  describe(' HDC', () => {
    describe( ' Anonymous user', () => {

      before(done => {
        deleteAllCookies();
        CookieData.hdcAnonCookie.split(';').map(cookie => document.cookie = cookie);
        user = new User(globalConfig);
        done();
      });
      it( 'should not throw an error', () => {
        expect( user ).to.not.throw;
      } );

      it( 'should be a object', () => {
        expect( user ).to.be.an('object');
      } );

      it( 'should have a user type string property ', () => {
        expect( user.type ).to.be.a('string') && expect( user.type ).to.not.be.an('undefined');
      } );

      it( 'should have an impression manager initialized ', () => {
        expect( user.impressionManager ).to.be.an('object');
      } );

      it( 'can never have an age property', () => {
        expect( user.age ).to.be.an('undefined');
      } );

      it( 'can never have a gender property', () => {
        expect( user.gender ).to.be.an('undefined')
      } );
    });

    describe( 'Registered user', () => {

      before(done => {
        deleteAllCookies();
        CookieData.hdcRegisteredCookie.split(';').map(cookie => document.cookie = cookie);
        user = new User(globalConfig);
        done();
      });
      it( 'should not throw an error', () => {
        expect( user ).to.not.throw;
      } );

      it( 'should be a object', () => {
        expect( user ).to.be.an('object');
      } );

      it( 'should have a user type string property ', () => {
        expect( user.type ).to.be.a('string') && expect( user.type ).to.not.be.an('undefined');
      } );

      it( 'should have an impression manager initialized ', () => {
        expect( user.impressionManager ).to.be.an('object');
      } );

      it( 'should have an age property within 1-120', () => {
        expect( user.age ).to.be.within(1,120);
      } );

      it( 'should have an gender property that is either 1 or 2', () => {
        expect( user.gender ).to.be.oneOf([1,2]);
      } );
    });

    describe( 'Paying user', () => {

      before(done => {
        deleteAllCookies();
        CookieData.hdcPayingCookie.split(';').map(cookie => document.cookie = cookie);
        user = new User(globalConfig);
        done();
      });
      it( 'should not throw an error', done => {
        expect( user ).to.not.throw;
        done();
      } );

      it( 'should be a object', done => {
        expect( user ).to.be.an('object');
        done();
      } );

      it( 'should have a user type string property ', () => {
        expect( user.type ).to.be.a('string');
      } );

      it( 'should have an impression manager initialized ', () => {
        expect( user.impressionManager ).to.be.an('object');
      } );

      it( 'should have an age property within 1-120', () => {
        expect( user.age ).to.be.within(1,120);
      } );

      it( 'should have an gender property that is either 1 or 2', () => {
        expect( user.gender ).to.be.oneOf([1,2]);
      } );

    });
  });
});
