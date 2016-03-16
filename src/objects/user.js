import getCookieAsMap, { ssoKey } from '../utils/cookieUtils';
import ImpressionManager from './impressionsManager';
import globalConfig from '../globalConfig';

export const userTypes = {
  payer: 'payer',
  registered: 'registered',
  anonymous: 'anonymous'
};

export default class User {
  constructor(config) {
    this.config = Object.assign({}, config.userConfig);
    let cookieMap = getCookieAsMap();
    this.ssoKey = globalConfig.sso;
    if(!cookieMap[this.ssoKey]) {
      //console.log(`ssoKey flipped! - was ${this.ssoKey}`);
      //Flips the ssoKey, since cookieMap.ssoKey cannot be used to retrieve data
      this.ssoKey = this.ssoKey === 'tmsso' ? 'engsso' : 'tmsso';
      //console.log(`ssoKey flipped! - now ${this.ssoKey}`);
    }
    this.type = this.getUserType(cookieMap);
    this.impressionManager = new ImpressionManager(config.impressionManagerConfig);
    this.age = this.getUserAge(cookieMap);
    this.gender = this.getUserGender(cookieMap);
  }

  getUserType(cookieMap) {
    if(cookieMap && cookieMap[this.ssoKey]) {
      const payerProp = window.location.hostname.indexOf("haaretz.com") > -1 ? 'HdcPusr' : 'HtzPusr';
      return cookieMap[payerProp] ? userTypes.payer : userTypes.registered
    }
    else {
      return userTypes.anonymous;
    }
  }

  getUserAge(cookieMap) {
    let age;
    const usrae = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].usrae;
    if(usrae) {
      age = parseInt(cookieMap[this.ssoKey].usrae);
      age = age > 0 ? age : undefined;
    }
    return age;
  }

  getUserGender(cookieMap) {
    let gender;
    const urgdr = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].urgdr;
    if(urgdr) {
      gender = parseInt(cookieMap[this.ssoKey].urgdr);
      gender = gender === 2 || gender === 1 ? gender : undefined;
    }
    return gender;
  }
}
