/* global googletag */
import User from '../objects/user';
import ConflictResolver from '../objects/conflictResolver';
import AdSlot from '../objects/adSlot';
import { getBreakpoint, getBreakpointName } from '../utils/breakpoints';
import { arraysEqual } from '../utils/arrays';
import getCookieAsMap from '../utils/cookieUtils';

// There are a total of 7 adTargets:
// "all","nonPaying","anonymous","registered","paying","digitalOnly" and "digitalAndPrint"
export const adPriorities = {
  high: 'high',
  normal: 'normal',
  low: 'low',
};

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
        this.initGoogleTargetingParams(); //  Define page-level settings
        this.initGoogleGlobalSettings();  //  enableServices()
        this.initSlotRenderedCallback();  //  Define callbacks
      });
      // Mouse special treatment to base path on mobile breakpoints
      const currentBreakpointName = getBreakpointName(getBreakpoint());
      if (this.config.adManagerConfig.adUnitBase.indexOf('mouse.co.il') > -1 &&
        currentBreakpointName.indexOf('xs') > -1) {
        this.config.adManagerConfig.adUnitBase = 'mouse.co.il.mobile_web';
      }
      // Holds adSlot objects as soon as possible.
      googletag.cmd.push(() => {
        this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.high);
      });
      // Once DOM ready, add more adSlots.
      const onDomLoaded = () => { // eslint-disable-line no-inner-declarations
        try {
          googletag.cmd.push(() => {
            this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.high);
            googletag.cmd.push(() => {
              this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.normal);
            });
          });
        }
        catch (err) {
          console.log(err); // eslint-disable-line no-console
        }
      };
      // Once window was loaded, add the rest of the adSlots.
      const onWindowLoaded = () => { // eslint-disable-line no-inner-declarations
        googletag.cmd.push(() => {
          this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.low);
          // Clean blocking adSlots that are not defined on this page
          for (const blockingAdSlotKey of this.conflictResolver.dependencyMap.keys()) {
            if (!this.adSlots.has(blockingAdSlotKey)) {
              this.conflictResolver.dependencyMap.delete(blockingAdSlotKey);
            }
          }
          this.showAllDeferredSlots();
        });
      };
      switch (document.readyState) {
        case 'loading':
          document.addEventListener('DOMContentLoaded', onDomLoaded);
          window.addEventListener('load', onWindowLoaded);
          break;
        case 'interactive':
          onDomLoaded();
          window.addEventListener('load', onWindowLoaded);
          break;
        default: // 'complete' - no need for event listeners.
          onDomLoaded();
          onWindowLoaded();
      }
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }

  /**
   * Shows all of the adSlots that can be displayed.
   */
  showAllSlots() {
    for (const adSlotKey of this.adSlots.keys()) {
      const adSlot = this.adSlots.get(adSlotKey);
      if (adSlot.type !== adTypes.talkback && this.shouldSendRequestToDfp(adSlot)) {
        adSlot.show();
      }
    }
  }

  /**
   * Gets all adSlots that has a certain priority
   * @param {adPriority} priority - the priority of the ad {high, normal, low}
   * @return {Array<AdSlot>} adSlots - all of the defined adSlots that matches
   * the given priority
   */
  getAdSlotsByPriority(priority) {
    function priorityFilter(adSlot) {
      return adSlot.priority === priority;
    }
    return Array.from(this.adSlots.values()).filter(priorityFilter);
  }

  showAllDeferredSlots() {
    for (const deferredSlotId of this.conflictResolver.deferredSlots) {
      if (this.adSlots.has(deferredSlotId)) {
        if (!this.conflictResolver.isBlocked(deferredSlotId)) {
          const deferredAdSlot = this.adSlots.get(deferredSlotId);
          if (this.shouldSendRequestToDfp(deferredAdSlot)) {
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
    for (const adSlotKey of this.adSlots.keys()) {
      const adSlot = this.adSlots.get(adSlotKey);
      if (adSlot.responsive && adSlot.type !== adTypes.maavaron) {
        if (adSlot.lastResolvedWithBreakpoint !== currentBreakpoint &&
          this.shouldSendRequestToDfp(adSlot)) {
          // console.log(`calling refresh for adSlot: ${adSlot.id}`);
          adSlot.refresh();
        }
        else {
          adSlot.hide();
        }
      }
    }
  }

  /**
   * Refreshes all adSlots
   */
  refreshAllSlotsInPage() {
    for (const adSlotKey of this.adSlots.keys()) {
      const adSlot = this.adSlots.get(adSlotKey);
      if (this.shouldSendRequestToDfp(adSlot)) {
        // console.log(`calling refresh for adSlot: ${adSlot.id}`);
        adSlot.refresh();
      }
      else {
        adSlot.hide();
      }
    }
  }

  /**
   * Refreshes adSlot
   */

  refreshSlot(adUnitName) {
    const adSlot = this.adSlots.get(adUnitName);
    if (this.shouldSendRequestToDfp(adSlot)) {
      // console.log(`calling refresh for adSlot: ${adSlot.id}`);
      adSlot.refresh();
    }
    else {
      adSlot.hide();
    }
  }


      /**
   * Initializes adSlots based on the currently found slot markup (HTML page specific),
   * and the predefined configuration for the slots.
   * @param {Object} adSlotConfig - the AdSlots configuration object (see: globalConfig)
   * @param {String} filteredPriority - filters out all adSlots that does not match
   * a given adPriority. This is used to cherry pick the init process of ads.
   * @returns {Map}
   */
  initAdSlots(adSlotConfig, filteredPriority) {
    const adSlots = new Map(this.adSlots);
    let adSlotPlaceholders = Array.from(document.getElementsByClassName('js-dfp-ad'));
    adSlotPlaceholders = adSlotPlaceholders.filter(node => node.id); // only nodes with an id
    const adSlotNodeSet = new Set();
    adSlotPlaceholders = Array.prototype.filter.call(adSlotPlaceholders, node => {
      if (adSlotNodeSet.has(node.id) === false) { // first occurrence of Node
        adSlotNodeSet.add(node.id);
        return true;
      }
      return false;
    });
    // adSlotPlaceholders = adSlotPlaceholders.sort((a, b) => a.offsetTop - b.offsetTop);
    adSlotPlaceholders.forEach(adSlot => {
      const adSlotPriority = adSlotConfig[adSlot.id] ?
      adSlotConfig[adSlot.id].priority || adPriorities.normal : undefined;
      if (adSlotConfig[adSlot.id] && adSlots.has(adSlot.id) === false &&
        adSlotPriority === filteredPriority) {
        // The markup has a matching configuration from adSlotConfig AND was not already defined
        try {
          // adSlotConfig is built from globalConfig, but can be overridden by markup
          const computedAdSlotConfig = Object.assign({}, adSlotConfig[adSlot.id], {
            id: adSlot.id,
            target: adSlot.attributes['data-audtarget'] ?
              adSlot.attributes['data-audtarget'].value : adTargets.all,
            type: this.getAdType(adSlot.id),
            responsive: adSlotConfig[adSlot.id].responsive,
            fluid: adSlotConfig[adSlot.id].fluid || false,
            user: this.user,
            adManager: this,
            htmlElement: adSlot,
            department: this.config.department,
            network: this.config.adManagerConfig.network,
            adUnitBase: this.config.adManagerConfig.adUnitBase,
            deferredSlot: this.conflictResolver.isBlocked(adSlot.id),
            priority: adSlotPriority,
          });
          const adSlotInstance = new AdSlot(computedAdSlotConfig);
          adSlots.set(adSlot.id, adSlotInstance);
          if (adSlotInstance.type !== adTypes.talkback &&
            adSlotInstance.priority === adPriorities.high &&
            this.shouldSendRequestToDfp(adSlotInstance)) {
            /*
             console.log('calling show for high priority slot', adSlotInstance.id, ' called @',
             window.performance.now());
             */
            adSlotInstance.show();
          }
        }
        catch (err) {
          console.error(err); // eslint-disable-line no-console
        }
      }
    });
    return adSlots;
  }

  isPriority(adSlotId) {
    return (typeof adSlotId === 'string' &&
    (adSlotId.indexOf('plazma') > 0 ||
    adSlotId.indexOf('maavaron') > 0 ||
    adSlotId.indexOf('popunder') > 0));
  }

  /**
   * Returns the adType based on the adSlot name.
   * @param {String} adSlotId - the adSlot's identifier.
   * @returns {*} enumerated export 'adTypes'
   */
  getAdType(adSlotId) {
    if (!adSlotId) {
      throw new Error('Missing argument: a call to getAdType must have an adSlotId');
    }
    if (adSlotId.indexOf(adTypes.maavaron) > -1) return adTypes.maavaron;
    if (adSlotId.indexOf(adTypes.popunder) > -1) return adTypes.popunder;
    if (adSlotId.indexOf(adTypes.talkback) > -1) return adTypes.talkback;
    return adTypes.regular;
  }

  /**
   * @param {object} adSlot the AdSlot
   * @returns {boolean|*}
   */
  shouldSendRequestToDfp(adSlot) {
    // Conflict management check
    return this.conflictResolver.isBlocked(adSlot.id) === false &&
      // Valid Referrer check
      adSlot.isWhitelisted() &&
      // Not in referrer Blacklist
      adSlot.isBlacklisted() === false &&
      this.shouldDisplayAdAfterAdBlockRemoval(adSlot) &&
      //  if a paywall pop-up is shown And the number is 12 or more - SHOW MAAVRON
      this.shouldDisplayAdMaavaronAfterPayWallBanner(adSlot) &&
      // Responsive: breakpoint contains ad?
      this.doesBreakpointContainAd(adSlot) &&
      // check in case of Smartphoneapp
      this.haveValidCookieForSmartphoneapp() &&
      // Targeting check (userType vs. slotTargeting)
      this.doesUserTypeMatchBannerTargeting(adSlot) &&
      // Impressions Manager check (limits number of impressions per slot)
      this.user.impressionManager.reachedQuota(adSlot.id) === false;
  }

  printShouldSendRequestToDfp(id) {
    let res = '';
    if (!this.adSlots.has(id)) {
      res = `id not exist: ${id}`;
    }
    else {
      const a = this.adSlots.get(id);
      res += this.conflictResolver.isBlocked(a.id) === !1 ? '' : 'isBlocked,';
      res += a.isWhitelisted() ? '' : 'isWhitelisted,';
      res += a.isBlacklisted() === !1 ? '' : 'isBlacklisted,';
      res += this.shouldDisplayAdAfterAdBlockRemoval(a) ? '' : 'AdBlockRemoval,';
      res += this.shouldDisplayAdMaavaronAfterPayWallBanner(a) ? '' : 'PayWallBanner,';
      res += this.doesBreakpointContainAd(a) ? '' : 'Breakpoint,';
      res += this.haveValidCookieForSmartphoneapp() ? '' : 'Smartphoneapp,';
      res += this.doesUserTypeMatchBannerTargeting(a) ? '' : 'Targeting,';
      res += this.user.impressionManager.reachedQuota(a.id) === !1 ? '' : 'reachedQuota,';
      res = `<div>${id}<br>${res}</div>`;
    }
    document.write(res);
    return res;
  }

  testShouldSendRequestToDfp(id) {
    // leave the old name for ios legacy
    let cookieMap = getCookieAsMap();
    cookieMap = JSON.stringify(cookieMap);
    cookieMap = cookieMap.replace(/,/g, '<br>');
    const res = `<div>${cookieMap}</div>`;
    document.write(res);
    return res;
  }

  shouldDisplayAdAfterAdBlockRemoval(adSlot) {
    return !(this.config.adBlockRemoved === true &&
    (adSlot.type === adTypes.maavaron ||
    adSlot.type === adTypes.popunder));
  }

  shouldDisplayAdMaavaronAfterPayWallBanner(adSlot) {
    let shouldDisplay = true;
    if (this.config.site === 'haaretz' && adSlot.type === adTypes.maavaron) {
      try {
        const paywallBanner = JSON.parse(window.localStorage.getItem('_cobj'));
        shouldDisplay = !paywallBanner || ((paywallBanner.mc && paywallBanner.mc >= 12) ||
                          (paywallBanner.nextslotLocation &&
                          !paywallBanner.nextslotLocation.includes('pop')));
      }
      catch (err) {
        /* eslint-disable no-console*/
        console.error('ERROR ON shouldDisplayAdMaavaronAfterPayWallBanner');
        /* eslint-enable no-console*/
      }
    }
    return shouldDisplay;
  }

  /**
   * Check whether or not an ad slot should appear for the current user type
   * @param {String} adSlotOrTarget the adSlot to check or the target as a string
   * @returns {boolean} true iff the slot should appear for the user type
   */

  haveValidCookieForSmartphoneapp() {
    return this.config.isValidForsmartPhone;
  }

  /**
   * Check whether or not an ad slot should appear for the current user type
   * @param {String} adSlotOrTarget the adSlot to check or the target as a string
   * @returns {boolean} true iff the slot should appear for the user type
   */
  doesUserTypeMatchBannerTargeting(adSlotOrTarget) {
    // if the user is smadar show her all the banners
    const cookieMap = getCookieAsMap();
    if (cookieMap.login === 'pilosmadar@gmail.com') {
      return true;
    }
    const userType = this.user.type;
    const adTarget = typeof adSlotOrTarget === 'string' ? adSlotOrTarget : adSlotOrTarget.target;

    switch (adTarget) {
      case adTargets.all : return true;
      case adTargets.nonPaying :
        return userType === userTypes.anonymous || userType === userTypes.registered;
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
   * @param {Breakpoint} breakpoint - the breakpoint that is currently being displayed
   * @returns {Integer} affected - the number of adSlots affected by the change
   */
  switchedToBreakpoint(breakpoint) {
    if (!breakpoint) {
      throw new Error('Missing argument: a call to switchedToBreakpoint must have an breakpoint');
    }
    let count = 0;
    for (const adSlotKey of this.adSlots.keys()) {
      const adSlot = this.adSlots.get(adSlotKey);
      if (adSlot.responsive === true && adSlot.lastResolvedWithBreakpoint) {
        if (adSlot.lastResolvedWithBreakpoint !== breakpoint) {
          adSlot.refresh();
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Checks whether an adSlot is defined for a given breakpoint (Default: current breakpoint)
   * @param {AdSlot} adSlot - the adSlot to check.
   * @param {Breakpoint} [breakpoint=currentBreakpoint] - the breakpoint to check this ad in.
   * @returns {boolean} true iff the adSlot is defined for the given breakpoint.
   */
  doesBreakpointContainAd(adSlot, breakpoint = getBreakpoint()) {
    if (!adSlot) {
      throw new Error('Missing argument: a call to doesBreakpointContainAd must have an adSlot');
    }
    let containsBreakpoint = true;
    if (adSlot.responsive === true) {
      const mapping = adSlot.responsiveAdSizeMapping[getBreakpointName(breakpoint)];
      if (Array.isArray(mapping) === false) {
        throw new Error(`Invalid argument: breakpoint:${breakpoint} doesn't exist!`, this);
      }
      containsBreakpoint = mapping.length > 0 && !arraysEqual(mapping, [[0, 0]]);
    }
    return containsBreakpoint;
  }

  /**
   * Initializes the callback from the 'slotRenderEnded' event for each slot
   */
  initSlotRenderedCallback() {
    if (window.googletag && window.googletag.apiReady) {
      const pubads = window.googletag.pubads();
      pubads.addEventListener('slotRenderEnded', event => {
        const id = event.slot.getAdUnitPath().split('/')[3];
        const isEmpty = event.isEmpty;
        const resolvedSize = event.size;
        // console.log('slotRenderEnded for slot',id,' called @',window.performance.now());
        if (this.adSlots.has(id)) {
          const adSlot = this.adSlots.get(id);
          adSlot.lastResolvedSize = resolvedSize;
          adSlot.lastResolvedWithBreakpoint = getBreakpoint();
          if (isEmpty) {
            adSlot.lastResolvedSize = ConflictResolver.EMPTY_SIZE;
            adSlot.hide();
            this.releaseSlotDependencies(adSlot);
          }
          else {
            this.releaseSlotDependencies(adSlot, adSlot.lastResolvedSize);
          }
          this.user.impressionManager.registerImpression(`${adSlot.id}${this.config.department}`);
          this.user.impressionManager.registerImpression(`${adSlot.id}_all`);
        }
        else {
          /*
           console.error(`Cannot find an adSlot with id: ${id} - Ad Unit path is
           ${event.slot.getAdUnitPath()}`);
           */
        }
      });
    }
    else {
      throw new Error('googletag api was not ready when \'initSlotRenderedCallback\' was called!');
    }
  }

  releaseSlotDependencies(adSlot) {
    try {
      const id = adSlot.id;
      this.conflictResolver.updateResolvedSlot(id, adSlot.lastResolvedSize);
      if (this.conflictResolver.isBlocking(id)) {
        // Hide all blocked adSlots
        for (const blockedSlot of this.conflictResolver.getBlockedSlotsIds(id)) {
          if (this.conflictResolver.isBlocked(blockedSlot)) {
            if (this.adSlots.has(blockedSlot)) {
              this.adSlots.get(blockedSlot).hide();
            }
          }
        }
        // Show the non blocked
        for (const deferredSlotKey of this.conflictResolver.deferredSlots.keys()) {
          const deferredAdSlot = this.adSlots.get(deferredSlotKey);
          if (deferredAdSlot && this.shouldSendRequestToDfp(deferredAdSlot)) {
            this.conflictResolver.deferredSlots.delete(deferredSlotKey);
            if (deferredAdSlot.deferredSlot) {
              deferredAdSlot.defineSlot();
              deferredAdSlot.deferredSlot = false;
            }
            deferredAdSlot.show();
          }
        }
      }
    }
    catch (err) {
      /* eslint-disable no-console*/
      console.error(`Cannot updateSlotDependencies for adSlot: ${adSlot.id}`);
      /* eslint-enable no-console*/
    }
  }

  setSsoGroupKey() {
    fetch(`/ssoGroupKey?value=${this.user.sso.userId}`, {
      method: 'GET',
      cache: 'no-cache',
    }).then(value => {
      if (value) {
        value.json().then(data => {
          if (data && data.result && data.result !== 'item not found'
            && data.result !== 'value is empty') {
            localStorage.setItem('_SsoGroupKey', data.result);
          }
        });
      }
    });
  }

  /**
   * Initializes page-level targeting params.
   */
  initGoogleTargetingParams() {
    if (window.googletag && window.googletag.apiReady) {
      // Returns a reference to the pubads service.
      let SsoGroupKey = null;
      try {
        SsoGroupKey = localStorage.getItem('_SsoGroupKey');
        if (!SsoGroupKey && this.user.sso.userId) {
          this.setSsoGroupKey();
        }
      }
      catch (e) {
        SsoGroupKey = null;
      }
      const pubads = googletag.pubads();
      // Environment targeting (dev, test, prod)
      if (this.config.environment) {
        pubads.setTargeting('stg', [this.config.environment]);
      }
      // App targeting
      // User targeting
      if (this.user.htz_type) {
        pubads.setTargeting('htz_user_type', [this.user.htz_type]);
      }
      if (this.user.tm_type) {
        pubads.setTargeting('tm_user_type', [this.user.tm_type]);
      }
      if (this.user.hdc_type) {
        pubads.setTargeting('hdc_user_type', [this.user.hdc_type]);
      }
      // Context targeting
      if (this.config.section) {
        pubads.setTargeting('section', [this.config.section]);
      }
      if (this.config.sub_section) {
        pubads.setTargeting('sub_section', [this.config.sub_section]);
      }
      if (this.config.articleId) {
        pubads.setTargeting('articleId', [this.config.articleId]);
        pubads.setTargeting('react', ['false']);
      }
      if (this.config.gStatCampaignNumber && this.config.gStatCampaignNumber !== -1) {
        pubads.setTargeting('gstat_campaign_id', [this.config.gStatCampaignNumber]);
      }
      if (this.config.proposalNumber) {
        pubads.setTargeting('proposaltype', [this.config.proposalNumber]);
      }
      if (this.config.pageType) {
        pubads.setTargeting('pageType', [this.config.pageType]);
      }
      if (this.config.isWriterAlerts) {
        pubads.setTargeting('WriterAlerts', ['true']);
      }
      // AdBlock removal
      if (this.config.adBlockRemoved) {
        pubads.setTargeting('adblock_removed', [this.config.adBlockRemoved]);
      }
      // University targeting - triggered via cookie
      if (this.config.wifiLocation) {
        pubads.setTargeting('wifi', [this.config.wifiLocation]);
      }
      if (this.config.tags && Array.isArray(this.config.tags)) {
        pubads.setTargeting('tags', [...this.config.tags]);
      }

      if (this.user.sso && this.user.sso.userId && SsoGroupKey) {
        pubads.setTargeting(SsoGroupKey, this.user.sso.userId);
      }
      if (this.config.anonymousId) {
        const anonymousIdKeyName = 'anonymousIdKey';
        pubads.setTargeting(anonymousIdKeyName, this.config.anonymousId);
      }
      if (this.user.country) {
        pubads.setTargeting('country', this.user.sso.country);
      }

      const cityNames = this.getCityNames();
      if (cityNames) {
        pubads.setTargeting('cityName', [...cityNames]);
      }

      // Ads Centering
      pubads.setCentering(true);
    }
    else {
      throw new Error('googletag api was not ready when \'initGoogleTargetingParams\' was called!');
    }
  }

  /**
   * Initializes googletag services.
   */
  initGoogleGlobalSettings() {
    if (window.googletag && window.googletag.apiReady) {
      const googleGlobalSettings = this.config.googleGlobalSettings;
      // Enable GET parameter overrides
      if (window.location.search) {
        const search = window.location.search;
        if (search.indexOf('sraon') > 0) {
          console.log('Single Request Mode: active'); // eslint-disable-line no-console
          googleGlobalSettings.enableSingleRequest = true;
        }
        else if (search.indexOf('sraoff') > 0) {
          console.log('Single Request Mode: disabled');// eslint-disable-line no-console
          googleGlobalSettings.enableSingleRequest = false;
        }
        if (search.indexOf('asyncrenderingon') > 0) {
          console.log('Async rendering mode: active'); // eslint-disable-line no-console
          googleGlobalSettings.enableAsyncRendering = true;
        }
        else if (search.indexOf('asyncrenderingonoff') > 0) {
          console.log('Sync rendering mode: active');// eslint-disable-line no-console
          googleGlobalSettings.enableAsyncRendering = false;
        }
      }
      // Google services activation
      if (googleGlobalSettings.enableSingleRequest === true) {
        googletag.pubads().enableSingleRequest();
      }
      if (googleGlobalSettings.enableAsyncRendering === true) {
        googletag.pubads().enableAsyncRendering();
      }
      else {
        googletag.pubads().enableSyncRendering();
      }
      // Enables all GPT services that have been defined for ad slots on the page.
      googletag.enableServices();
    }
    else {
      throw new Error('googletag api wasn\'t ready when \'initGoogleGlobalSettings\' was called!');
    }
  }


  getCityNames() {
    const cityNames = [];
    document.querySelectorAll('[data-location-city-name]').forEach((element) => {
      if (!cityNames.includes(element.dataset.locationCityName)) {
        cityNames.push(element.dataset.locationCityName);
      }
    });
    return cityNames.length > 0 ? cityNames : null;
  }

}
