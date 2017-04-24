/* global googletag */
import { adTypes } from '../objects/adManager';
import globalConfig from '../globalConfig';
import { arraysEqual } from '../utils/arrays';

const hiddenClass = globalConfig.site.indexOf('mouse') > -1 ? 'u-is-hidden' : 'h-hidden';

export default class adSlot {

  constructor(adSlotConfig) {
    this.config = Object.assign({}, adSlotConfig);

    // Part I : Markup configuration - passed from AdManager
    this.id = this.config.id;
    if (!this.config.id) {
      throw new Error('an adSlot requires an id!');
    }
    this.target = this.config.target;
    this.type = this.config.type;
    this.responsive = this.config.responsive;
    this.fluid = this.config.fluid;
    this.user = this.config.user;
    this.adManager = this.config.adManager;
    this.htmlElement = this.config.htmlElement;
    this.priority = this.config.priority;
    this.deferredSlot = this.config.deferredSlot;

    // Part II : Global, general ad configuration - passed from AdManager
    this.department = this.config.department;
    this.network = this.config.network;
    this.adUnitBase = this.config.adUnitBase;

    // Part III : ad specific configuration - passed from globalConfig.adSlotConfig
    this.adSizeMapping = this.config.adSizeMapping;
    this.responsiveAdSizeMapping = this.config.responsiveAdSizeMapping;
    this.blacklistReferrers = this.config.blacklistReferrers ?
      this.config.blacklistReferrers.split(',') : [];
    this.whitelistReferrers = this.config.whitelistReferrers ?
      this.config.whitelistReferrers.split(',') : [];


    // Part IV : Runtime configuration - calculated data - only present in runtime
    this.lastResolvedSize = undefined; // Initialized in 'slotRenderEnded' callback
    this.lastResolvedWithBreakpoint = undefined; // Initialized in 'slotRenderEnded' callback
    this.slot = undefined; // Holds a googletag.Slot object
    // [https://developers.google.com/doubleclick-gpt/reference#googletag.Slot]
    try {
      if (!this.deferredSlot) {
        this.slot = this.defineSlot();
      }
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }

  /**
   * Checks whether this adSlot is an 'Out-of-page' slot or not.
   * An Out-of-page slot is a slot that is not embedded in the page 'normally'.
   * @returns {boolean} true iff this adSlot is one of the predefined 'out-of-page' slots.
   */
  isOutOfPage() {
    if (typeof this.type !== 'string') {
      throw new Error('An adSlot cannot by typeless!', this);
    }
    if (this.isMobile() === true) {
      return false;
    }
    switch (this.type) {
      case adTypes.maavaron: return false;
      case adTypes.popunder: return true;
      case adTypes.talkback: return false;
      case adTypes.regular: return false;
      default: return false;
    }
  }

  /**
   * Checks whether this adSlot is a 'maavaron' slot or not.
   * An Out-of-page slot is a slot that is not embedded in the page 'normally'.
   * @returns {boolean} true iff this adSlot is one of the predefined 'out-of-page' slots.
   */
  isMaavaron() {
    if (typeof this.type !== 'string') {
      throw new Error('An adSlot cannot by typeless!', this);
    }
    if (this.isMobile() === true) {
      return false;
    }
    switch (this.type) {
      case adTypes.maavaron: return false;
      default: return false;
    }
  }

  isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(window.navigator.userAgent || ''));
  }
  /**
   * Checks whether or not this adSlot has a non-empty whitelist, and if so, that the current
   * referrer appears in the whitelist.
   * Should return false iff there is a whitelist for the current adSlot, but the referrer is not
   * mentioned in the whitelist.
   * @returns {boolean} true iff the ad can be displayed.
   */
  isWhitelisted() {
    let whitelisted = false;
    if (this.whitelistReferrers.length !== 0) {
      for (const referrer of this.whitelistReferrers) {
        if (globalConfig.referrer.indexOf(referrer) > -1) {
          whitelisted = true;
          break;
        }
      }
    }
    else {
      whitelisted = true;
    }
    return whitelisted;
  }

  /**
   * Checks whether or not this adSlot has a non-empty blacklist, and if so, that the current
   * referrer does not appear in the blacklist.
   * Should return true iff there is a blacklist for the current adSlot, and the referrer is
   * mentioned in the blacklist - to indicate that the adSlot is 'blocked'.
   * @returns {boolean} true iff the ad cannot be displayed.
   */
  isBlacklisted() {
    let blacklisted = false;
    if (this.blacklistReferrers.length !== 0) {
      for (const referrer of this.blacklistReferrers) {
        if (globalConfig.referrer.indexOf(referrer) > -1) {
          blacklisted = true;
          break;
        }
      }
    }
    return blacklisted;
  }


  /**
   * Shows the current adSlot.
   * It assumes a markup is available for this slot (any tag with an id attribute = this.id)
   */
  show() {
    if (!this.shown === true) {
      this.shown = true; // Ensure show will be called once per adSlot
      googletag.cmd.push(() => {
        if (this.deferredSlot) {
          this.slot = this.defineSlot();
        }
        // console.log('calling show for slot',this.id,' called @',window.performance.now());
        document.getElementById(this.id).classList.remove(hiddenClass);
        googletag.display(this.id);
      });
    }
  }

  /**
   * Shows the current adSlot.
   * It assumes a markup is available for this slot (any tag with an id attribute = this.id)
   */
  hide() {
    googletag.cmd.push(() => {
      document.getElementById(this.id).classList.add(hiddenClass);
    });
  }

  /**
   * Initializes page-level slot definition for the current slot
   * @return {Slot} slot - the Google Slot that was defined from this AdSlot configuration
   */
  defineSlot() {
    if (this.isMaavaron()) {
      const maavaronSlot = this.defineMaavaron();
      if (this.adManager.shouldSendRequestToDfp(this)) {
        if (!this.shown) {
          this.shown = true; // Ensure show will be called once
          maavaronSlot.display();
        }
      }
      return maavaronSlot;
    }
    const googletag = window.googletag;
    const pubads = googletag.pubads();
    const args = [];
    const defineFn = this.isOutOfPage() ? googletag.defineOutOfPageSlot : googletag.defineSlot;
    // 3 or 2 params according to the function that we want to activate.
    args.push(this.getPath());
    if (this.isOutOfPage() === false) {
      if (this.fluid) {
        args.push('fluid');
      }
      else {
        args.push(this.adSizeMapping);
      }
    }
    args.push(this.id);
    let slot = defineFn.apply(defineFn, args);
    if (slot) {
      // Responsive size Mapping
      if (this.responsive) {
        let responsiveSlotSizeMapping = googletag.sizeMapping();
        const breakpoints = globalConfig.breakpointsConfig.breakpoints;
        const keys = Object.keys(this.responsiveAdSizeMapping);
        for (const key of keys) { // ['xxs','xs',...]
          responsiveSlotSizeMapping.addSize(
            [breakpoints[key], 100], // 100 is a default height, since it is height agnostic
            !arraysEqual(this.responsiveAdSizeMapping[key], [[0, 0]]) ? this.responsiveAdSizeMapping[key] : []);
        }
        responsiveSlotSizeMapping = responsiveSlotSizeMapping.build();
        slot = slot.defineSizeMapping(responsiveSlotSizeMapping);
      }
      slot = slot.addService(pubads);
      if (this.isOutOfPage() === false) {
        slot.setCollapseEmptyDiv(true);
      }
    }
    return slot;
  }

  /**
   * Returns the current path calculated for the adSlot
   * @returns {String} a formatted string that represent the path for the slot definition
   */
  getPath() {
    /* eslint-disable no-shadow */
    let path = globalConfig.path || [];
    path = path.filter(path => path !== '.');
    path = path.map(section => `${this.id}${this.department}${section}`).join('/');
    // If a path exist, it will be preceded with a forward slash
    path = path && this.config.department !== '_homepage' ? `/${path}` : '';
    /* eslint-enable no-shadow */
    const calculatedPath = `/${this.config.network}/${this.config.adUnitBase}/${this.id}/${this.id}${this.department}${path}`; // eslint-disable-line max-len
    return calculatedPath.toLowerCase();
  }

  /* eslint-disable */
  slotRendered(event) {
    const id = event.slot.getAdUnitPath().split('/')[3]; // Convention: [0]/[1]network/[2]base/[3]id
    const isEmpty = event.isEmpty; // Did the ad return as empty?
    const resolvedSize = event.size; // What 'creative' size did the ad return with?
    // Empty or onload callback should be called next?
  }
  /* eslint-enable */

  /**
   * Refresh this adSlot
   */
  refresh() {
    googletag.cmd.push(() => {
      googletag.pubads().refresh([this.slot]);
    });
  }

  /**
   * Shows 'Maavaron' type adSlot using Passback definition
   * @return {Slot} slot - the Google Slot that was defined for Maavaron
   */
  defineMaavaron() {
    if (!document.referrer.match('loc.haaretz')) {
      const adUnitMaavaronPath = this.getPath();
      const adUnitMaavaronSize = [
        [2, 1],
      ];
      const slot = googletag.pubads().definePassback(adUnitMaavaronPath, adUnitMaavaronSize)
        .setTargeting('UserType', [this.user.type])
        .setTargeting('age', [this.user.age])
        .setTargeting('urgdr', [this.user.gender])
        .setTargeting('articleId', [globalConfig.articleId])
        .setTargeting('stg', [globalConfig.environment]);
      return slot;
    }
    return null;
  }
}
