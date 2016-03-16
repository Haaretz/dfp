export const keys = {
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
  target : 'target',
  maxImpressions : 'maxImpressions',
  hours : 'hour',
  days : 'day',
  adSlotId : 'id',
};




export default class ImpressionsManager {

  constructor(impressionManagerConfig) {
    this.now = (new Date).getTime(); //this date is used for comparisons only
    this.config = Object.assign({}, impressionManagerConfig);
    this.impressions = this.retrieveImpressionsData();
    this.initImpressionMap();
  }

  retrieveImpressionsData() {
    let impressions = this.migrateImpressionsData();
    //Merge migrated data with new data
    //console.log('Migrated: ',impressions);
    Object.keys(impressions).map((key, index) => {
      impressions[key] = Object.assign({},impressions[key],this.config[key]);
    });
    //console.log('Merged: ',impressions);
    //Filter out entries without frequency
    for(const key in impressions) {
      if(impressions.hasOwnProperty(key)) {
        if(!impressions[key][keys.frequency]) {
          //console.log(`Removing ${key} - since it does not have a frequency`,impressions[key]);
          delete impressions[key];
        }
      }
    }
    //console.log('Filtered: ',impressions);
    return impressions;
  }

  migrateImpressionsData() {
    let impressions;
    let impressionsData;
    try {
      impressionsData = window.localStorage.getItem(keys.impressions);
    }
    catch (err) {
      //In case of thrown 'SecurityError' or 'QuotaExceededError', the variable should be undefined
      impressionsData = undefined;
    }
    try {
      impressions = JSON.parse(impressionsData);
    }
    catch (err) {
      //Here is where old impression data is converted to new format
      impressions = {};
      const oldImpressionsArray = impressionsData.split(';').filter(e => e);

      oldImpressionsArray.forEach((impression) => {
        try {
          const adUnitImpression = impression.split(' = ');
          const name = adUnitImpression[0];
          const data = adUnitImpression[1];
          let tmp = name.split('.');
          const target = tmp.pop();
          const slotId = tmp.join('.');
          const id = `${slotId}_${target}`;
          const exposed = parseInt(data.split('/')[0]) || 0;
          const expires = parseInt(data.split('/')[1]) || this.now;
          impressions[id] = {};
          impressions[id][keys.adSlotId] = slotId;
          impressions[id][keys.target] = target;
          impressions[id][keys.exposed] = exposed;
          impressions[id][keys.expires] = expires;
        }
        catch (err) {
          console.log(`Failed converting impression: ${impression}`,err);
        }

      });
    }
    return impressions || {};
  }


  saveImpressionsToLocalStorage() {
    try {
      localStorage.setItem(keys.impressions, JSON.stringify(this.impressions));
    }
    catch (err) {
      //In case of thrown 'SecurityError' or 'QuotaExceededError', the operation should not break
      console.log(`localStorage isn't available:`,err);
    }
  }

  /**
   * Initializes the impression map based on the retrieved impressions and the global
   * configuration.
   */
  initImpressionMap() {
    Object.keys(this.config).map((key, index) => {
      const adSlotId = key;
      let slot, shouldUpdateExpiryDate = false;
      // Case I: Existing slot (update)
      if(slot = this.impressions[adSlotId]) {
        // Case I.I Existing slot, frequency has changed
        if( this.config[adSlotId][keys.frequency] =!  slot[keys.frequency]) {
          // Updating the frequency will trigger a new expiry date
          shouldUpdateExpiryDate = true;
          this.impressions[adSlotId][keys.frequency] = this.config[adSlotId][keys.frequency];
        } // Case I.II Existing slot, old expiry date
        else if(this.now >  slot[keys.expires]) {
          // Old value that should trigger a new expiry date
          shouldUpdateExpiryDate = true;
        }
      } // Case II: Non-existing slot (create new slot)
      else {
        this.initSlotFromConfig(adSlotId);
      } //Finally, updates the expiry date (cases I.I and I.II)
      if(shouldUpdateExpiryDate) {
        this.updateExpiryDate(adSlotId);
      }
    });
  }

  /**
   * Updates the expiry date of a slotName based on the configured slot frequency
   * @param slotName the slotName to update.
     */
  updateExpiryDate(slotName) {
    let now = new Date();
    if(!(this.impressions[slotName] && this.impressions[slotName][keys.frequency])) {
      throw new Error(`Unable to update expiry date for slot: ${slotName}
      - this.impressions[slotName]:`,this.impressions[slotName]);
    }
    const frequencyMap = this.impressions[slotName][keys.frequency].match(keys.frequencyRegex);
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(0);
    if(frequencyMap.indexOf(keys.days) > -1) {
      now.setHours(0);
    }
    this.impressions[slotName][keys.expires] = (frequencyMap.indexOf(keys.days) > -1 ?
      this.addDays(now, frequencyMap[2]) : this.addHours(now, frequencyMap[2])).getTime();

    //Set max impressions:
    this.impressions[slotName][keys.maxImpressions] = parseInt(frequencyMap[1]);
  }

  /**
   * Helper function. Adds N hours to a given date object.
   * @param date the date to derive from
   * @param hours the amount of hours to add, in whole numbers
   * @returns {Date} the new date, derived from adding the given hours
     */
  addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Helper function. Adds N days to a given date object.
   * @param date the date to derive from
   * @param hours the amount of days to add, in whole numbers
   * @returns {Date} the new date, derived from adding the given days
   */
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Initializes a non-existing slot from the passed global configuration for the slot
   * @param slotName the name of the slot to create
     */
  initSlotFromConfig(slotName) {
    let slot = this.impressions[slotName] || {};
    slot[keys.frequency] = this.config[slotName][keys.frequency];
    slot[keys.target] = this.config[slotName][keys.target];
    slot[keys.exposed] = 0;
    this.impressions[slotName] = slot;
    this.updateExpiryDate(slotName);
  }

  /**
   * Registers an impression for a given adSlot.
   * @param adSlotId the adSlot id to register an impression for
   * @returns {boolean} returns true iff the impression has been registered
     */
  registerImpression(adSlotId) {
    if(adSlotId) {
      const slot = this.impressions[adSlotId];
      const exposed = slot[keys.exposed];
      if(exposed) {
        this.impressions[adSlotId][keys.exposed] += 1;
        return true;
      }
    }
    return false;
  }

  /**
   * Checks whether an adSlot has reached it's allocated impressions count
   * @param adSlotId the adSlot to check
   * @returns {boolean} true iff there is a quota for the adSlot, and it has been reached
     */
  reachedQuota(adSlotId) {
    let slot = this.impressions[adSlotId];
    let atQuota = false;
    if(slot) {
      let now = (new Date()).getTime();
      //Second element of 2/4day matches '2'
      const maxImpressions = this.impressions[adSlotId][keys.maxImpressions];
      //Not expired, and reached max impressions
      if(maxImpressions) {
        atQuota = this.impressions[adSlotId][keys.expires] < now &&
          this.impressions[adSlotId][keys.exposed] <= maxImpressions;
      }
    }
    return atQuota;
  }
}
