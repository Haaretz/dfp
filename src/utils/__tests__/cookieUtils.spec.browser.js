import getCookieAsMap, { ssoKey } from '../../utils/cookieUtils';
import CookieData from './cookieData.mock'

describe( 'cookieUtilModule', () => {
  describe('HTZ & TM tests', () => {
    let ssoKey;
    before(() => {
      ssoKey = 'tmsso'; //TODO mock proper test environment
    });
    describe( 'Anonymous user cookie', () => {
      before(() => {
        deleteAllCookies();
        CookieData.htzAnonCookie.split(';').map(cookie => document.cookie = cookie)
      });
      it( 'should not throw an error', () => {
        expect( getCookieAsMap ).to.not.throw;
      } );

      it( 'should be a function', () => {
        expect( getCookieAsMap ).to.be.a.function;
      } );

      it( 'should parse a regular cookie correctly', () => {
        let map = getCookieAsMap();
        expect( map ).to.be.a.object;
      } );

      it( `should not have an ${ssoKey} key`, () => {
        let map = getCookieAsMap();
        expect( map[ssoKey] ).to.be.undefined;
      } );
    });

    describe( 'Registered user cookie', () => {
      let map, ssoMap, ssoKey = 'tmsso'; //TODO mock proper test environment
      before(() => {
        deleteAllCookies();
        CookieData.htzRegisteredCookie.split(';').map(cookie => document.cookie = cookie)
        map = getCookieAsMap();
        ssoMap = map[ssoKey];
      });

      it( 'should not throw an error', () => {
        expect( getCookieAsMap ).to.not.throw;
      } );

      it( 'should be a function', () => {
        expect( getCookieAsMap ).to.be.a.function;
      } );

      it( 'should parse a valid cookie correctly', () => {
        expect( map ).to.be.a.object;
      } );

      it( 'parsed map should contain a valid cookie correctly', () => {
        expect( map[ssoKey] ).to.be.a.object;
      } );
      describe( `'${ssoKey}' map`, () => {
        let ssoMap;
        before(() => {
          ssoMap = getCookieAsMap(ssoKey)[ssoKey];
        });
        it( 'should have a userId', () => {
          expect( ssoMap.userId).to.equal('8738500615');
        } );
        it( 'should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        } );
      });
    });

    describe( 'Paying user cookie', () => {
      let map, ssoMap, ssoKey = 'tmsso'; //TODO mock proper test environment
      before(() => {
        deleteAllCookies();
        CookieData.htzPayingCookie.split(';').map(cookie => document.cookie = cookie);
        map = getCookieAsMap();
        ssoMap = getCookieAsMap(ssoKey)[ssoKey];
      });

      it( 'should not throw an error', () => {
        expect( getCookieAsMap ).to.not.throw;
      } );

      it( 'should be a function', () => {
        expect( getCookieAsMap ).to.be.a.function;
      } );

      it( 'should parse a valid cookie correctly', () => {
        expect( map ).to.be.a.object;
      } );

      it( 'parsed map should contain a valid ssoMap', () => {
        expect( map[ssoKey] ).to.be.a.object;
      } );

      it( 'should contain the HtzPusr key', () => {
        expect(map).to.contain.all.keys(['HtzPusr']);
      } );

      describe( `'${ssoKey}' map`, () => {
        it( 'should have a userId = 3057469657', () => {
          expect( ssoMap.userId).to.equal('3057469657');
        } );
        it( 'should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        } );
      });
    });

  });

  describe(' HDC tests ', () => {
    let map, ssoMap, ssoKey = 'engsso'; //TODO mock proper test environment
    describe( 'Anonymous user cookie', () => {
      before(() => {
        deleteAllCookies();
        CookieData.hdcAnonCookie.split(';').map(cookie => document.cookie = cookie)
        map = getCookieAsMap(ssoKey);
        ssoMap = getCookieAsMap(ssoKey)[ssoKey];
      });
      it( 'should not throw an error', () => {
        expect( getCookieAsMap ).to.not.throw;
      } );

      it( 'should be a function', () => {
        expect( getCookieAsMap ).to.be.a.function;
      } );

      it( 'should parse a regular cookie correctly', () => {
        expect( map ).to.be.a.object;
      } );

      it( `should not have an ${ssoKey} key`, () => {
        expect( map[ssoKey] ).to.be.undefined;
      } );
    });

    describe( 'Registered user cookie', () => {
      let map, ssoMap, ssoKey = 'engsso'; //TODO mock proper test environment
      before(() => {
        deleteAllCookies();
        CookieData.hdcRegisteredCookie.split(';').map(cookie => document.cookie = cookie)
        map = getCookieAsMap(ssoKey);
        ssoMap = getCookieAsMap(ssoKey)[ssoKey];
      });

      it( 'should not throw an error', () => {
        expect( getCookieAsMap ).to.not.throw;
      } );

      it( 'should be a function', () => {
        expect( getCookieAsMap ).to.be.a.function;
      } );

      it( 'should parse a valid cookie correctly', () => {
        let map = getCookieAsMap();
        expect( map ).to.be.a.object;
      } );

      it( 'parsed map should contain a valid cookie correctly', () => {
        let map = getCookieAsMap();
        expect( map[ssoKey] ).to.be.a.object;
      } );
      describe( `'${ssoKey}' map`, () => {
        let map, ssoMap, ssoKey = 'engsso'; //TODO mock proper test environment
        before(() => {
          map = getCookieAsMap(ssoKey);
          ssoMap = getCookieAsMap(ssoKey)[ssoKey];
        });
        it( 'should have a userId', () => {
          expect( ssoMap.userId).to.equal('8738500615');
        } );
        it( 'should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        } );
      });
    });

    describe( 'Paying user cookie', () => {
      let map, ssoMap, ssoKey = 'engsso'; //TODO mock proper test environment
      before(() => {
        deleteAllCookies();
        CookieData.hdcPayingCookie.split(';').map(cookie => document.cookie = cookie);
        map = getCookieAsMap(ssoKey);
        ssoMap = getCookieAsMap(ssoKey)[ssoKey];
      });

      it( 'should not throw an error', () => {
        expect( getCookieAsMap ).to.not.throw;
      } );

      it( 'should be a function', () => {
        expect( getCookieAsMap ).to.be.a.function;
      } );

      it( 'should parse a valid cookie correctly', () => {
        expect( map ).to.be.a.object;
      } );

      it( 'parsed map should contain a valid ssoMap', () => {
        expect( map[ssoKey] ).to.be.a.object;
      } );

      it( 'should contain the HdcPusr key', () => {
        expect(map).to.contain.all.keys(['HdcPusr']);
      } );

      describe( `'${ssoKey}' map`, () => {
        it( 'should have a userId = 3057469657', () => {
          expect( ssoMap.userId).to.equal('3057469657');
        } );
        it( 'should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        } );
      });
    });
  });

} );


//Delete all cookies helper for testing purposes
function deleteAllCookies() {
  document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" +
        new Date().toUTCString() + ";path=/"); });
}
