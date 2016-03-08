import { adTargets, adTypes } from '../objects/adManager';
import globalConfig from '../globalConfig';
import dfpInstance from '../index';
export default class adSlot {

  constructor(config) {
    this.config = Object.assign({}, config);
    this.id = this.config.id;
    this.type = this.config.type;
    this.responsive = this.config.responsive;
    this.adSizeMapping = this.config.adSizeMapping;
    this.responsiveAdSizeMapping = this.config.responsiveAdSizeMapping;
    this.blacklistReferrers = this.config.blacklistReferrers;
    this.whitelistReferrers = this.config.whitelistReferrers;
    this.lastResolvedSize = null;

    this.lastResolvedWithBreakpoint = null;
    if(!this.config.id) {
      throw new Error("an adSlot requires an id!")
    }
    this.department = this.config.department;
    this.target = this.config.target;
    this.user = this.config.user;
    console.log(this.config);
    this.network = this.config.adManagerConfig.network;
    this.adUnitBase = this.config.adManagerConfig.adUnitBase;
    // this.slot
    // Holds a googletag.Slot object
    // [https://developers.google.com/doubleclick-gpt/reference#googletag.Slot]

  }

  isOutOfPage() {
    switch(this.type) {
      case adTypes.maavaron: return true;
      case adTypes.popunder: return true;
      case adTypes.talkback: return true;
      case adTypes.regular: return false;
      default: return false;
    }
  }

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
    this.slot = slot;
  }

  getPath() {
    let path = this.config.path;
    path = path.map(section => `${this.id}${section}`).join('/');
    path = path ? `/${path}` : '';
    const calculatedPath = `${this.config.network}/${this.config.adUnitBase}/${this.id}${this.department}${path}`;
    console.log(`Calculated path : ${calculatedPath}`);
    return calculatedPath;
  }

  slotRendered(event) {
    const id = event.slot.getAdUnitPath().split('/')[3];
    const isEmpty = event.isEmpty;
    const resolvedSize = event.size;
    // Empty or onload callback
  }

  refresh() {
    googletag.pubads().refresh([this.id]);
  }
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
        .setTargeting('articleId', [this.config.articleId])
        .setTargeting('stg', [this.config.environment])
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
