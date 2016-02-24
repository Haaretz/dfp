const keys = {
  impressions : 'impressions',
  frequency : 'frequency',
  /**
   * [0] - full match
   * [1] - impression count i.e: "1" | "22"
   * [2] - impression expiry range quantifier  i.e: "1" | "22"
   * [3] - impression expiry range unit i.e: "day" | "hour"
   */
  frequencyRegex: /(\d+)\/(\d+)(day|hour)/,
  expires : 'expires',
  exposed : 'exposed',
  hours : 'hour',
  days : 'day',
};


class ImpressionsManager {

  constructor(config) {
    this.now = (new Date).getTime(); //this date is used for comparisons only
    this.config = config;
    this.impressions = JSON.parse(localStorage.getItem(keys.impressions) || "{}");
    this.initImpressionMap();
  }

  initImpressionMap() {
    Object.keys(this.config).map((key, index) => {
      const slotName = key;
      let slot, shouldUpdateExpiryDate = false;
      if(slot = this.impressions[slotName]) { //Existing slotName (update)
        if( this.config[slotName] =!  slot[keys.frequency]) {
          // Updating the frequency will trigger a new expiry date
          shouldUpdateExpiryDate = true;
          this.impressions[keys.frequency] = this.config[slotName];
        }
        else if(this.now >  slot[keys.expires]) {
          // Old value that should trigger a new expiry date
          shouldUpdateExpiryDate = true;
        }
      }
      else { //Non-existing slotName (create)
        this.initSlotFromConfig(slotName);
        //this.impressions[slotName] = this.impressions[slotName] || {};
        //this.impressions[slotName][keys.frequency] = this.config[slotName];
      }
      if(shouldUpdateExpiryDate) {
        this.updateExpiryDate(slotName);
      }
    });

    //Array.prototype.forEach.call(this.config, (slotName => {
    //  let slot, shouldUpdateExpiryDate = false;
    //  if(slot = this.impressions[slotName]) { //Existing slotName (update)
    //    if( this.config[slotName] =!  slot[keys.frequency]) {
    //      // Updating the frequency will trigger a new expiry date
    //      shouldUpdateExpiryDate = true;
    //      this.impressions[keys.frequency] = this.config[slotName];
    //    }
    //    else if(this.now >  slot[keys.expires]) {
    //      // Old value that should trigger a new expiry date
    //      shouldUpdateExpiryDate = true;
    //    }
    //  }
    //  else { //Non-existing slotName (create)
    //    this.initSlotFromConfig(slotName);
    //    //this.impressions[slotName] = this.impressions[slotName] || {};
    //    //this.impressions[slotName][keys.frequency] = this.config[slotName];
    //  }
    //  if(shouldUpdateExpiryDate) {
    //    this.updateExpiryDate(slotName);
    //  }
    //}));
    //forEach(slotName => {
    //  this.impressions[slotName]
    //})
  }

  /**
   * Updates the expiry date of a slotName based on the configured slot frequency
   * @param slotName the slotName to update.
     */
  updateExpiryDate(slotName) {
    let now = new Date();
    const frequencyMap = this.impressions[slotName][keys.frequency].match(keys.frequencyRegex);
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(0);
    if(frequencyMap.indexOf(keys.days) > -1) {
      now.setHours(0);
    }
    this.impressions[slotName][keys.expires] = (frequencyMap.indexOf(keys.days) > -1 ?
      addDays(now, frequencyMap[2]) : addHours(now, frequencyMap[2])).getTime();

    function addHours(date, hours) {
      const result = new Date(date);
      result.setHours(result.getHours() + hours);
      return result;
    }
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
  }

  /**
   * Initializes a non-existing slot from the passed global configuration for the slot
   * @param slotName the name of the slot to create
     */
  initSlotFromConfig(slotName) {
    let slot = this.impressions[slotName] || {};
    slot[keys.frequency] = this.config[slotName];
    slot[keys.exposed] = 0;
    this.impressions[slotName] = slot;
    this.updateExpiryDate(slotName);
  }

  registerImpression(slotName) {
    //TODO convert to a promise based registerImpression API
    this.impressions[slotName][keys.exposed] += 1;
    return true;
  }



}

export default ImpressionsManager;
