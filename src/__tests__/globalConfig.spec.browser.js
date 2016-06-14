import { ssoKey } from '../utils/cookieUtils';
import globalConfig from '../../src/globalConfig';

describe( 'globalConfig - unit tests for browser', () => {
  let config, keys;
  before(() => {
    config = globalConfig;
    keys = ['referrer', 'isMobile', 'isHomepage', 'department', 'path', 'environment', 'articleId',
      'utm_', 'adSlotConfig', 'adManagerConfig', 'breakpointsConfig', 'userConfig', 'sso'];
  });

  it( 'should not throw an error', () => {
    expect( config ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( config ).to.be.an('object');
  } );

  // Containment check
  it( `should have the following keys: ${keys}`, () => {
    expect( config ).to.contain.all.keys(keys);
  } );

  describe( 'referrer property' , () => {
    let referrer;
    before(() => {
      referrer = config.referrer;
    });

    it( 'should not be undefined', () => {
      expect( referrer ).to.not.be.an('undefined');
    } );

    it( 'should be a string', () => {
      expect( referrer ).to.be.a('string');
    } );

  });

  describe( 'isMobile property' , () => {
    let isMobile;
    before(() => {
      isMobile = config.isMobile;
    });

    it( 'should not be undefined', () => {
      expect( isMobile ).to.not.be.an('undefined');
    } );

    it( 'should be a boolean', () => {
      expect( isMobile ).to.be.a.boolean;
    } );

  });

  describe( 'isHomepage property' , () => {
    let isHomepage;
    before(() => {
      isHomepage = config.isHomepage;
    });

    it( 'should not be undefined', () => {
      expect( isHomepage ).to.not.be.an('undefined');
    } );

    it( 'should be a boolean', () => {
      expect( isHomepage ).to.be.a.boolean;
    } );

  });

  describe( 'department property' , () => {
    let department;
    before(() => {
      department = config.department;
    });

    it( 'should not be undefined', () => {
      expect( department ).to.not.be.an('undefined');
    } );

    it( 'should be a string', () => {
      expect( department ).to.be.a('string');
    } );

    it( 'should either be a homepage or a section', () => {
      expect( department ).to.be.oneOf(['_homepage', '_section']);
    } );

  });

  describe( 'domain property' , () => {
    let domain, keys = ['haaretz.com', 'haaretz.co.il', 'themarker.com', 'localhost', ''];
    before(() => {
      domain = config.domain;
    });

    it( 'should not be undefined', () => {
      expect( domain ).to.not.be.an('undefined');
    } );

    it( 'should be a string', () => {
      expect( domain ).to.be.a('string');
    } );

    it( `'should be one of the following keys: ${keys}`, () => {
      expect( domain ).to.be.oneOf(keys);
    } );

  });

  describe( 'path property' , () => {
    let path;
    before(() => {
      path = config.path;
    });

    it( 'should not be undefined', () => {
      expect( path ).to.not.be.an('undefined');
    } );

    it( 'should be an empty array', () => {
      expect( path ).to.be.a.array && expect( path ).to.be.empty;
    } );

  });

  describe( 'environment property' , () => {
    let environment, keys;
    before(() => {
      environment = config.environment;
      keys = [1,2,3,undefined];
    });

    it( `should be one of the following: ${keys}`, () => {
      expect( environment ).to.be.oneOf(keys);
    } );

  });

  describe( 'articleId property' , () => {
    let articleId;
    before(() => {
      articleId = config.articleId;
    });

    it( `should be either undefined or a string`, () => {
      expect( articleId ).to.be.undefined || expect( articleId ).to.be.a('string');
    } );

  });

  describe( 'utm_ property' , () => {
    let utm, keys = [];
    before(() => {
      utm = config.utm_;
      keys = ['content', 'source', 'medium', 'campaign', 'getUrlParam'];
    });

    it( `should have the following keys: ${keys}`, () => {
      expect( utm ).to.contain.all.keys(keys);
    } );

    it( `should have the 'getUrlParam' function`, () => {
      expect( utm.getUrlParam ).to.be.a('function');
    } );

    it( `should have a content property that is either undefined or a string`, () => {
      expect( utm.content ).to.be.undefined || expect( utm.content ).to.be.a('string');
    } );

    it( `should have a source property that is either undefined or a string`, () => {
      expect( utm.source ).to.be.undefined || expect( utm.source ).to.be.a('string');
    } );

    it( `should have a medium property that is either undefined or a string`, () => {
      expect( utm.medium ).to.be.undefined || expect( utm.medium ).to.be.a('string');
    } );

    it( `should have a campaign property that is either undefined or a string`, () => {
      expect( utm.campaign ).to.be.undefined || expect( utm.campaign ).to.be.a('string');
    } );

  });

  describe( 'gStat campaign property' , () => {
    before(() =>{
      localStorage.clear();
    });

    it( 'should not have a gStat campaign by default', () => {
      expect( config.gStatCampaignNumber ).to.be.an('undefined');
    });

    it( 'should have properly read the Campaign property from localStorage', done => {
      const item = {
        "lastModifiedDateTime": 1456977600000,
        "CampaignNumber": 6310
      };
      localStorage.setItem("GstatCampaign",JSON.stringify(item));
      done();
      expect( config.gStatCampaignNumber ).to.equal(6310);
    });

    after(() => {
      localStorage.clear();
    });
  });

  describe( 'adSlot configuration' , () => {
    let adSlotConfig, keys = [];
    before(() => {
      adSlotConfig = config.adSlotConfig;
      keys = ['network', 'adUnitBase']
    });

    it( 'should not be undefined', () => {
      expect( adSlotConfig ).to.not.be.an('undefined');
    } );

    it( 'should be an object', () => {
      expect( adSlotConfig ).to.be.an('object');
    } );

    describe( `inner adSlot` , () => {
      let adSlot, keys;
      before(() => {
        for(let slotKey in adSlotConfig) {
          if(adSlotConfig.hasOwnProperty(slotKey)) {
            adSlot = adSlotConfig[slotKey];
            break;
          }
        }
        keys = ['id','responsive','fluid','priority','adSizeMapping','responsiveAdSizeMapping',
          'blacklistReferrers','whitelistReferrers']
      });
      it( `should have the following keys: ${keys}`, () => {
        expect( adSlot ).to.contain.all.keys(keys);
      } );

      describe( 'responsive property' , () => {
        let responsive;
        before(() => {
          responsive = adSlot.responsive;
        });

        it( `should be a boolean`, () => {
          expect( responsive ).to.be.a('boolean');
        } );

      });

      describe( 'fluid property' , () => {
        let fluid;
        before(() => {
          fluid = adSlot.fluid;
        });

        it( `should be a boolean`, () => {
          expect( fluid ).to.be.a('boolean');
        } );

      });

      describe( 'priority property' , () => {
        let priority, priorities = ['low', 'normal', 'high'];
        before(() => {
          priority = adSlot.priority;
        });

        it( `should be one of: ${priorities}`, () => {
          expect( priority ).to.be.oneOf(priorities);
        } );

      });

      describe( 'adSizeMapping property' , () => {
        let adSizeMapping;
        before(() => {
          adSizeMapping = adSlot.adSizeMapping;
        });

        it( `should be an array`, () => {
          expect( adSizeMapping ).to.be.a.array;
        } );

      });

      describe( `responsiveAdSizeMapping property` , () => {
        let responsiveAdSizeMapping, keys;
        before(() => {
          for(let slotKey in adSlot) {
            if(adSlot.hasOwnProperty(slotKey) && slotKey === 'responsiveAdSizeMapping') {
              responsiveAdSizeMapping = adSlot[slotKey];
              break;
            }
          }
          keys = ['xxs','xs','s','m','l','xl','xxl']
        });

        it( `should be an object`, () => {
          expect( responsiveAdSizeMapping ).to.be.an('object');
        } );

        it( `should have the following keys: ${keys}`, () => {
          expect( responsiveAdSizeMapping ).to.contain.all.keys(keys);
        } );

      });

      describe( 'blacklistReferrers property' , () => {
        let blacklistReferrers;
        before(() => {
          blacklistReferrers = adSlot.blacklistReferrers;
        });

        it( `should be a string`, () => {
          expect( blacklistReferrers ).to.be.a('string');
        } );

      });

      describe( 'whitelistReferrers property' , () => {
        let whitelistReferrers;
        before(() => {
          whitelistReferrers = adSlot.whitelistReferrers;
        });

        it( `should be a string`, () => {
          expect( whitelistReferrers ).to.be.a('string');
        } );

      });

    });

  });

  describe( 'adManager configuration' , () => {
    let adManagerConfig, keys = [];
    before(() => {
      adManagerConfig = config.adManagerConfig;
      keys = ['network', 'adUnitBase']
    });

    it( 'should not be undefined', () => {
      expect( adManagerConfig ).to.not.be.an('undefined');
    } );

    it( 'should be an object', () => {
      expect( adManagerConfig ).to.be.an('object');
    } );

    it( `should have the following keys: ${keys}`, () => {
      expect( adManagerConfig ).to.contain.all.keys(keys);
    } );

    it( `should have the network property fixed to 9401`, () => {
      expect( adManagerConfig.network ).to.equal('9401');
    } );

  });

  describe( 'breakpointsConfig configuration' , () => {
    let breakpointsConfig,
      keys = ['xxs','xs','s','m','l','xl','xxl'],
      values = [600, 761, 993, 1009, 1291, 1600, 1900];
    before(done => {
      breakpointsConfig = config.breakpointsConfig;

      done();
    });

    it( 'should not be undefined', () => {
      expect( breakpointsConfig ).to.not.be.an('undefined');
    } );

    it( 'should be an object', () => {
      expect( breakpointsConfig ).to.be.an('object');
    } );

    it( `should have the breakpoint computed property `, () => {
      expect( breakpointsConfig.breakpoints ).to.be.an('object');
    } );

    it( `should have the following keys: ${keys}`, () => {
      expect( breakpointsConfig.breakpoints ).to.contain.all.keys(keys);
    } );

    keys.forEach((key,index) => {
      let breakpoints = [];
      breakpointsConfig = globalConfig.breakpointsConfig;
      breakpoints.push(breakpointsConfig.breakpoints1[key]);
      breakpoints.push(breakpointsConfig.breakpoints2[key]);
      it( `${key} breakpoint should be equal to one of: ${breakpoints}`, () => {
        expect( breakpointsConfig.breakpoints[key] ).to.be.oneOf(breakpoints);
      } );
      it( `and it should be a number`, () => {
        expect( breakpointsConfig.breakpoints[key] ).to.be.a('number');
      } );
    });
  });

  describe( 'conflictManagement configuration' , () => {
    let conflictManagement, blockingSlot, keys = ['onsize', 'avoid'];
    conflictManagement = globalConfig.conflictManagementConfig;
    for(let key in conflictManagement) {
      if(conflictManagement.hasOwnProperty(key)) {
        blockingSlot = conflictManagement[key];
        break;
      }
    }


    it( 'should not be undefined', () => {
      expect( conflictManagement ).to.not.be.an('undefined');
    } );

    it( 'should be an object', () => {
      expect( conflictManagement ).to.be.an('object');
    } );

    describe(`blocking slot`, () => {
      it( 'should be an array', () => {
        expect( blockingSlot ).to.be.an.array;
      } );


      Array.prototype.forEach.call(blockingSlot,(blockedSlot) => {
        it( `should have the following keys: ${keys}`, () => {
          expect( blockedSlot ).to.contain.all.keys(keys);
        } );
      });
    });

  });

  describe( `sso property` , () => {
    let sso;
    before(() => {
      sso = config.sso;
    });

    it( `should be a string`, () => {
      expect( sso ).to.be.a('string');
    } );

    it( `should be equal to either 'tmsso' or 'engsso'`, () => {
      expect( sso ).to.be.oneOf(['tmsso','engsso']);
    } );

  });



} );
