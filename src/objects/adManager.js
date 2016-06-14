/*global googletag*/
import User from '../objects/user';
import ConflictResolver from '../objects/conflictResolver';
import AdSlot from '../objects/adSlot';
import globalConfig from '../globalConfig';
import { getBreakpoint, getBreakpointName } from '../utils/breakpoints';
import { arraysEqual } from '../utils/arrays';

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


export default class AdManager {

  constructor(config) {
    this.config = Object.assign({}, config);
    this.user = new User(config);
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
      });
      // Holds adSlot objects as soon as possible.
      googletag.cmd.push(() => {
        this.adSlots = this.initAdSlots(config.adSlotConfig);
      });
      // Once DOM ready, add the rest of the adSlots.
      document.addEventListener('DOMContentLoaded', () => {
        googletag.cmd.push(() => {
          this.adSlots = this.initAdSlots(config.adSlotConfig);
          this.initGoogleGlobalSettings();
        });
      });
    }
    catch (err) {
      console.log(err);
    }
  }

  /**
   * Shows all of the adSlots that can be displayed.
   */
  showAllSlots() {
    for(const adSlotKey of this.adSlots.keys()) {
      const adSlot = this.adSlots.get(adSlotKey);
      if(adSlot.type !== adTypes.talkback && this.shouldSendRequestToDfp(adSlot)) {
        adSlot.show();
      }
    }
  }

  showAllDeferredSlots() {
    for(const deferredSlotId of this.conflictResolver.deferredSlots) {
      if(this.adSlots.has(deferredSlotId)) {
        if(!this.conflictResolver.isBlocked(deferredSlotId)) {
          const deferredAdSlot = this.adSlots.get(deferredSlotId);
          if(this.shouldSendRequestToDfp(deferredAdSlot)) {
            deferredAdSlot.show();
          }
        }
      }
    }
  }

  /**
   * Refreshes all responsive adSlots
   */
  refreshAllSlots() {
    const currentBreakpoint = getBreakpoint();
    for(const adSlotKey of this.adSlots.keys()) {
      const adSlot = this.adSlots.get(adSlotKey);
      if(adSlot.responsive) {
        if(adSlot.lastResolvedWithBreakpoint != currentBreakpoint && this.shouldSendRequestToDfp(adSlot)) {
          console.log(`calling refresh for adSlot: ${adSlot.id}`);
          adSlot.refresh();
        } else {
          adSlot.hide();
        }
      }
    }
  }

  /**
   * Initializes adSlots based on the currently found slot markup (HTML page specific),
   * and the predefined configuration for the slots.
   * @param adSlotConfig
   * @returns {Map}
   */
  initAdSlots(adSlotConfig) {
    let adSlots = new Map(this.adSlots);
    let adSlotPlaceholders = Array.from(document.getElementsByClassName('js-dfp-ad'));
    adSlotPlaceholders = adSlotPlaceholders.filter(node => node.id); //only nodes with an id
    const adSlotNodeSet = new Set();
    adSlotPlaceholders = Array.prototype.filter.call(adSlotPlaceholders, node => {
      if(adSlotNodeSet.has(node.id) === false) { //first occurrence of Node
        adSlotNodeSet.add(node.id);
        return true;
      }
      return false;
    });
    adSlotPlaceholders = adSlotPlaceholders.sort((a,b) => a.offsetTop - b.offsetTop);
    adSlotPlaceholders.forEach(adSlot => {
      if(adSlotConfig[adSlot.id] && adSlots.has(adSlot.id) === false) {
        //the markup has a matching configuration from adSlotConfig AND was not already defined
        try {
          // adSlotConfig is built from globalConfig, but can be overridden by markup
          const computedAdSlotConfig = Object.assign({},adSlotConfig[adSlot.id],{
            id: adSlot.id,
            target: adSlot.attributes['data-audtarget'] ? adSlot.attributes['data-audtarget'].value : adTargets.all,
            type: this.getAdType(adSlot.id),
            responsive: adSlotConfig[adSlot.id].responsive && adSlot.classList.contains('js-dfp-resp-refresh'), //TODO change to global config
            user: this.user,
            adManager: this,
            department: this.config.department,
            network: this.config.adManagerConfig.network,
            adUnitBase: this.config.adManagerConfig.adUnitBase,
          });
          adSlots.set(adSlot.id,new AdSlot(computedAdSlotConfig));
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
   *  //TODO: add explicit type override
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
      // adSlot.type !== adTypes.maavaron &&
      // adSlot.type !== adTypes.talkback &&
      this.shouldDisplayAdAfterAdBlockRemoval(adSlot) &&
        // Responsive: breakpoint contains ad?
      this.doesBreakpointContainAd(adSlot) &&
        // Targeting check (userType vs. slotTargeting)
      this.doesUserTypeMatchBannerTargeting(adSlot) &&
        // Impressions Manager check (limits number of impressions per slot)
      this.user.impressionManager.reachedQuota(adSlot.id) === false;
  }

  shouldDisplayAdAfterAdBlockRemoval(adSlot) {
    return !(this.config.adBlockRemoved && (adSlot.type === adTypes.maavaron || adSlot.type === adTypes.popunder));
  }

  /**
   * Check whether or not an ad slot should appear for the current user type
   * @param adSlotOrTarget the adSlot to check or the target as a sting
   * @returns {boolean} true iff the slot should appear for the user type
   */
  doesUserTypeMatchBannerTargeting(adSlotOrTarget) {

    const userType = this.user.type;
    const adTarget = typeof adSlotOrTarget === 'string' ? adSlotOrTarget : adSlotOrTarget.target;

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
    for(const adSlotKey of this.adSlots.keys()) {
      const adSlot = this.adSlots.get(adSlotKey);
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
      containsBreakpoint = mapping.length > 0 && !arraysEqual(mapping,[0,0]);
    }
    return containsBreakpoint;
  }

  /**
   * Initializes the callback from the 'slotRenderEnded' event for each slot
   * //TODO refactor: break down to smaller submethods
   */
  initSlotRenderedCallback() {
    if(window.googletag && window.googletag.apiReady) {
      const pubads = window.googletag.pubads();
      pubads.addEventListener('slotRenderEnded', event => {
        const id = event.slot.getAdUnitPath().split('/')[3];
        const isEmpty = event.isEmpty;
        const resolvedSize = event.size;
        console.log('slotRenderEnded for slot',id,' called @',window.performance.now());
        if(this.adSlots.has(id)) {
          const adSlot = this.adSlots.get(id);
          adSlot.lastResolvedSize = resolvedSize;
          adSlot.lastResolvedWithBreakpoint = getBreakpoint();
          if(isEmpty) {
            adSlot.hide();
            this.releaseSlotDependencies(adSlot);
          }
          else {
            this.user.impressionManager.registerImpression(`${adSlot.id}${this.config.department}`);
            this.user.impressionManager.registerImpression(`${adSlot.id}_all`);
            this.releaseSlotDependencies(adSlot);
          }
        }
        else {
          //Log an error
          console.log(`Cannot find an ad with id: ${id} - Ad Unit path is ${event.slot.getAdUnitPath()}`);
        }
      });
    }
    else {
      throw new Error(`googletag api was not ready when 'initSlotRenderedCallback' was called!`);
    }
  }

  releaseSlotDependencies(adSlot) {
    try {
      const id = adSlot.id;
      this.conflictResolver.updateResolvedSlot(id,ConflictResolver.EMPTY_SIZE);
      if(this.conflictResolver.isBlocking(id)) {
        // Hide all blocked adSlots
        for(const blockedSlot of this.conflictResolver.getBlockedSlotsIds(id)) {
          if(this.conflictResolver.isBlocked(blockedSlot)) {
            if(this.adSlots.has(blockedSlot)) {
              this.adSlots.get(blockedSlot).hide();
            }
          }
        }
        // Show the non blocked
        for(const deferredSlotKey of this.conflictResolver.deferredSlots.keys()) {
          const deferredAdSlot = this.adSlots.get(deferredSlotKey);
          if(deferredAdSlot && this.shouldSendRequestToDfp(deferredAdSlot)) {
            this.conflictResolver.deferredSlots.delete(deferredSlotKey);
            if(deferredAdSlot.deferredSlot) {
              deferredAdSlot.defineSlot();
              deferredAdSlot.deferredSlot = false;
            }
            deferredAdSlot.show();
          }
        }
      }
    }
    catch (err) {
      console.log(`Cannot updateSlotDependencies for adSlot: ${adSlot.id}`);
    }
  }

  /**
   * Initializes page-level targeting params.
   */
  initGoogleTargetingParams() {
    if(window.googletag && window.googletag.apiReady) {

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
      // AdBlock removal
      if (this.config.adBlockRemoved) {
        pubads.setTargeting('adblock_removed', [this.config.adBlockRemoved]);
      }

      // Ads Centering
      pubads.setCentering(true);
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
      if(window.location.search && window.location.search.indexOf('sraon') > 0) {
        console.log('enableSingleRequest mode: active');
        googletag.pubads().enableSingleRequest();
      }
      if(!this.config.isMobile) {
        googletag.pubads().enableAsyncRendering();
      }
      else {
        googletag.pubads().enableAsyncRendering(); // disabled: googletag.pubads().enableSyncRendering();
      }
      // Enables all GPT services that have been defined for ad slots on the page.
      googletag.enableServices();
    }
    else {
      throw new Error(`googletag api was not ready when 'initGoogleGlobalSettings' was called!`);
    }
  }
}
