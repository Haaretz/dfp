import { adTargets, adTypes } from '../objects/adManager';
import globalConfig from '../globalConfig';
import dfpInstance from '../index';
export default class adSlot {

  constructor(adSlotConfig) {
    this.config = Object.assign({}, adSlotConfig);

    // Part I : Markup configuration - passed from AdManager
    this.id = this.config.id;
    if(!this.config.id) {
      throw new Error("an adSlot requires an id!")
    }
    this.target = this.config.target;
    this.type = this.config.type;
    this.responsive = this.config.responsive;
    this.user = this.config.user;

    // Part II : Global, general ad configuration - passed from AdManager
    this.department = this.config.department;
    this.network = this.config.network;
    this.adUnitBase = this.config.adUnitBase;

    // Part III : ad specific configuration - passed from globalConfig.adSlotConfig
    this.adSizeMapping = this.config.adSizeMapping;
    this.responsiveAdSizeMapping = this.config.responsiveAdSizeMapping;
    this.blacklistReferrers = this.config.blacklistReferrers;
    this.whitelistReferrers = this.config.whitelistReferrers;


    // Part IV : Runtime configuration - calculated data - only present in runtime
    this.lastResolvedSize; // Initialized in 'slotRenderEnded' callback
    this.lastResolvedWithBreakpoint; // Initialized in 'slotRenderEnded' callback
    this.slot; // Holds a googletag.Slot object
    // [https://developers.google.com/doubleclick-gpt/reference#googletag.Slot]
    try {
      this.slot = this.defineSlot();
    }
    catch (err) {
      console.log(err);
    }
  }

  /**
   * Checks whether this adSlot is an 'Out-of-page' slot or not.
   * An Out-of-page slot is a slot that is not embedded in the page 'normally'.
   * @returns {boolean} true iff this adSlot is one of the predefined 'out-of-page' slots.
     */
  isOutOfPage() {
    switch(this.type) {
      case adTypes.maavaron: return true;
      case adTypes.popunder: return true;
      case adTypes.talkback: return true;
      case adTypes.regular: return false;
      default: return false;
    }
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
    if(this.type === adTypes.maavaron) {
      //maavaron uses synced request by definePassback
      this.showMaavaron();
    }
    else {
      googletag.cmd.push(() =>  {
        googletag.display(this.id);
      })
    }
  }
  /**
   * Initializes page-level slot definition for the current slot
   */
  defineSlot() {
    const googletag = window.googletag;
    const pubads = googletag.pubads();
    let args = [];
    let defineFn = this.isOutOfPage() ? googletag.defineOutOfPageSlot : googletag.defineSlot;
    //3 or 2 params according to the function that we want to activate.
    args.push(this.getPath());
    if(this.isOutOfPage() === false) {
      args.push(this.adSizeMapping);
    }
    args.push(this.id);
    let slot = defineFn.apply(defineFn, args);
    // Responsive size Mapping
    if(this.responsive) {
      let responsiveSlotSizeMapping = googletag.sizeMapping();
      const breakpoints = globalConfig.breakpointsConfig.breakpoints;
      const keys = Object.keys(this.responsiveAdSizeMapping);
      for(const key of keys) { //['xxs','xs',...]
        responsiveSlotSizeMapping.addSize(
          [breakpoints[key],100],//100 is a default height, since it is height agnostic
          this.responsiveAdSizeMapping[key]);
      }
      responsiveSlotSizeMapping = responsiveSlotSizeMapping.build();
      slot = slot.defineSizeMapping(responsiveSlotSizeMapping);
    }
    slot = slot.addService(pubads);
    if(this.isOutOfPage() === false) {
      slot.setCollapseEmptyDiv(true);
    }
    return slot;
  }

  /**
   * Returns the current path calculated for the adSlot
   * @returns {*} a formatted string that represent the path for the slot definition
     */
  getPath() {
    let path = globalConfig.path;
    path = path.map(section => `${this.id}${section}`).join('/');
    path = path ? `/${path}` : ''; //If a path exist, it will be preceded with a forward slash
    const calculatedPath = `/${this.config.network}/${this.config.adUnitBase}/${this.id}/${this.id}${this.department}${path}`;
    return calculatedPath;
  }

  slotRendered(event) {
    const id = event.slot.getAdUnitPath().split('/')[3]; // Convention: [0]/[1]network/[2]base/[3]id
    const isEmpty = event.isEmpty; // Did the ad return as empty?
    const resolvedSize = event.size; // What 'creative' size did the ad return with?
    // Empty or onload callback should be called next?
  }

  /**
   * Refresh this adSlot
   */
  refresh() {
    googletag.pubads().refresh([this.id]);
  }

  /**
   * Shows 'Maavaron' type adSlot using Passback definition
   */
  showMaavaron() {
    if(document.referrer.match('loc.haaretz') === false) {
      const adUnitMaavaronPath = this.getPath();
      const adUnitMaavaronSize = [
        [2, 1]
      ];
      googletag.pubads().definePassback(adUnitMaavaronPath, adUnitMaavaronSize)
        .setTargeting('UserType', [this.user.type])
        .setTargeting('age', [this.user.age])
        .setTargeting('urgdr', [this.user.gender])
        .setTargeting('articleId', [globalConfig.articleId])
        .setTargeting('stg', [globalConfig.environment])
        .display();
    }
  }
  /*
  These functions were on the adUnitDFP prototype:
   getNumOfImpressions: ()
   getPeriodImpression: ()
   hasMoreImpressions: ()
   hasValidReferrer: ()
   hide: ()
   isMaavaron: ()
   maxImpressions: ()
   maxImpressionsPeriod: ()
   nextExpiresDate: ()
   onEmptyCallBack: ()
   onLoaded: ()
   refresh: ()
   setNumOfImpressions: ()
   show: ()
   updateNumOfImpressions: ()
   */
}
