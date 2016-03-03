import DFP from '../../src/index';
import { ssoKey } from '../utils/cookieUtils';
import globalConfig from './globalConfig.mock';

describe( 'DFP - unit tests for browser', () => {
  let dfp;
  before(() => {
    dfp = new DFP(globalConfig); //DFP is now a singleton
  });

  it( 'should not throw an error', () => {
    expect( dfp ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( dfp ).to.be.a.object;
  } );


  describe( 'configuration' , () => {
    it( 'should have a configuration ', () => {
      expect( dfp.config ).to.be.a.object;
    } );

    it( 'should have an sso declaration inside of the configuration ', () => {
      expect( dfp.config.sso ).to.be.a.string;
    } );

    it( `should have an sso value of '${ssoKey}' `, () => {
      expect( dfp.config.sso ).to.equal(ssoKey);
    } );
  });

  describe('dfp init', () => {
    let promise;
    before(() => {
      promise = dfp.initGoogleTag();
    });

    it(' should load the google tag script correctly ', () => {
      promise.then(() => {
        expect( window.googletag && window.googletag.apiReady == true ).to.be.true;
      })
    });

    it(' should not break on multiple calls to initGoogleTag', () => {
      dfp.initGoogleTag().then(() => {
        expect( window.googletag && window.googletag.apiReady == true ).to.be.true;
      })
    });

    it(' should have a single adManager', () => {
      dfp.initGoogleTag().then(() => {
        expect( dfp.adManager ).to.be.a.object;
      })
    })

  });
} );
