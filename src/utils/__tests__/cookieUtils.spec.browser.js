/* eslint-disable no-shadow */
import getCookieAsMap from '../../utils/cookieUtils';
import CookieData from './cookieData.mock';

describe('cookieUtilModule', function initCookie() {
  this.timeout(1000);
  describe('HTZ & TM tests', () => {
    let ssoKey;
    before(() => {
      ssoKey = 'tmsso';
    });
    describe('Anonymous user cookie', () => {
      before(done => {
        deleteAllCookies();
        CookieData.htzAnonCookie.split(';').map(cookie => {
          document.cookie = cookie;
          return document.cookie;
        });
        done();
      });
      it('should not throw an error', () => {
        expect(getCookieAsMap).to.not.throw();
      });

      it('should be a function', () => {
        expect(getCookieAsMap).to.be.a('function');
      });

      it('should parse a regular cookie correctly', () => {
        const map = getCookieAsMap();
        expect(map).to.be.an('object');
      });

      it(`should not have an ${ssoKey} key`, () => {
        const map = getCookieAsMap();
        expect(map[ssoKey]).to.be.an('undefined');
      });
    });

    describe('Registered user cookie', () => {
      let map;
      const ssoKey = 'tmsso';
      before(done => {
        deleteAllCookies();
        CookieData.htzRegisteredCookie.split(';').map(cookie => {
          document.cookie = cookie;
          return document.cookie;
        });
        map = getCookieAsMap();
        done();
      });

      it('should not throw an error', () => {
        expect(getCookieAsMap).to.not.throw();
      });

      it('should be a function', () => {
        expect(getCookieAsMap).to.be.a('function');
      });

      it('should parse a valid cookie correctly', () => {
        expect(map).to.be.an('object');
      });

      it('parsed map should contain a valid cookie correctly', () => {
        expect(map[ssoKey]).to.not.be.a('string') && expect(map[ssoKey]).to.be.an('object');
      });
      describe(`'${ssoKey}' map`, () => {
        let ssoMap;
        before(done => {
          map = getCookieAsMap();
          ssoMap = map[ssoKey];
          done();
        });
        it('should have a userId', () => {
          expect(ssoMap.userId).to.equal('8738500615');
        });
        it('should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        });
      });
    });

    describe('Paying user cookie', () => {
      let map;
      let ssoMap;
      const ssoKey = 'tmsso';
      before(done => {
        deleteAllCookies();
        CookieData.htzPayingCookie.split(';').map(cookie => {
          document.cookie = cookie;
          return document.cookie;
        });
        map = getCookieAsMap();
        ssoMap = map[ssoKey];
        done();
      });

      it('should not throw an error', () => {
        expect(getCookieAsMap).to.not.throw();
      });

      it('should be a function', () => {
        expect(getCookieAsMap).to.be.a('function');
      });

      it('should parse a valid cookie correctly', () => {
        expect(map).to.be.an('object');
      });

      it('parsed map should contain a valid ssoMap', () => {
        expect(map[ssoKey]).to.be.an('object');
      });

      it('should contain the HtzPusr key', () => {
        expect(map).to.contain.all.keys(['HtzPusr']);
      });

      describe(`'${ssoKey}' map`, () => {
        it('should have a userId = 3057469657', () => {
          expect(ssoMap.userId).to.equal('3057469657');
        });
        it('should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        });
      });
    });
  });

  describe('HDC tests', () => {
    let map;
    const ssoKey = 'engsso';
    describe('Anonymous user cookie', () => {
      before(done => {
        deleteAllCookies();
        CookieData.hdcAnonCookie.split(';').map(cookie => {
          document.cookie = cookie;
          return document.cookie;
        });
        map = getCookieAsMap();
        // ssoMap = map[ssoKey];
        done();
      });
      it('should not throw an error', () => {
        expect(getCookieAsMap).to.not.throw();
      });

      it('should be a function', () => {
        expect(getCookieAsMap).to.be.a('function');
      });

      it('should parse a regular cookie correctly', () => {
        expect(map).to.be.an('object');
      });

      it(`should not have an ${ssoKey} key`, () => {
        expect(map[ssoKey]).to.be.an('undefined');
      });
    });

    describe('Registered user cookie', () => {
      const ssoKey = 'engsso';
      before(done => {
        deleteAllCookies();
        CookieData.hdcRegisteredCookie.split(';').map(cookie => {
          document.cookie = cookie;
          return document.cookie;
        });
        map = getCookieAsMap();
        done();
      });

      it('should not throw an error', () => {
        expect(getCookieAsMap).to.not.throw();
      });

      it('should be a function', () => {
        expect(getCookieAsMap).to.be.a('function');
      });

      it('should parse a valid cookie correctly', () => {
        const map = getCookieAsMap();
        expect(map).to.be.an('object');
      });

      it('parsed map should contain a valid cookie correctly', () => {
        const map = getCookieAsMap();
        expect(map[ssoKey]).to.be.an('object');
      });
      describe(`'${ssoKey}' map`, () => {
        let ssoMap;
        const ssoKey = 'engsso';
        before(done => {
          map = getCookieAsMap();
          ssoMap = getCookieAsMap()[ssoKey];
          done();
        });
        it('should have a userId', () => {
          expect(ssoMap.userId).to.equal('8738500615');
        });
        it('should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        });
      });
    });

    describe('Paying user cookie', () => {
      let map;
      let ssoMap;
      const ssoKey = 'engsso';
      before(done => {
        deleteAllCookies();
        CookieData.hdcPayingCookie.split(';').map(cookie => {
          document.cookie = cookie;
          return document.cookie;
        });
        map = getCookieAsMap();
        ssoMap = getCookieAsMap()[ssoKey];
        done();
      });

      it('should not throw an error', () => {
        expect(getCookieAsMap).to.not.throw();
      });

      it('should be a function', () => {
        expect(getCookieAsMap).to.be.a('function');
      });

      it('should parse a valid cookie correctly', () => {
        expect(map).to.be.an('object');
      });

      it('parsed map should contain a valid ssoMap', () => {
        expect(map[ssoKey]).to.be.an('object');
      });

      it('should contain the HdcPusr key', () => {
        expect(map).to.contain.all.keys(['HdcPusr']);
      });

      describe(`'${ssoKey}' map`, () => {
        it('should have a userId = 3057469657', () => {
          expect(ssoMap.userId).to.equal('3057469657');
        });
        it('should contain the following keys: userId, userName, firstName, lastName', () => {
          expect(ssoMap).to.contain.all.keys(['userId', 'userName', 'firstName', 'lastName']);
        });
      });
    });
  });
  after(done => {
    deleteAllCookies();
    done();
  });
});

// Delete all cookies helper for testing purposes
export function deleteAllCookies() {
  document.cookie.split(';').forEach((c) => {
    document.cookie = c.replace(/^ +/, '')
      .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
  });
}
export default deleteAllCookies();
