/*global isHomepage */
import { adTargets, adTypes } from '../objects/adManager';
import { breakpoints } from '../utils/breakpoints'

const defaultConfig = {
  target: adTargets.all,
  type: adTypes.regular,
  responsive: false,
  get department() {
    return window.isHomepage ? 'homepage' : 'section'
  }
};
export default class adSlot {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.id = this.config.id;
    this.type = this.config.type;
    this.responsive = this.config.responsive;
    this.lastResolvedWithBreakpoint = null;

    if(!this.config.id) {
      throw new Error("an adSlot requires an id!")
    }
    this.department = this.config.department;
    this.target = this.config.target;
  }

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

  refresh() {
    googletag.pubads().refresh([this.id]);
  }
  showMaavaron() {
    //TODO refactor
    if(document.referrer.match('loc.haaretz') == false) {
      var adUnitMaavaronPath = "";
      var adUnitMaavaronSize = [
        [2, 1]
      ];
      if (isHomePage) {
        adUnitMaavaronPath = ADUNIT_BASE + '/' + this.adUnitName + '/' + this.adUnitName + ADUNIT_AFFILATE;
      } else {
        adUnitMaavaronPath = ADUNIT_BASE + '/' + this.adUnitName + '/' + this.adUnitName + ADUNIT_AFFILATE + ADUNIT_PATH_PATTREN.replace(new RegExp('%adUnit%', 'g'), this.adUnitName);
      }
      googletag.pubads().definePassback(adUnitMaavaronPath, adUnitMaavaronSize).setTargeting('UserType', [window.dfpUserType])
        .setTargeting('age', [window.dfpUrAe])
        .setTargeting('stg', [window.dfpStg])
        .setTargeting('urgdr', [window.dfpUrGdr])
        .setTargeting('articleId', [window.dfpArticleId])
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
