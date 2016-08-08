import globalConfig from '../globalConfig';
import { addHours, addDays } from '../utils/time';
import { debounce } from '../utils/breakpoints';

export const keys = {
  impressions: 'impressions',
  frequency: 'frequency',
  /**
   * [0] - full match
   * [1] - impression count i.e: "1" | "22"
   * [2] - impression expiry range quantifier  i.e: "1" | "22"
   * [3] - impression expiry range unit i.e: "day" | "hour"
   */
  frequencyRegex: /(\d+)\/(\d+)(day|hour)/,
  expires: 'expires',
  exposed: 'exposed',
  target: 'target',
  maxImpressions: 'maxImpressions',
  hours: 'hour',
  days: 'day',
  adSlotId: 'id',
};

export default class ImpressionsManager {

  constructor(impressionManagerConfig) {
    this.now = (new Date()).getTime(); // this date is used for comparisons only
    this.config = Object.assign({}, impressionManagerConfig);
    this.impressions = this.retrieveImpressionsData();
    this.initImpressionMap();
  }

  retrieveImpressionsData() {
    const impressions = this.migrateImpressionsData();
    /*
     Merge migrated data with new data
     console.log('Migrated: ',impressions);
     */
    Object.keys(impressions).map((key, index) => {
      impressions[key] = Object.assign({}, impressions[key], this.config[key]);
      return this;
    });
    /*
     console.log('Merged: ',impressions);
     Filter out entries without frequency
     */
    for (const key in impressions) {
      if ({}.hasOwnProperty.call(impressions, key)) {
        if (!impressions[key][keys.frequency]) {
          // console.log(`Removing ${key} - since it does not have a frequency`,impressions[key]);
          delete impressions[key];
        }
      }
    }
    // console.log('Filtered: ',impressions);
    return impressions;
  }

  migrateImpressionsData() {
    let impressions;
    let impressionsData;
    try {
      impressionsData = window.localStorage.getItem(keys.impressions);
    }
    catch (err) {
      // In case of thrown 'SecurityError' or 'QuotaExceededError', the variable should be undefined
      impressionsData = undefined;
    }
    try {
      impressions = JSON.parse(impressionsData);
    }
    catch (err) {
      // Here is where old impression data is converted to new format
      impressions = {};
      const oldImpressionsArray = impressionsData.split(';').filter(e => e);

      oldImpressionsArray.forEach((impression) => {
        try {
          const adUnitImpression = impression.split(' = ');
          const name = adUnitImpression[0];
          const data = adUnitImpression[1];
          const tmp = name.split('.');
          let target = tmp.pop();
          if (target && target === 'hp') {
            target = 'homepage';
          }
          const slotId = tmp.join('.');
          const id = `${slotId}_${target}`;
          const exposed = parseInt(data.split('/')[0], 10) || 0;
          const expires = parseInt(data.split('/')[1], 10) || this.now;
          impressions[id] = {};
          impressions[id][keys.adSlotId] = slotId;
          impressions[id][keys.target] = target;
          impressions[id][keys.exposed] = exposed;
          impressions[id][keys.expires] = expires;
        }
        catch (err1) {
          // console.log(`Failed converting impression: ${impression}`, err1);
        }
      });
    }
    return impressions || {};
  }

  /**
   * Define the debounced version of the local storage save
   */
  saveImpressionsToLocalStorage() {
    if (this.debouncedSave && typeof this.debouncedSave === 'function') {
      this.debouncedSave();
    }
    else {
      this.debouncedSave = debounce(this.saveImpressionsToLocalStorageImpl, 250, false);
      this.debouncedSave();
    }
  }

  /**
   * Implementation of saving the impression map to localstorage
   */
  saveImpressionsToLocalStorageImpl() {
    try {
      localStorage.setItem(keys.impressions, JSON.stringify(this.impressions));
    }
    catch (err) {
      /* In case of thrown 'SecurityError' or 'QuotaExceededError',
       the operation should not break*/
      console.error('localStorage isn\'t available:', err); // eslint-disable-line no-console
    }
  }

  /**
   * Initializes the impression map based on the retrieved impressions and the global
   * configuration.
   */
  initImpressionMap() {
    Object.keys(this.config).map((key, index) => {
      const adSlotId = key;
      const slot = this.impressions[adSlotId];
      let shouldUpdateExpiryDate = false;
      // Case I: Existing slot (update)
      if (slot) {
        // Case I.I Existing slot, frequency has changed
        if (this.config[adSlotId][keys.frequency] !== slot[keys.frequency]) {
          // Updating the frequency will trigger a new expiry date
          shouldUpdateExpiryDate = true;
          this.impressions[adSlotId][keys.frequency] = this.config[adSlotId][keys.frequency];
        } // Case I.II Existing slot, old expiry date
        else if (this.now > slot[keys.expires]) {
          // Old value that should trigger a new expiry date
          shouldUpdateExpiryDate = true;
        }
      } // Case II: Non-existing slot (create new slot)
      else {
        this.initSlotFromConfig(adSlotId);
      } // Finally, updates the expiry date (cases I.I and I.II)
      if (shouldUpdateExpiryDate) {
        this.updateExpiryDate(adSlotId);
      }
      return this;
    });
  }

  /**
   * Updates the expiry date of a slotName based on the configured slot frequency
   * @param {String} slotName - the slotName to update.
   */
  updateExpiryDate(slotName) {
    const now = new Date();
    if (!(this.impressions[slotName] && this.impressions[slotName][keys.frequency])) {
      throw new Error(`Unable to update expiry date for slot: ${slotName}
      - this.impressions[slotName]:`, this.impressions[slotName]);
    }
    const frequencyMap = this.impressions[slotName][keys.frequency].match(keys.frequencyRegex);
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(0);
    if (frequencyMap.indexOf(keys.days) > -1) {
      now.setHours(0);
    }
    this.impressions[slotName][keys.expires] = (frequencyMap.indexOf(keys.days) > -1 ?
      addDays(now, frequencyMap[2]) : addHours(now, frequencyMap[2])).getTime();

    // Set max impressions:
    this.impressions[slotName][keys.maxImpressions] = parseInt(frequencyMap[1], 10);
    // Reset exposed
    this.impressions[slotName][keys.exposed] = 0;
  }

  /**
   * Initializes a non-existing slot from the passed global configuration for the slot
   * @param {String} slotName - the name of the slot to create
   */
  initSlotFromConfig(slotName) {
    const slot = this.impressions[slotName] || {};
    slot[keys.frequency] = this.config[slotName][keys.frequency];
    slot[keys.target] = this.config[slotName][keys.target];
    slot[keys.exposed] = 0;
    this.impressions[slotName] = slot;
    this.updateExpiryDate(slotName);
  }

  /**
   * Registers an impression for a given adSlot.
   * @param {String} adSlotId - the adSlot id to register an impression for
   * @returns {boolean} returns true iff the impression has been registered
   */
  registerImpression(adSlotId) {
    if (adSlotId) {
      const slot = this.impressions[adSlotId];
      if (slot) {
        const exposed = slot[keys.exposed];
        if (isNaN(parseInt(exposed, 10)) === false) {
          this.impressions[adSlotId][keys.exposed] += 1;
          try {
            this.saveImpressionsToLocalStorage();
          }
          catch (err) {
            // console.log('Error saving ad impressions to localStorage!', err);
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Checks whether an adSlot has reached it's allocated impressions count.
   * @param {String} adSlotId - the adSlot to check
   * @returns {boolean} true iff there is a quota for the adSlot, and it has been reached
   */
  reachedQuota(adSlotId) {
    // An adSlotId is suffixed with _homepage | _section if it's targeting is different
    // between the two. If there is no difference, an _all suffix can be used.
    const slotName = this.impressions[`${adSlotId}${globalConfig.department}`] ?
      `${adSlotId}${globalConfig.department}` : `${adSlotId}_all`;

    const slot = this.impressions[slotName];
    let atQuota = false;
    if (slot) {
      const now = (new Date()).getTime();
      // Second element of 2/4day matches '2'
      const expires = this.impressions[slotName][keys.expires];
      if (expires < now) {
        this.updateExpiryDate(slotName);
      }
      else {
        const maxImpressions = this.impressions[slotName][keys.maxImpressions];
        // Not expired, did reach max impressions?
        if (maxImpressions) {
          atQuota = this.impressions[slotName][keys.exposed] >= maxImpressions;
        }
      }
    }
    return atQuota;
  }


  /**
   * Clears the impression map from 'exposed' impressions
   */
  resetImpressions() {
    const impressions = this.impressions;
    for (const key in impressions) {
      if ({}.hasOwnProperty.call(impressions, key)) {
        if (impressions[key][keys.exposed]) {
          impressions[key][keys.exposed] = 0;
        }
      }
    }
    this.saveImpressionsToLocalStorage();
  }
}
