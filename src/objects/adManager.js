/*global googletag*/
import User from '../objects/user';
import ConflictResolver from '../objects/conflictResolver';
import AdSlot from '../objects/adSlot';
import globalConfig from '../globalConfig';
import { getBreakpoint, getBreakpointName } from '../utils/breakpoints';


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
  maavaron: '.maavaron',
  popunder: '.popunder',
  talkback: '.talkback',
  regular: '',
};


//const defaultConfig = {
//  target: adTargets.all,
//  type: adTypes.regular,
//  responsive: false,
//};

export default class AdManager {

  constructor(config) {
    this.config = Object.assign({}, config);
    this.user = new User(config.userConfig);
    this.conflictResolver = new ConflictResolver(config.conflictManagementConfig);
    /**
     * Avoid race conditions by making sure to respect the usual timing of GPT.
     * This DFP implementation uses Enable-Define-Display:
     * Define page-level settings
     * enableServices()
     * Define slots
     * Display slots
     */
    try {
      googletag.cmd.push(() => {
        this.initGoogleTargetingParams();
        this.initSlotRenderedCallback();
        this.initGoogleGlobalSettings();
      });
    }
    catch (err) {
      console.log(err);
    }
    // Holds adSlot objects
    googletag.cmd.push(() => {
      this.adSlots = this.initAdSlots(config.adSlotConfig);
    });
  }

  /**
   * Shows all of the adSlots that can be displayed.
   */
  showAllSlots() {
    for(const adSlot of this.adSlots) {
      if(this.shouldSendRequestToDfp(adSlot)) {
        console.log(`calling show for adSlot: ${adSlot.id}`);
        adSlot.show();
      }
    }
  }

  /**
   * Shows all of the adSlots that can be displayed.
   */
  refreshAllSlots() {
    for(const adSlot of this.adSlots) {
      if(adSlot.responsive && adSlot.lastResolvedWithBreakpoint != getBreakpoint() && this.shouldSendRequestToDfp(adSlot)) {
        console.log(`calling refresh for adSlot: ${adSlot.id}`);
        adSlot.refresh();
      }
    }
  }

  /**
   * Initializes adSlots based on the currently found slot markup (HTML page specific),
   * and the predefined configuration for the slots.
   * @param adSlotConfig
   * @returns {Array}
     */
  initAdSlots(adSlotConfig) {
    let adSlots = [];
    let adSlotPlaceholders = document.getElementsByClassName('js-dfp-ad');
    adSlotPlaceholders = Array.prototype.sort.call(
      adSlotPlaceholders, (a,b) => a.offsetTop - b.offsetTop);
    adSlotPlaceholders = Array.prototype.filter.call(adSlotPlaceholders, node => node.id);
    Array.prototype.forEach.call(adSlotPlaceholders, (adSlot,index) => {
      if(adSlotConfig[adSlot.id]) {
        // adSlotConfig is built from globalConfig, but can be overridden by markup
        const computedAdSlotConfig = Object.assign({},adSlotConfig[adSlot.id],{
          id: adSlot.id,
          target: adSlot.attributes['data-audtarget'].value,
          type: this.getAdType(adSlot.id),
          responsive: adSlot.classList.contains('js-dfp-resp-refresh'),
          user: this.user,
          department: this.config.adManagerConfig.department,
          network: this.config.adManagerConfig.network,
          adUnitBase: this.config.adManagerConfig.adUnitBase,
        });
        try {
          adSlots.push(new AdSlot(computedAdSlotConfig));
        }
        catch (err) {
          console.log(err);
        }
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
    if(!adSlotId) {
      throw new Error(`Missing argument: a call to getAdType must have an adSlotId`,this);
    }
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
        // Not a Talkback adUnit type, not a Maavaron type and not a Popunder type
        adSlot.isOutOfPage() === false &&
    // Responsive: breakpoint contains ad?
        this.doesBreakpointContainAd(adSlot) &&
    // Targeting check (userType vs. slotTargeting)
      this.doesUserTypeMatchBannerTargeting(adSlot) &&
    // Impressions Manager check (limits number of impressions per slot)
      this.user.impressionManager.reachedQuota(adSlot.id) === false;
  }

  /**
   * Check whether or not an ad slot should appear for the current user type
   * @param adSlot the slot to check
   * @returns {boolean} true iff the slot should appear for the user type
   */
  doesUserTypeMatchBannerTargeting(adSlot) {

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

  /**
   * Report to the AdManager that a breakpoint has been switched (passed from one break to
   * another). Should there be a responsive slot with a
   * @param breakpoint the breakpoint that is currently being displayed
   * @returns {number} the number of adSlots affected by the change
     */
  switchedToBreakpoint(breakpoint) {
    if(!breakpoint) {
      throw new Error(`Missing argument: a call to switchedToBreakpoint must have an breakpoint`,this);
    }
    let count = 0;
    for(const adSlot of this.adSlots) {
      if(adSlot.responsive === true && adSlot.lastResolvedWithBreakpoint) {
        if(adSlot.lastResolvedWithBreakpoint != breakpoint) {
          adSlot.refresh(); //TODO check logic - should it check the responsiveAdSizeMapping first?
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Checks whether an adSlot is defined for a given breakpoint (Default: current breakpoint)
   * @returns {boolean} true iff the adSlot is defined for the given breakpoint.
     */
  doesBreakpointContainAd(adSlot, breakpoint = getBreakpoint()) {
    if(!adSlot) {
      throw new Error(`Missing argument: a call to doesBreakpointContainAd must have an adSlot`,this);
    }
    //TODO check if default value is being passed (if the next line is redundant)
    breakpoint = breakpoint || getBreakpoint();
    let containsBreakpoint = true;
    if(adSlot.responsive === true) {
      const mapping = adSlot.responsiveAdSizeMapping[getBreakpointName(breakpoint)];
      if(Array.isArray(mapping) === false) {
        throw new Error(`Invalid argument: breakpoint:${breakpoint} doesn't exist!`,this);
      }
      containsBreakpoint = mapping.length > 0;
    }
    return containsBreakpoint;
  }

  /**
   * Initializes the callback from the 'slotRenderEnded' event for each slot
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
          console.log(`Cannot find an ad with id: ${id}. Ad Unit path is ${event.slot.getAdUnitPath()}`);
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

  /**
   * Initializes googletag services.
   */
  initGoogleGlobalSettings() {
    if(window.googletag && window.googletag.apiReady) {

      googletag.pubads().enableAsyncRendering();
      // Enables all GPT services that have been defined for ad slots on the page.
      googletag.enableServices();
    }
    else {
      throw new Error(`googletag api was not ready when 'initGoogleGlobalSettings' was called!`);
    }
  }
}
