import ImpressionsManager, { keys } from '../impressionsManager';
import globalConfigMock from '../../__tests__/globalConfig.mock';

/*
 //from global binding
 var adUnitsFrequencyMap = {};
 adUnitsFrequencyMap['haaretz.co.il.web.halfpage.floating_x.section']  = '1/1day';
 adUnitsFrequencyMap['haaretz.co.il.web.ruler.hp']  = '1/1day';
 adUnitsFrequencyMap['haaretz.co.il.web.maavaron..all']  = '6/1day';
 adUnitsFrequencyMap['haaretz.co.il.web.inread.all']  = '5/1day';
 adUnitsFrequencyMap['haaretz.co.il.mobile_web.top.all']  = '2/1hour';
 adUnitsFrequencyMap['haaretz.co.il.web.popunder.all']  = '1/4hour';
 adUnitsFrequencyMap['haaretz.co.il.web.ruler.section']  = '1/1day';
 adUnitsFrequencyMap['haaretz.co.il.web.halfpage.floating_x.hp']  = '1/1day';
 adUnitsFrequencyMap['haaretz.co.il.mobile_web.maavaron1.section']  = '2/1hour';


 Object.keys(adUnitsFrequencyMap).map(function(key, index) {
 globalConfig[key] = adUnitsFrequencyMap[key];
 });
 */

const mock = {
  oldImpressions: 'haaretz.co.il.web.maavaron..all = 10/1457906399000;'
  + 'haaretz.co.il.web.popunder.all = 10/1457866799000;'
  + 'haaretz.co.il.web.ruler.section = 5/1457906399000;'
  + 'haaretz.co.il.web.halfpage.floating_x.hp = 7/1457906399000;'
  + 'haaretz.co.il.web.ruler.hp = 6/1457906399000;'
  + 'haaretz.co.il.web.inread.all = 3/1457906399000;'
  + 'haaretz.co.il.web.halfpage.floating_x.section = 2/1457906399000;'
  + 'haaretz.co.il.web.plazma.section = 1/1457279999000'
  + ';haaretz.co.il.mobile_web.top.all = 1/1457024399000;'
  + 'haaretz.co.il.web.slideshow_hp_picday.hp = 1/1457456399000;',
};

const { impressionManagerConfig } = globalConfigMock;
describe('impressionsManager', () => {
  let impressionsManager;
  before(() => {
    impressionsManager = new ImpressionsManager(impressionManagerConfig);
  });

  describe(' with a new user ', () => {
    before(() => {
      window.localStorage.clear();
      impressionsManager = new ImpressionsManager(impressionManagerConfig);
    });

    it('should not be undefined', () => {
      expect(impressionsManager).to.not.be.undefined();
    });

    it('should be a object', () => {
      expect(impressionsManager).to.be.an('object');
    });

    it('should have a configuration ', () => {
      expect(impressionsManager.config).to.be.an('object');
    });

    it('should have a \'now\' property ', () => {
      expect(impressionsManager.now).to.be.a('number');
    });

    describe('impressionsManager.migrateImpressionsData', () => {
      it('should retrieve an impression map regardless of localStorage data', () => {
        expect(impressionsManager.migrateImpressionsData()).to.be.an('object');
      });
    });

    describe('impressionsManager.impressions', () => {
      it('should have initial configuration for each slot ', () => {
        expect(impressionsManager.impressions).to.be.an('object');
      });

      Object.keys(impressionManagerConfig)
        .map((key, index) => describe(`slot configuration for slot: ${key}`, () => {
          it('should have initial configuration for slot', () => {
            expect(impressionsManager.impressions[key]).to.be.an('object');
          });
          it('should have a frequency', () => {
            expect(impressionsManager.impressions[key].frequency).to.be.a('string');
          });
          it('should have an expiry date', () => {
            expect(impressionsManager.impressions[key].expires).to.be.a('number');
          });
          it('should have an \'exposed\' counter ', () => {
            expect(impressionsManager.impressions[key].exposed).to.be.a('number');
          });
          it('should have a \'target\' property ', () => {
            expect(impressionsManager.impressions[key].target)
              .to.be.oneOf(['all', 'section', 'homepage']);
          });
        }));
    });

    describe('impressionsManager.reachedQuota', () => {
      it('should have the \'reachedQuota\' function ', () => {
        expect(impressionsManager.reachedQuota).to.be.a('function');
      });

      Object.keys(impressionManagerConfig)
        .map((key, index) => it(`should return a boolean for any adSlotId given.
         adSlotId: ${key}`, () => {
          const quota = impressionsManager.reachedQuota(key);
          expect(quota).to.be.a('boolean');
        }));

      it('should return false in case adSlotId passed was undefined', () => {
        const quota = impressionsManager.reachedQuota(undefined);
        expect(quota).to.be.false();
      });
    });

    describe('impressionsManager.registerImpression', () => {
      it('should have the \'registerImpression\' function ', () => {
        expect(impressionsManager.registerImpression).to.be.a('function');
      });

      Object.keys(impressionManagerConfig)
        .map((key, index) => it(`should return a boolean for any attempt to register an impression.
         checking adSlotId: ${key}`,
        () => {
          const result = impressionsManager.registerImpression(key);
          expect(result).to.be.a('boolean');
        }));

      it('should return false in case adSlotId passed was undefined', () => {
        const result = impressionsManager.registerImpression(undefined);
        expect(result).to.be.false();
      });
    });
  });

  describe('with an existing user (data migration) ', () => {
    before(done => {
      window.localStorage.clear();
      window.localStorage.setItem(keys.impressions, mock.oldImpressions);
      impressionsManager = new ImpressionsManager(impressionManagerConfig);
      done();
    });

    it('should not be undefined', () => {
      expect(impressionsManager).to.not.be.undefined();
    });

    it('should be a object', () => {
      expect(impressionsManager).to.be.an('object');
    });

    it('should have a configuration ', () => {
      expect(impressionsManager.config).to.be.an('object');
    });

    it('should have a \'now\' property ', () => {
      expect(impressionsManager.now).to.be.a('number');
    });

    describe('impressionsManager.impressions', () => {
      it('should have initial configuration for each slot ', () => {
        expect(impressionsManager.impressions).to.be.an('object');
      });

      Object.keys(impressionManagerConfig)
        .map((key, index) => describe(`slot configuration for slot: ${key}`, () => {
          it('should have initial configuration for slot', () => {
            expect(impressionsManager.impressions[key]).to.be.an('object');
          });
          it('should have a frequency', () => {
            expect(impressionsManager.impressions[key].frequency).to.be.a('string');
          });
          it('should have an expiry date', () => {
            expect(impressionsManager.impressions[key].expires).to.be.a('number');
          });
          it('should have an \'exposed\' counter ', () => {
            expect(impressionsManager.impressions[key].exposed).to.be.a('number');
          });
          it('should have a \'target\' property ', () => {
            expect(impressionsManager.impressions[key].target)
              .to.be.oneOf(['all', 'section', 'homepage']);
          });
        }));
    });


    describe('impressionsManager.reachedQuota', () => {
      it('should have the \'reachedQuota\' function ', () => {
        expect(impressionsManager.reachedQuota).to.be.a('function');
      });

      Object.keys(impressionManagerConfig)
        .map((key, index) => it(`should return a boolean for any adSlotId given. adSlotId: ${key}`,
          () => {
            const quota = impressionsManager.reachedQuota(key);
            expect(quota).to.be.a('boolean');
          }));


      it('should return false in case adSlotId passed was undefined', () => {
        const quota = impressionsManager.reachedQuota(undefined);
        expect(quota).to.be.false();
      });
    });

    describe('impressionsManager.registerImpression', () => {
      it('should have the \'registerImpression\' function ', () => {
        expect(impressionsManager.registerImpression).to.be.a('function');
      });

      Object.keys(impressionManagerConfig)
        .map((key, index) => it(`should return a boolean for an attempt to register an impression.
         checking adSlotId: ${key}`,
        () => {
          const result = impressionsManager.registerImpression(key);
          expect(result).to.be.a('boolean');
        }));

      it('should return false in case adSlotId passed was undefined', () => {
        const result = impressionsManager.registerImpression(undefined);
        expect(result).to.be.false();
      });
    });

    after(done => {
      window.localStorage.clear();
      done();
    });
  });
});
