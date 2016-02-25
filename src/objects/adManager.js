import User from '../utils/userUtil'

// There are a total of 7 adTargets:
// "all","nonPaying","anonymous","registered","paying","digitalOnly" and "digitalAndPrint"
export const adTargets = {
  all: 'all',
  nonPaying: 'nonPaying',
  anonymous: 'anonymous',
  registered: 'registered',
  paying: 'paying',
  digitalOnly: 'digitalOnly',
  digitalAndPrint: 'digitalAndPrint',
};
// There are a total of 3 userTypes: "anonymous", "registered" and "payer"
export const userTypes = {
  anonymous: 'anonymous',
  registered: 'registered',
  payer: 'payer',
};

class adManager {

  constructor(config) {
    this.config = config;
    this.referrerBlacklist = this.initReferrerBlacklist();
    this.user = new User();
  }


  initReferrerBlacklist() {
    let list = [];
    list.push('paid.outbrain.com'); //TODO move to config
    return list;
  }

  shouldSendRequestToDfp(adSlot) {
    // TODO: go over each one of the following and mark as checked once implemented
    // Conflict management check
    // Valid Referrer check
    // Not in referrer Blacklist
    // Talkback adUnit type
    // Maavaron type
    // Popunder type
    // Responsive: breakpoint contains ad?
    // Targeting check (userType vs. slotTargeting)
    this.doesUserTypeMatchBannerTargeting(adSlot);
    // Impressions Manager check (limits number of impressions per slot)
  }

  doesUserTypeMatchBannerTargeting(adSlot) {
    /**
     * Checked whether or not an ad slot should appear for the current user type
     * @param adSlot the slot to check
     * @returns {boolean} true iff the slot should appear for the user type
     */

    const userType = this.user.type;
    const adTarget = adSlot.target;

    switch (adTarget) {
      case adTargets.all : return true;
      case adTargets.nonPaying : return userType === userTypes.anonymous || userType === userTypes.registered;
      case adTargets.anonymous : return userType === userTypes.anonymous;
      case adTargets.registered : return userType === userTypes.registered;
      case adTargets.paying : return userType === userTypes.payer;
      case adTargets.digitalOnly : return userType === userTypes.payer;
      case adTargets.digitalAndPrint : return userType === userTypes.payer;
      default: return false;
    }
  }
}

export default adManager;
