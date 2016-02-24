import getCookieAsMap, { ssoKey } from '../utils/cookieUtils'
export default class User {
  constructor() {
    this.userType = this.getUserType();
    this.impressionMap = this.initImpressionMap();
  }

  getUserType() {
    let cookieMap = getCookieAsMap();
    if(cookieMap && cookieMap[ssoKey]) {
      const payerProp = ssoKey.indexOf("haarez.com") > -1 ? 'HdcPusr' : 'HtzPusr';
      return cookieMap[payerProp] ? "payer" : "registered"
    }
    else {
      return "anonymous";
    }
  }

  initImpressionMap() {
    let impressions = localStorage.getItem("impressions");
    let impressionsMap = {};
    if (impressions) {
      impressions = impressions.split(';');
      impressions.forEach(function(entry) {
        const adUnitImpression = entry.split(' = ');
        impressionsMap[adUnitImpression[0]] = adUnitImpression[1];
      });
    }
    return impressionsMap;
  }
}
