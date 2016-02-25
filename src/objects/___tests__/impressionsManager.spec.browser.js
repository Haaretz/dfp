import ImpressionsManager from '../../objects/impressionsManager';
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

const globalConfig = {};
Object.keys(adUnitsFrequencyMap).map(function(key, index) {
  globalConfig[key] = adUnitsFrequencyMap[key];
});

describe( 'impressionsManager', () => {
  let impressionsManager;
  before(() => {
    impressionsManager = new ImpressionsManager(globalConfig);
  });

  it( 'should not throw an error', () => {
    expect( impressionsManager ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( impressionsManager ).to.be.a.object;
  } );

  it( 'should have a configuration ', () => {
    expect( impressionsManager.config ).to.be.a.object;
  } );

  it( 'should have initialized the impressions object', () => {
    expect( impressionsManager.impressions ).to.be.a.object;
  } );

  //it( 'should have initialized the impressions object for each slot ', () => {
  //  expect( impressionsManager.impressions ).to.be.a.object;
  //} );

  describe( 'impressionsManager.impressions', () => {
    it( 'should have initial configuration for each slot ', () => {
      expect( impressionsManager.impressions ).to.be.a.object;
    } );

    Object.keys( globalConfig ).map(function(key, index) {
      describe( `slot configuration for slot: ${key}` , () => {
        it( `should have initial configuration for slot`, () => {
          expect( impressionsManager.impressions[key] ).to.be.a.object;
        } );
        it( `should have a frequency`, () => {
          expect( impressionsManager.impressions[key]['frequency'] ).to.be.a.string;
        } );
        it( `should have an expiry date`, () => {
          expect( impressionsManager.impressions[key]['expires'] ).to.be.a.number;
        } );
        it( `should have an 'exposed' counter `, () => {
          expect( impressionsManager.impressions[key]['frequency'] ).to.be.a.number;
        } );
      });
    });
    it( 'should have initial configuration for each slot ', () => {
      expect( impressionsManager.impressions ).to.be.a.object;
    } );
  })
} );
