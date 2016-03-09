import DFP from '../index';
import globalConfig from './globalConfig.mock';

describe( 'DFP - unit tests for browser', () => {
  let dfp, spy;
  before(() => {
    dfp = new DFP(globalConfig);
    //Bind Global
    spy = sinon.spy(dfp,"resumeInit");

    //window.dfp = dfp;
  });

  it( 'should not throw an error', () => {
    expect( dfp ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( dfp ).to.be.an('object');
  } );


  describe( 'configuration' , () => {
    it( 'should have a configuration ', () => {
      expect( dfp.config ).to.be.an('object');
    } );

    //it( 'should have an sso declaration inside of the configuration ', () => {
    //  expect( dfp.config.sso ).to.be.a('string');
    //} );
    //
    //it( `should have an sso value of '${ssoKey}' `, () => {
    //  expect( dfp.config.sso ).to.equal(ssoKey);
    //} );
  });

  describe('dfp init', () => {
    before(() => {

      setTimeout(() => {
        console.log(`window.googletag`,window.googletag,`window.googletag.apiReady`,window.googletag.apiReady);
      }, 500);
      setTimeout(() => {
        console.log(`window.googletag`,window.googletag,`window.googletag.apiReady`,window.googletag.apiReady);
      }, 1000);
      setTimeout(() => {
        console.log(`window.googletag`,window.googletag,`window.googletag.apiReady`,window.googletag.apiReady);
      }, 1500);
    });
    it(' should load the google tag script correctly ', function(done) {
      this.timeout(4000);
      dfp.initGoogleTag().then(() => {
        expect( window.googletag).to.not.be.undefined;
        done();
      });
    });

    it(' should not break on multiple calls to initGoogleTag', function(done) {
      dfp.initGoogleTag().then(() => {
        expect( window.googletag).to.not.be.undefined;
        done();
      });
    });

    it(` should call the 'resumeInit()' function only once. `, function(done) {
      expect( spy.calledOnce).to.be.true
      done();
    });

    it(` should not call the 'resumeInit()' function twice. `, function(done) {
      expect( spy.calledTwice).to.be.false;
      done();
    });
    it(' should have a single adManager', function(done) {
      this.timeout(4000);
      dfp.initGoogleTag().then(() => {
        console.log(`DFP`,dfp.adManager);
        expect( dfp.adManager ).to.be.an('object');
        console.log(`spy call count: ${spy.callCount}`);
        done();
      });
    });
    after(() => {
      window.dfp = dfp;
    })

  });
} );
