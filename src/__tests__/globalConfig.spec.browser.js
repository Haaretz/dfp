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

} );
