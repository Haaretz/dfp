/*global isHomepage */
import { adTargets } from '../objects/adManager';

const defaultConfig = {
  target: adTargets.all,
  maxImpressions : -1, //Default slot configuration - no limit to this slot's impressions
  get department() {
    return isHomepage ? 'homepage' : 'section'
  }
};
class adSlot {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.id = this.config.id;
    if(!this.config.id) {
      throw new Error("an adSlot requires an id!")
    }
    this.department = this.config.department;
    this.target = this.config.target;
    this.maxImpressions = this.config.maxImpressions;
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

  show() {
    //let tag = document.querySelector()
  }
}

export default adSlot;
