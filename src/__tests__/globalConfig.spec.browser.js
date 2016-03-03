import { ssoKey } from '../utils/cookieUtils';
import globalConfig from '../../src/globalConfig';

describe( 'globalConfig - unit tests for browser', () => {
  let config;
  before(() => {
    config = globalConfig;
  });

  it( 'should not throw an error', () => {
    expect( config ).to.not.throw;
  } );

  it( 'should be a object', () => {
    expect( config ).to.be.a.object;
  } );


  describe( 'adManager configuration' , () => {
    it( 'should have a configuration ', () => {
      expect( config.adManagerConfig ).to.be.a.object;
    } );

  });



  describe( 'gStat campaign property' , () => {
    before(() =>{
      window.localStorage.clear();
    });


    it( 'should not have a gStat campaign by default', () => {
      expect( config.gStatCampaignNumber ).to.be.undefined;
    });

    it( 'should have properly read the Campaign property from localStorage', () => {
      const item = {
        "lastModifiedDateTime": 1456977600000,
        "CampaignNumber": 6310
      };
      window.localStorage.setItem("GstatCampaign",JSON.stringify(item));
      expect( config.gStatCampaignNumber ).to.be.a.number;
    })
  })
} );
