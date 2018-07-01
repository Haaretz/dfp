/* global googletag */
import AdSlot from '../adSlot';
import { adTargets, adTypes } from '../adManager';
import User from '../user';
import globalConfigMock from '../../__tests__/globalConfig.mock';

describe('adSlot', () => {
  let adSlot;
  before(() => {
    googletag.destroySlots();
    adSlot = definePlazmaSlot();
  });

  it('should throw an error if no id param is passed', () => {
    expect(defineSlotWithoutAnId).to.throw(Error);
  });

  it('should not throw an error on a well defined adSlot', () => {
    googletag.destroySlots(); // We must destroy the slot in order for 'this.defineSlot' to pass;
    expect(definePlazmaSlot).to.not.throw(Error);
  });

  it('should be a object', () => {
    expect(adSlot).to.be.an('object');
  });

  it('should have a configuration ', () => {
    expect(adSlot.config).to.be.an('object');
  });

  describe('adSlot properties', () => {
    it('should have a configuration ', () => {
      expect(adSlot.config).to.be.an('object');
    });

    // Part I : Markup configuration - passed from AdManager

    it('should have a id ', () => {
      expect(adSlot.id).to.be.a('string');
    });

    it('should have a target that is one of \'adTargets\' ', () => {
      expect(adSlot.target).to.be.oneOf(Object.values(adTargets));
    });

    it('should have a type that is one of \'adTypes\' ', () => {
      expect(adSlot.type).to.be.oneOf(Object.values(adTypes));
    });

    it('should have a \'responsive\' flag (boolean) ', () => {
      expect(adSlot.responsive).to.be.a('boolean');
    });

    it('should have a configuration ', () => {
      expect(adSlot.user).to.be.an('object');
    });

    // Part II : Global, general ad configuration - passed from AdManager

    it('should have a department property ', () => {
      expect(adSlot.department).to.be.a('string');
    });

    it('should have a network property ', () => {
      expect(adSlot.network).to.be.a('number');
    });

    it('should have an adUnitBase property ', () => {
      expect(adSlot.adUnitBase).to.be.a('string');
    });

    // Part III : ad specific configuration - passed from globalConfig.adSlotConfig

    it('should have an adSizeMapping property ', () => {
      expect(adSlot.adSizeMapping).to.be.an('array');
    });

    it('should have an responsiveAdSizeMapping property ', () => {
      expect(adSlot.responsiveAdSizeMapping).to.be.an('object');
    });

    it('should have an blacklistReferrers property ', () => {
      expect(adSlot.blacklistReferrers).to.be.an('array');
    });

    it('should have an whitelistReferrers property ', () => {
      expect(adSlot.whitelistReferrers).to.be.an('array');
    });

    // Part IV : Runtime configuration - calculated data - only present in runtime
    it('should not have initialized the lastResolvedSize property ', () => {
      expect(adSlot.lastResolvedSize).to.be.undefined();
    });

    it('should not have initialized the lastResolvedWithBreakpoint property ', () => {
      expect(adSlot.lastResolvedWithBreakpoint).to.be.undefined();
    });

    describe('slot property', () => {
      it('should have a slot property ', () => {
        expect(adSlot.slot).to.be.an('object');
      });
    });
  });

  describe('adSlot functions', () => {
    describe('isOutOfPage', () => {
      let stub;
      const adExamples = {
        maavaron: 'haaretz.co.il.web.maavaron.',
        popunder: 'haaretz.co.il.web.popunder',
        talkback: 'haaretz.co.il.web.fullbanner.talkback',
        regular: 'haaretz.co.il.web.marketing.promotional_madrid.left_text3',
      };
      before(() => {
        stub = sinon.stub();
        stub.withArgs(undefined).throws();
        stub.withArgs(adExamples.maavaron).returns(true);
        stub.withArgs(adExamples.popunder).returns(true);
        stub.withArgs(adExamples.talkback).returns(true);
        stub.withArgs(adExamples.regular).returns(false);
        stub.withArgs('random.data.ad.id').returns(false);
      });

      it('should be a function ', () => {
        expect(adSlot.isOutOfPage).to.be.a('function');
      });

      it('should return a boolean ', () => {
        expect(adSlot.isOutOfPage()).to.be.a('boolean');
      });

      it('should throw for an undefined argument ', () => {
        expect(() => { stub(undefined); }).to.throw(Error);
      });

      it(`should return true for an adSlotId that contains ${adTypes.maavaron} `, () => {
        expect(stub(adExamples.maavaron)).to.equal(true);
      });

      it(`should return true for an adSlotId that contains ${adTypes.popunder} `, () => {
        expect(stub(adExamples.popunder)).to.equal(true);
      });

      it(`should return true for an adSlotId that contains ${adTypes.talkback} `, () => {
        expect(stub(adExamples.talkback)).to.equal(true);
      });

      it('should return false for any other adSlotId ', () => {
        expect(stub(adExamples.regular)).to.equal(false)
        && expect(stub('random.data.ad.id')).to.equal(false);
      });
    });

    describe('isMaavaron', () => {
      let stub;
      const adExamples = {
        maavaron: 'haaretz.co.il.web.maavaron.',
        popunder: 'haaretz.co.il.web.popunder',
        talkback: 'haaretz.co.il.web.fullbanner.talkback',
        regular: 'haaretz.co.il.web.marketing.promotional_madrid.left_text3',
      };
      before(() => {
        stub = sinon.stub();
        stub.withArgs(undefined).throws();
        stub.withArgs(adExamples.maavaron).returns(true);
        stub.withArgs(adExamples.popunder).returns(false);
        stub.withArgs(adExamples.talkback).returns(false);
        stub.withArgs(adExamples.regular).returns(false);
        stub.withArgs('random.data.ad.id').returns(false);
      });

      it('should be a function ', () => {
        expect(adSlot.isMaavaron).to.be.a('function');
      });

      it('should return a boolean ', () => {
        expect(adSlot.isMaavaron()).to.be.a('boolean');
      });

      it('should throw for an undefined argument ', () => {
        expect(() => { stub(undefined); }).to.throw(Error);
      });

      it(`should return true for an adSlotId that contains ${adTypes.maavaron} `, () => {
        expect(stub(adExamples.maavaron)).to.equal(true);
      });

      it(`should return true for an adSlotId that contains ${adTypes.popunder} `, () => {
        expect(stub(adExamples.popunder)).to.equal(false);
      });

      it(`should return true for an adSlotId that contains ${adTypes.talkback} `, () => {
        expect(stub(adExamples.talkback)).to.equal(false);
      });

      it('should return false for any other adSlotId ', () => {
        expect(stub(adExamples.regular)).to.equal(false)
        && expect(stub('random.data.ad.id')).to.equal(false);
      });
    });

    describe('isWhitelisted', () => {
      it('should be a function ', () => {
        expect(adSlot.isWhitelisted).to.be.a('function');
      });

      it('should return a boolean ', () => {
        expect(adSlot.isWhitelisted()).to.be.a('boolean');
      });
    });

    describe('isBlacklisted', () => {
      it('should be a function ', () => {
        expect(adSlot.isBlacklisted).to.be.a('function');
      });

      it('should return a boolean ', () => {
        expect(adSlot.isBlacklisted()).to.be.a('boolean');
      });
    });

    describe('show', () => {
      it('should be a function ', () => {
        expect(adSlot.show).to.be.a('function');
      });
    });

    describe('defineSlot', () => {
      it('should be a function ', () => {
        expect(adSlot.defineSlot).to.be.a('function');
      });
    });

    describe('getPath', () => {
      it('should be a function ', () => {
        expect(adSlot.getPath).to.be.a('function');
      });

      it('should return a string ', () => {
        expect(adSlot.getPath()).to.be.a('string');
      });

      it('should be a valid path ', () => {
        expect(adSlot.getPath()).to.equal(
          '/9401/haaretz.co.il_web/haaretz.co.il.web.plazma/haaretz.co.il.web.plazma_homepage',
        );
      });
    });

    describe('slotRendered', () => {
      it('should be a function ', () => {
        expect(adSlot.slotRendered).to.be.a('function');
      });
    });

    describe('refresh', () => {
      it('should be a function ', () => {
        expect(adSlot.refresh).to.be.a('function');
      });
    });

    describe('defineMaavaron', () => {
      it('should be a function ', () => {
        expect(adSlot.defineMaavaron).to.be.a('function');
      });
    });
  });
});


function definePlazmaSlot() {
  const user = new User(globalConfigMock.userConfig);
  const adSlotConfig = Object.assign({},
    globalConfigMock.adSlotConfig['haaretz.co.il.web.plazma'], {
      id: 'haaretz.co.il.web.plazma',
      target: 'all',
      type: '',
      responsive: true,
      user,
      department: globalConfigMock.department,
      network: globalConfigMock.adManagerConfig.network,
      adUnitBase: globalConfigMock.adManagerConfig.adUnitBase,
    });
  return new AdSlot(adSlotConfig);
}

function defineSlotWithoutAnId() {
  const user = new User(globalConfigMock.userConfig);
  const adSlotConfig = Object.assign({},
    globalConfigMock.adSlotConfig['haaretz.co.il.web.plazma'], {
      id: undefined,
      target: 'all',
      type: '',
      responsive: true,
      user,
      department: globalConfigMock.department,
      network: globalConfigMock.adManagerConfig.network,
      adUnitBase: globalConfigMock.adManagerConfig.adUnitBase,
    });
  return new AdSlot(adSlotConfig);
}
