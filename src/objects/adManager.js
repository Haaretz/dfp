import User from '../objects/user'
import ConflictResolver from '../objects/conflictResolver'

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

export const adTypes = {
  maavaron: '.web.maavaron',
  popunder: '.web.popunder',
  talkback: '.web.fullbanner.talkback',
  regular: '',
};

const defaultConfig = {
  target: adTargets.all,
  type: adTypes.regular,
  responsive: false,
  get department() {
    return window.isHomepage ? 'homepage' : 'section'
  }
};

export default class AdManager {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.referrerBlacklist = this.initReferrerBlacklist();
    this.user = new User();
    this.conflictResolver = new ConflictResolver();
    this.adSlots = this.initAdSlots();
    this.adSlotDefinitions = this.initAdSlotDefinitions();
  }

  initAdSlots() {
    let adSlots = [];
    const adSlotPlaceholders = document.getElementsByClassName('js-dfp-ad');
    Array.prototype.forEach.call(adSlotPlaceholders, (adSlot,index) => {
      adSlots.push({
        id: adSlot.id,
        target: adSlot.attributes['data-audtarget'].value,
        responsive: adSlot.classList.contains('js-dfp-resp-refresh')
      })
    });
    return [];
  }

  initReferrerBlacklist() {
    let list = [];
    list.push('paid.outbrain.com'); //TODO move to config
    return list;
  }

  shouldSendRequestToDfp(adSlot) {
    // TODO: go over each one of the following and mark as checked once implemented
    // Conflict management check
    return this.coflictResolver.isBlocked(adSlot.id) === false &&
    // Valid Referrer check
    // Not in referrer Blacklist
    // Talkback adUnit type
    // Maavaron type
      this.isMaavaron(adSlot) === false &&
    // Popunder type
    // Responsive: breakpoint contains ad?
        this.doesBreakpointContainAd() &&
    // Targeting check (userType vs. slotTargeting)
      this.doesUserTypeMatchBannerTargeting(adSlot) &&
    // Impressions Manager check (limits number of impressions per slot)
      this.user.impressionManager.reachedQuota(adSlot.id) === false;
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

  isMaavaron(adSlot) {
    return adSlot.id.indexOf(adTypes.maavaron) > -1;
  }
  switchedToBreakpoint(breakpoint) {
    for(const adSlot of this.adSlots) {
      if(adSlot.responsive === true) {

      }
    }
  }

  doesBreakpointContainAd() {
    return true; //TODO implement
  }
  initAdSlotDefinitions() {
    //for each adSlot
    //adSlot mapping config
    //let slotMapping = googletag.sizeMapping().addSize([breakPointWidth, breakPointHeight],
    // [ [width1, height1],...,[widthN, heightN] ])(...).build();
    //const slotPath = `/${network}/${base}/${adSlotId}/${adSlotId}_${homepage|department}`
    //googletag.defineOutOfPageSlot case
    //const slotDefinition = googletag.defineSlot(slotPath,[[defaultWidth,
    // defaultHeight]],adSlot.id).defineSizeMapping(slotMapping).addService(googletag.pubads()).setCollapseEmptyDiv(true);
    //this.adSlotDefinitions[adSlot.id] = slotDefinition;
  }
  addSlotRenderedCallback(callback) {
    googletag.pubads().addEventListener('slotRenderEnded', callback);
  }
  initGoogleTargetingParams() {
    function initGstatCampign() {
      //TODO change
      if (!!localStorage.GstatCampaign) {
        var GstatCampaign = JSON.parse(localStorage.GstatCampaign);
        var CampaignNumber = GstatCampaign['CampaignNumber'];
        return CampaignNumber;
      }
    }
  //targeting params //TODO refactor
    if (typeof dfpUserType != "undefined")
      googletag.pubads().setTargeting('UserType', [dfpUserType]);
    if (typeof dfpUrAe != "undefined")
      googletag.pubads().setTargeting('age', [dfpUrAe]);
    if (typeof dfpStg != "undefined")
      googletag.pubads().setTargeting('stg', [dfpStg]);
    if (typeof dfpUrGdr != "undefined")
      googletag.pubads().setTargeting('urgdr', [dfpUrGdr]);
    if (typeof dfpArticleId != "undefined")
      googletag.pubads().setTargeting('articleId', [dfpArticleId]);
    if (typeof CampaignNumber != "undefined" && CampaignNumber != -1)
      googletag.pubads().setTargeting('gstat_campaign_id', [CampaignNumber]);
    if ((typeof utm_content != "undefined") && (utm_content != null))
      googletag.pubads().setTargeting('utm_content', [utm_content]);
    if ((typeof utm_source != "undefined") && (utm_source != null))
      googletag.pubads().setTargeting('utm_source', [utm_source]);
    if ((typeof utm_medium != "undefined") && (utm_medium != null))
      googletag.pubads().setTargeting('utm_medium', [utm_medium]);
    if ((typeof utm_campaign != "undefined") && (utm_campaign != null))
      googletag.pubads().setTargeting('utm_campaign', [utm_campaign]);
  }
}
