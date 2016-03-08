/*global googletag*/
import User from '../objects/user';
import ConflictResolver from '../objects/conflictResolver';
import AdSlot from '../objects/adSlot';
import globalConfig from '../globalConfig';
import { getBreakpoint } from '../utils/breakpoints';


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
    return globalConfig.isHomepage ? 'homepage' : 'section'
  }
};

export default class AdManager {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.user = new User(config);
    this.conflictResolver = new ConflictResolver();
    // Holds adSlot objects
    this.adSlots = this.initAdSlots();
    // Holds googletag.Slot objects in a Map() object. (K,V): id => Slot
    // [https://developers.google.com/doubleclick-gpt/reference#googletag.Slot]
    //this.adSlotDefinitions = this.initAdSlotDefinitions();
    try {
      this.initSlotRenderedCallback();
    }
    catch (err) {
      console.log(err);
    }
  }

  showAllSlots() {
    for(const adSlot of this.adSlots) {
      if(this.shouldSendRequestToDfp(adSlot)) {
        adSlot.show();
      }
    }
  }

  //TODO use the passed config param, instead of globalConfig.
  initAdSlots(config) {
    let adSlots = [];
    const adSlotPlaceholders = document.getElementsByClassName('js-dfp-ad');
    Array.prototype.forEach.call(adSlotPlaceholders, (adSlot,index) => {
      const adSlotConfig = Object.assign({},globalConfig.adSlotConfig[adSlot.id],{
        id: adSlot.id,
        target: adSlot.attributes['data-audtarget'].value,
        type: this.getAdType(adSlot.id),
        responsive: adSlot.classList.contains('js-dfp-resp-refresh'),
        user: this.user,
      });
      try {
        adSlots.push(new AdSlot(adSlotConfig));
      }
      catch (err) {
        console.log(err);
      }
    });
    return adSlots;
  }

  /**
   * Returns the adType based on the adSlot name.
   * @param adSlotId the adSlot's identifier.
   * @returns {*} enumerated export 'adTypes'
     */
  getAdType(adSlotId) {
    if(adSlotId.indexOf(adTypes.maavaron) > -1) return adTypes.maavaron;
    if(adSlotId.indexOf(adTypes.popunder) > -1) return adTypes.popunder;
    if(adSlotId.indexOf(adTypes.talkback) > -1) return adTypes.talkback;
    return adTypes.regular;
  }

  /**
   *
   * @param {object} adSlot the AdSlot
   * @returns {boolean|*}
     */
  shouldSendRequestToDfp(adSlot) {
    // TODO: go over each one of the following and mark as checked once implemented
    // Conflict management check
    return this.conflictResolver.isBlocked(adSlot.id) === false &&
        // Valid Referrer check
      adSlot.isWhitelisted() &&
        // Not in referrer Blacklist
      adSlot.isBlacklisted() === false &&

        //TODO refactor outOfPage adSlot checks
        adSlot.isOutOfPage() === false &&
      //  // Not a Talkback adUnit type
      //adSlot.id.indexOf(adTypes.talkback) > -1 === false &&
      //  // Not a Maavaron type
      //adSlot.id.indexOf(adTypes.maavaron) > -1 === false &&
      //  // Not a Popunder type
      //adSlot.id.indexOf(adTypes.popunder) > -1 === false &&

    // Responsive: breakpoint contains ad?
        this.doesBreakpointContainAd(adSlot) &&
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

  switchedToBreakpoint(breakpoint) {
    for(const adSlot of this.adSlots) {
      if(adSlot.responsive === true) {

      }
    }
  }

  /**
   * Checks whether an adSlot is defined for a given breakpoint (Default: current breakpoint)
   * @returns {boolean} true iff the adSlot is defined for the given breakpoint.
     */
  doesBreakpointContainAd(adSlotId, breakpoint = getBreakpoint()) {
    return true; //TODO implement
  }
  //
  ///**
  // * Initializes page-level slot definitions for each and every slot that was found on the page.
  // */
  //initAdSlotDefinitions() {
  //  const googletag = window.googletag;
  //  let slots = new Map();
  //  const pubads = googletag.pubads();
  //  for(const adSlot of this.adSlots) {
  //    // Responsive slot
  //    let args = [];
  //    let defineFn = adSlot.isOutOfPage() ? googletag.defineOutOfPageSlot : googletag.defineSlot;
  //    args.push(this.getPath(adSlot));
  //    if(adSlot.isOutOfPage() === false) {
  //      args.push(adSlot.adSizeMapping);
  //    }
  //    args.push(adSlot.id);
  //    let slot = defineFn.apply(defineFn, args);
  //    // Responsive size Mapping
  //    if(adSlot.responsive) {
  //      let responsiveSlotSizeMapping = googletag.sizeMapping();
  //      const breakpoints = globalConfig.breakpointsConfig.breakpoints;
  //      const keys = Object.keys(adSlot.responsiveAdSizeMapping);
  //      for(const key of keys) { //['xxs','xs',...]
  //        responsiveSlotSizeMapping.addSize(
  //          [breakpoints[key],100],//100 is a default height, since it is height agnostic
  //          adSlot.responsiveAdSizeMapping[key]);
  //      }
  //      responsiveSlotSizeMapping = responsiveSlotSizeMapping.build();
  //      slot = slot.defineSizeMapping(responsiveSlotSizeMapping);
  //    }
  //    slot = slot.addService(pubads);
  //    if(adSlot.isOutOfPage() === false) {
  //      slot.setCollapseEmptyDiv(true);
  //    }
  //    slots.set(adSlot.id,slot);
  //  }
  //  return slots;
  //}
  //addSlotRenderedCallback(callback) {
  //  googletag.pubads().addEventListener('slotRenderEnded', callback);
  //}


  //TODO test
  /**
   *
   */
  initSlotRenderedCallback() {

    if(window.googletag && window.googletag.pubadsReady) {
      const pubads = window.googletag.pubads();
      pubads.addEventListener('slotRenderEnded', event => {
        const id = event.slot.getAdUnitPath().split('/')[3];
        const isEmpty = event.isEmpty;
        const resolvedSize = event.size;
        if(this.adSlots[id]) {
          this.adSlots[id].lastResolvedSize = resolvedSize;
          this.adSlots[id].lastResolvedWithBreakpoint = getBreakpoint();
        }
        else {
          //Log an error
        }
      });
    }
    else {
      throw new Error(`googletag api was not ready when 'initSlotRenderedCallback' was called!`);
    }

  }

  /**
   * Initializes page-level targeting params.
   */
  initGoogleTargetingParams() {
    if(window.googletag && window.googletag.pubadsReady) {

      //Returns a reference to the pubads service.
      const pubads = googletag.pubads();

      // Environment targeting (dev, test, prod)
      if (this.config.environment) {
        pubads.setTargeting('stg', [this.config.environment]);
      }

      // User targeting
      if (this.user.type) {
        pubads.setTargeting('UserType', [this.user.type]);
      }
      if (this.user.age) {
        pubads.setTargeting('age', [this.user.age]);
      }
      if (this.user.gender) {
        pubads.setTargeting('urgdr', [this.user.gender]);
      }

      // Context targeting
      if (this.config.articleId) {
        pubads.setTargeting('articleId', [this.config.articleId]);
      }
      if (this.config.gStatCampaignNumber && this.config.gStatCampaignNumber != -1) {
        pubads.setTargeting('gstat_campaign_id', [this.config.gStatCampaignNumber]);
      }

      // UTM targeting
      if (this.config.utm_.content) {
        pubads.setTargeting('utm_content', [this.config.utm_.content]);
      }
      if (this.config.utm_.source) {
        pubads.setTargeting('utm_source', [this.config.utm_.source]);
      }
      if (this.config.utm_.medium) {
        pubads.setTargeting('utm_medium', [this.config.utm_.medium]);
      }
      if (this.config.utm_.campaign) {
        pubads.setTargeting('utm_campaign', [this.config.utm_.campaign]);
      }
    }
    else {
      throw new Error(`googletag api was not ready when 'initGoogleTargetingParams' was called!`);
    }
  }
}
