import getCookieAsMap from '../utils/cookieUtils';
import ImpressionManager from './impressionsManager';
import globalConfig from '../globalConfig';

export const userTypes = {
  payer: 'payer',
  registered: 'registered',
  anonymous: 'anonymous',
  trial: 'trial',
};

export const productTypes = {
  htz: 243,
  tm: 273,
  hdc: 239,
  htz_tm: 274,
};

export default class User {
  constructor(config) {
    this.config = Object.assign({}, config.userConfig);
    const cookieMap = getCookieAsMap();
    this.ssoKey = globalConfig.sso;
    if (!cookieMap[this.ssoKey]) {
      // Flips the ssoKey, since cookieMap.ssoKey cannot be used to retrieve data
      this.ssoKey = this.ssoKey === 'tmsso' ? 'engsso' : 'tmsso';
    }
    this.htz_type = this.getUserType(cookieMap, productTypes.htz);
    this.tm_type = this.getUserType(cookieMap, productTypes.tm);
    this.hdc_type = this.getUserType(cookieMap, productTypes.hdc);
    this.impressionManager = new ImpressionManager(config.impressionManagerConfig);
    this.age = this.getUserAge(cookieMap);
    this.gender = this.getUserGender(cookieMap);
  }

  getUserType(cookieMap, productType) {
    let userType = userTypes.anonymous;
    if (cookieMap && cookieMap[this.ssoKey]) {
      userType = userTypes.registered;
      if (cookieMap.userProducts) {
        let userProducts = decodeURIComponent(cookieMap.userProducts);
        userProducts = JSON.parse(userProducts);
        if (productType === productTypes.hdc) {
          // user has hdc paying product
          if (this.userHasProduct(userProducts, productType, false)) {
            userType = userTypes.payer;
          }
          // user has hdc trial product
          else if (this.userHasProduct(userProducts, productType, true)) {
            userType = userTypes.trial;
          }
        }
        // user has htz/tm paying product
        else if (this.userHasProduct(userProducts, productType, false) ||
          this.userHasProduct(userProducts, productTypes.htz_tm, false)) {
          userType = userTypes.payer;
        }
        // user has htz/tm trial product
        else if (this.userHasProduct(userProducts, productType, true) ||
          this.userHasProduct(userProducts, productTypes.htz_tm, true)) {
          userType = userTypes.trial;
        }
      }
    }
    return userType;
  }

  userHasProduct(userProducts, productType, trial) {
    return userProducts.products
        .filter(product => product.prodNum === productType && product.trial === trial)
        .length > 0;
  }

  getUserAge(cookieMap) {
    let age;
    const usrae = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].usrae;
    if (usrae) {
      age = parseInt(cookieMap[this.ssoKey].usrae, 10);
      age = age > 0 ? age : undefined;
    }
    return age;
  }

  getUserGender(cookieMap) {
    let gender;
    const urgdr = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].urgdr;
    if (urgdr) {
      gender = parseInt(cookieMap[this.ssoKey].urgdr, 10);
      gender = gender === 2 || gender === 1 ? gender : undefined;
    }
    return gender;
  }
}
