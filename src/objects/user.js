import getCookieAsMap from '../utils/cookieUtils';
import ImpressionManager from './impressionsManager';
import globalConfig from '../globalConfig';

export const userTypes = {
  payer: 'payer',
  registered: 'registered',
  anonymous: 'anonymous',
  trial: 'trial',
  guest: 'reg_guest',
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
    this.type = this.getUserType(cookieMap);
    this.htz_type = this.getUserTypeByProduct(cookieMap, productTypes.htz, 'tmsso');
    this.tm_type = this.getUserTypeByProduct(cookieMap, productTypes.tm, 'tmsso');
    this.hdc_type = this.getUserTypeByProduct(cookieMap, productTypes.hdc, 'engsso');
    this.impressionManager = new ImpressionManager(config.impressionManagerConfig);
    this.age = this.getUserAge(cookieMap);
    this.gender = this.getUserGender(cookieMap);
    this.sso = this.getUserSSO(cookieMap, this.ssoKey);
    this.country = this.getUserCountry();
  }

  getUserType(cookieMap) {
    let userType;
    if (cookieMap && cookieMap[this.ssoKey]) {
      userType = (cookieMap.HtzPusr || cookieMap.TmPusr || cookieMap.HdcPusr) ?
        userTypes.payer : userTypes.registered;
    }
    else {
      userType = userTypes.anonymous;
    }
    return userType;
  }


  getUserTypeByProduct(cookieMap, productType, ssoKey) {
    let userType = userTypes.anonymous;
    if (cookieMap && cookieMap[ssoKey]) {
      if (cookieMap.userProducts) {
        let userProducts = decodeURIComponent(cookieMap.userProducts);
        userProducts = JSON.parse(userProducts);
        if (productType === productTypes.hdc) {
          userType = this.getHdcUserType(userProducts);
        }
        else {
          userType = this.getHtzTmUserType(userProducts, productType);
        }
        if (userType === userTypes.registered &&
          cookieMap[ssoKey].firstName === 'guest' &&
          cookieMap[ssoKey].lastName === 'guest') {
          userType = userTypes.guest;
        }
      }
    }
    return userType;
  }

  getHdcUserType(userProducts) {
    // user has hdc paying product
    if (this.userHasProduct(userProducts, productTypes.hdc, false)) {
      return userTypes.payer;
    }
    // user has hdc trial product
    else if (this.userHasProduct(userProducts, productTypes.hdc, true)) {
      return userTypes.trial;
    }
    return userTypes.registered;
  }

  getHtzTmUserType(userProducts, productType) {
    // user has htz/tm paying product
    if (this.userHasProduct(userProducts, productType, false) ||
      this.userHasProduct(userProducts, productTypes.htz_tm, false)) {
      return userTypes.payer;
    }
    // user has htz/tm trial product
    else if (this.userHasProduct(userProducts, productType, true) ||
      this.userHasProduct(userProducts, productTypes.htz_tm, true)) {
      return userTypes.trial;
    }
    return userTypes.registered;
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

  getUserSSO(cookieMap, ssoKey) {
    return cookieMap[ssoKey];
  }

  getUserCountry() {
    const country = window.localStorage.getItem('country');
    if (!country) {
      fetch('https://ms-apps.haaretz.co.il/ms-ip2country/get', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/jsonp',
        },
      }).then(resp => resp.json())
        .then(data => {
          window.localStorage.setItem('country', data.code);
        },
        err => {}
      );
      return null;
    }
    return country;
  }

}
