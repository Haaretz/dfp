import DFP, { version } from '../index';
import globalConfig from './globalConfig.mock';

describe('DFP - unit tests for browser', () => {
  let dfp;
  let spy;
  before(() => {
    dfp = new DFP(globalConfig);
    // Bind Global
    spy = sinon.spy(dfp, 'resumeInit');

    // window.dfp = dfp;
  });

  it('should not throw an error', () => {
    expect(() => { new DFP(globalConfig); }).to.not.throw(Error); // eslint-disable-line no-new
  });

  it('should be a object', () => {
    expect(dfp).to.be.an('object');
  });

  describe(' DFP properties ', () => {
    describe('configuration', () => {
      it('should have a configuration ', () => {
        expect(dfp.config).to.be.an('object');
      });
    });

    describe('version', () => {
      it('should have a version ', () => {
        expect(version).to.be.a('string');
      });
    });
  });

  describe(' DFP functions ', () => {
    it('should have the \'resumeInit\' function', () => {
      expect(dfp.resumeInit).to.be.a('function');
    });

    it('should have the \'initGoogleTag\' function', () => {
      expect(dfp.initGoogleTag).to.be.a('function');
    });

    it('should have the \'isGoogleTagReady\' function', () => {
      expect(dfp.isGoogleTagReady).to.be.a('function');
    });

    it('should have the \'initWindowResizeListener\' function', () => {
      expect(dfp.initWindowResizeListener).to.be.a('function');
    });
  });


  describe('dfp init', () => {
    it(' should load the google tag script correctly ', cb);
    function cb(done) {
      this.timeout(4000);
      dfp.initGoogleTag().then(() => {
        expect(window.googletag).to.not.be.undefined();
        done();
      });
    }

    it(' should not break on multiple calls to initGoogleTag', done => {
      dfp.initGoogleTag().then(() => {
        expect(window.googletag).to.not.be.undefined();
        done();
      });
    });

    it(' should call the \'resumeInit()\' function only once. ', done => {
      expect(spy.calledOnce).to.be.true();
      done();
    });

    it(' should not call the \'resumeInit()\' function twice. ', done => {
      expect(spy.calledTwice).to.be.false();
      done();
    });
    // eslint-disable-next-line no-shadow
    it(' should have a single adManager', function cb(done) {
      this.timeout(4000);
      dfp.initGoogleTag().then(() => {
        expect(dfp.adManager).to.be.an('object');
        done();
      });
    });
    after(() => {
      window.dfp = dfp;
    });
  });
});
