import  AdManager, {userTypes, adTargets, adTypes } from '../../objects/adManager';
import globalConfigMock from '../../__tests__/globalConfig.mock';
import User from '../../objects/user';
import AdSlot from '../../objects/adSlot';
import DFP from '../../index';

const breakpoints = globalConfigMock.breakpointsConfig.breakpoints;

////TODO - create spy-able AdManager
//class AdManager2 extends AdManager {
//  constructor() {
//    this.initAdSlots = sinon.spy(super, 'initAdSlots');
//    super(config);
//
//  }
//}



describe( 'AdManager', () => {
  let adManager;
  let dfp;
  before(function(done) {
    dfp = new DFP(globalConfigMock);
    dfp.initGoogleTag().then(dfpInstance => {
      adManager = dfp.adManager;
      done();
    });
  });

  it( 'should not throw an error', () => {
    expect( () => { new AdManager(globalConfigMock) } ).to.not.throw(Error);
  } );

  it( 'should be a object', () => {
    expect( adManager ).to.be.an('object');
  } );

  describe(`adManager properties`, () => {

    before(function(done) {
      dfp.isGoogleTagReady().then(() => {
        done();
      })
    });

    it( 'should have a configuration ', () => {
      expect( adManager.config ).to.be.an('object');
    } );

    it( 'should have a user object ', () => {
      expect( adManager.user ).to.be.an('object');
    } );

    it( 'should have a conflict resolver object ', () => {
      expect( adManager.conflictResolver ).to.be.an('object');
    } );

    it( 'should have initialized the adSlots object ', () => {
      expect( adManager.adSlots ).to.be.an('array');
    } );
  });

  describe(`adManager functions`, () => {

    before(function(done) {
      dfp.isGoogleTagReady().then(dfpInstance => {
        done();
      })
    });

    describe(`initAdSlots`, () => {
      let spy;
      before(() => {
        spy = sinon.spy(adManager, 'initAdSlots');
      });

      it( `should have the 'initAdSlots' function`, () => {
        expect( adManager.initAdSlots ).to.be.a('function');
      } );

      it( 'should have initialized the adSlots object ', () => {
        expect( adManager.adSlots ).to.be.an('array');
      } );

      it( `should have sorted the adSlots based on its selector's offsetTop `, () => {
        let tmpSlots = JSON.parse(JSON.stringify(adManager.adSlots));
        function byOffsetTop(a,b) {
          a = document.getElementById(a.id);
          b = document.getElementById(b.id);
          return a.offsetTop - b.offsetTop
        }
        tmpSlots = tmpSlots.sort(byOffsetTop);

        expect( adManager.adSlots ).to.deep.equal(tmpSlots);
      } );

    });

    describe(`getAdType`, () => {
      let spy, stub, opts;
      let adExamples = {
        maavaron: 'haaretz.co.il.web.maavaron.',
        popunder: 'haaretz.co.il.web.popunder',
        talkback: 'haaretz.co.il.web.fullbanner.talkback',
        regular: 'haaretz.co.il.web.marketing.promotional_madrid.left_text3',
      };
      before(() => {
        spy = sinon.spy(adManager, 'getAdType'),
          stub = sinon.stub(),
          opts = { call: adSlotId => { spy(adSlotId)} };

        // We can control how the sinon.stub() will behave based on how it’s called!
        stub.withArgs(undefined).throws();
        stub.withArgs(adExamples.maavaron).returns(adTypes.maavaron);
        stub.withArgs(adExamples.popunder).returns(adTypes.popunder);
        stub.withArgs(adExamples.talkback).returns(adTypes.talkback);
        stub.withArgs(adExamples.regular).returns(adTypes.regular);
        stub.withArgs("random.data.ad.id").returns(adTypes.regular);
      });

      it( `should have the 'getAdType' function`, () => {
        expect( adManager.getAdType ).to.be.a('function');
      } );

      it( `should call the 'getAdType' function from 'adManager' `, () => {
        adManager.getAdType(adExamples.regular);
        expect( spy.called ).to.be.true;
      } );

      it( `should throw for an undefined argument `, () => {
        expect( () => { stub(undefined) } ).to.throw(Error);
      } );

      it( `should return adTypes.maavaron for an adSlotId that contains ${adTypes.maavaron} `, () => {
        expect( stub(adExamples.maavaron) ).to.equal(adTypes.maavaron);
      } );

      it( `should return adTypes.maavaron for an adSlotId that contains ${adTypes.popunder} `, () => {
        expect( stub(adExamples.popunder) ).to.equal(adTypes.popunder);
      } );

      it( `should return adTypes.maavaron for an adSlotId that contains ${adTypes.talkback} `, () => {
        expect( stub(adExamples.talkback) ).to.equal(adTypes.talkback);
      } );

      it( `should return adTypes.regular for an adSlotId that does not contains the other types`,
        () => {
        expect( stub(adExamples.regular) ).to.equal(adTypes.regular);
      } );

      it( `should return adTypes.regular for random args `, () => {
        expect( stub("random.data.ad.id") ).to.equal(adTypes.regular);
      } );

    });

    describe(`shouldSendRequestToDfp`, () => {
      let adSlot;
      before(() => {
        adSlot = definePlazmaSlot();
      });

      it( `should have the 'shouldSendRequestToDfp' function`, () => {
        expect( adManager.shouldSendRequestToDfp ).to.be.a('function');
      } );

      it( `should return a boolean`, () => {
        expect( adManager.shouldSendRequestToDfp(adSlot) ).to.be.a('boolean');
      } );
    });

    describe(`doesUserTypeMatchBannerTargeting`, () => {
      it( `should have the 'doesUserTypeMatchBannerTargeting' function`, () => {
        expect( adManager.doesUserTypeMatchBannerTargeting ).to.be.a('function');
      } );

      Object.keys( userTypes ).map(function(userType,index) {
        describe(`for user of type ${userType} `, () => {
          let adSlot;
          let results = {
            anonymous: [adTargets.all,adTargets.anonymous,adTargets.nonPaying],
            registered: [adTargets.all,adTargets.registered,adTargets.nonPaying],
            payer: [adTargets.all,adTargets.digitalOnly,adTargets.digitalAndPrint,adTargets.paying],
          };
          before(() => {
            adManager.user.type = userType;
            googletag.destroySlots();
          });
          afterEach(() => {
            googletag.destroySlots();
          });
          Object.keys( adTargets ).map(function(adTarget, index) {
            it(` should display an adSlot targeted at: '${adTarget}'` , () => {
              adSlot = definePromotionalMadridSlot(adTarget);
              const match = adManager.doesUserTypeMatchBannerTargeting(adSlot);
              const shouldMatch = results[userType].indexOf(adTarget) > -1;
              expect( match ).to.be.equal(shouldMatch);
            })
          });
        });
      });

    });

    describe(`switchedToBreakpoint`, () => {
      it( `should have the 'switchedToBreakpoint' function`, () => {
        expect( adManager.switchedToBreakpoint ).to.be.a('function');
      } );

      it( `should throw if a breakpoint is not being passed`, () => {
        expect( () => { adManager.switchedToBreakpoint() } ).to.throw(Error);
      } );

      Object.keys( breakpoints ).map(function(breakpoint, index) {
        const breakpointDescription = `${breakpoint}:${breakpoints[breakpoint]}`;
        it(` should return an integer on valid breakpoint input: '${breakpointDescription}'`,() => {
          expect( adManager.switchedToBreakpoint(breakpoints[breakpoint]) ).to.be.a('number');
        } );
      });


    });

    describe(`doesBreakpointContainAd`, () => {
      it( `should have the 'doesBreakpointContainAd' function`, () => {
        expect( adManager.doesBreakpointContainAd ).to.be.a('function');
      } );
    });

    describe(`initSlotRenderedCallback`, () => {
      it( `should have the 'initSlotRenderedCallback' function`, () => {
        expect( adManager.initSlotRenderedCallback ).to.be.a('function');
      } );
    });

    describe(`initGoogleTargetingParams`, () => {
      it( `should have the 'initGoogleTargetingParams' function`, () => {
        expect( adManager.initGoogleTargetingParams ).to.be.a('function');
      } );
    });

    describe(`initGoogleGlobalSettings`, () => {
      it( `should have the 'initGoogleGlobalSettings' function`, () => {
        expect( adManager.initGoogleGlobalSettings ).to.be.a('function');
      } );
    });


  });

  describe(`const exports`, () => {

    describe(`adTargets`, () => {
      const keys = ['all','nonPaying','anonymous','registered','paying',
        'digitalOnly','digitalAndPrint'];
      it( `should have all of the keys: ${keys}`, () => {
        expect( adTargets ).to.contain.all.keys(keys);
      } );
    });


    describe(`userTypes`, () => {
      const keys = ['anonymous','registered','payer'];
      it( `should have all of the keys: ${keys}`, () => {
        expect( userTypes ).to.contain.all.keys(keys);
      } );
    });

    describe(`adTypes`, () => {
      const keys = ['maavaron','popunder','talkback','regular'];
      it( `should have all of the keys: ${keys}`, () => {
        expect( adTypes ).to.contain.all.keys(keys);
      } );
    });

  });

} );

/**
 * Helper function to define a plazma slot
 * @returns {adSlot}
 */
function definePlazmaSlot() {
  const user = new User(globalConfigMock.userConfig);
  const adSlotConfig = Object.assign({},globalConfigMock.adSlotConfig["haaretz.co.il.web.plazma"],{
    id: "haaretz.co.il.web.plazma",
    target: "all",
    type: "",
    responsive: true,
    user: user,
    department: globalConfigMock.department,
    network: globalConfigMock.adManagerConfig.network,
    adUnitBase: globalConfigMock.adManagerConfig.adUnitBase,
  });
  return new AdSlot(adSlotConfig);
}

function definePromotionalMadridSlot(target) {
  const user = new User(globalConfigMock.userConfig);
  const adSlotConfig = Object.assign({},
    globalConfigMock.adSlotConfig["haaretz.co.il.web.marketing.promotional_madrid.left_text3"],{
    id: "haaretz.co.il.web.marketing.promotional_madrid.left_text3",
    target: target,
    type: "",
    responsive: true,
    user: user,
    department: globalConfigMock.department,
    network: globalConfigMock.adManagerConfig.network,
    adUnitBase: globalConfigMock.adManagerConfig.adUnitBase,
  });
  return new AdSlot(adSlotConfig);
}
