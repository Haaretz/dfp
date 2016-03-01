import getCookieAsMap, { ssoKey } from '../utils/cookieUtils'
import ImpressionManager from '../objects/impressionsManager'
export const userTypes = {
  payer: 'payer',
  registered: 'registered',
  anonymous: 'anonymous'
};
export default class User {
  constructor() {
    this.type = this.getUserType();
    this.impressionManager = this.initImpressionMap();
  }

  getUserType() {
    let cookieMap = getCookieAsMap();
    if(cookieMap && cookieMap[ssoKey]) {
      const payerProp = ssoKey.indexOf("haaretz.com") > -1 ? 'HdcPusr' : 'HtzPusr';
      return cookieMap[payerProp] ? userTypes.payer : userTypes.registered
    }
    else {
      return userTypes.anonymous;
    }
  }

  initImpressionMap() {
    const globalConfig = {};
    if(window.adUnitsFrequencyMap) {
      Object.keys(adUnitsFrequencyMap).map(function(key, index) {
        globalConfig[key] = adUnitsFrequencyMap[key];
      });
    }
    return new ImpressionManager(globalConfig)
  }
}
