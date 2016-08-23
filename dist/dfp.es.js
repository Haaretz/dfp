/*!
 * DFP v1.10.1
 * (c) 2016 Elia Grady
 * Released under the MIT License.
 */
/**
 * Htz-cookie-util
 * @module htzCookieUtil
 * @author Elia Grady elia.grady@haaretz.co.il
 * @license MIT
 */

/**
 * Translates Key-Value string into a convenient map.
 * @param {String} string String in format of "key<operator>value<separator>....."
 * @param {object} options object for overriding defaults:
 * options.separator is a String or regExp that separates between each key value pairs
 * (default is ';'). options.operator is a String or regExp that separates between each key
 * and value within a pair (default is '=').
 * @returns {object} a map object, with key-value mapping according to the passed configuration.
 */
function stringToMap(string,
  { separator = ';', operator = '=' } = {}) {
  const map = {};
  const itemsArr = string.split(separator);
  itemsArr.forEach(element => {
    if (typeof element === 'string') {
      const keyValue = element.split(operator);
      if (keyValue.length === 2) {
        map[keyValue[0]] = decodeURIComponent(keyValue[1]);
      }
    }
  });
  return map;
}
const ssoKey = window.location.hostname.indexOf('haaretz.com') > -1 ? 'engsso' : 'tmsso';

// Translates Cookie string into a convenient map.
function getCookieAsMap() {
  const map = stringToMap(document.cookie, { separator: /;\s?/ });
  if (typeof map.tmsso === 'string') {
    map.tmsso = stringToMap(map.tmsso, { separator: ':' });
  }
  if (typeof map.engsso === 'string') {
    map.engsso = stringToMap(map.engsso, { separator: ':' });
  }
  return map;
}

/* global dfpBaseConf */
// globalConfig for DFP
const dfpConfig = Object.assign({
  get referrer() {
    return document.referrer ? document.referrer : '';
  },
  get isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(window.navigator.userAgent || ''));
  },
  /**
   * Returns true iff the loaded page is the homepage (no inner path)
   * @returns {boolean}
   */
  get isHomepage() {
    return window.location.pathname === '/' || this.environment === 3; // 'prod'
  },
  get department() {
    return this.isHomepage ? '_homepage' : '_section';
  },
  /**
   * returns the domain the page was loaded to. i.e: 'haaretz.co.il', 'haaretz.com'
   * @returns {string} the domain name from the windows's location hostname property
   */
  get domain() {
    const regexMatch = /([\d|\w]+)(\.co\.il|\.com)(.*)?/.exec(window.location.hostname);
    const result = regexMatch ? regexMatch[0] : window.location.hostname;
    return result;
  },
  /**
   * Returns an array of concatenated paths, separated by a dot.
   * For example, for the URL:
   * http://www.haaretz.co.il/news/world/america/us-election-2016/LIVE-1.2869045
   * the path is '/news/world/america/us-election-2016/LIVE-1.2869045'.
   * This function takes the directories ['news', 'world', 'america', 'us-election-2016']
   * and converts it to the following format:
   * ['.news', '.news.world', '.news.world.america', '.news.world.america.us-election-2016']
   * This denotes the path configuration for the given adSlot
   * @returns {Array.<T>} an array of path names
   */
  get path() {
    let sectionArray = this.articleId ?
      window.location.pathname.split('/').slice(1, -1) :
      window.location.pathname.split('/').slice(1);
    sectionArray = sectionArray.filter(path =>
    path !== 'wwwMobileSite' && path !== 'whtzMobileSite');
    return sectionArray
      .map(section => `.${section}`)
      .map((section, index, arr) => arr.slice(0, index + 1)
        .reduce((last, current) => last.concat(current)));
  },
  /**
   * Returns the current environment targeting param, if such is defined.
   * @returns {number} targeting param, 1 for local development, 2 for test servers and 3 for prod.
   * May return undefined if no targeting is specified.
   */
  get environment() {
    const env = {
      dev: 1,
      test: 2,
      prod: 3,
    };
    return window.location.port === '8080' ? env.dev :
      (window.location.hostname.indexOf('pre.haaretz.co.il') > -1
      || window.location.hostname.indexOf('tmtest.themarker.com') > -1) ? env.test :
        (window.location.pathname.indexOf('/cmlink/Haaretz.HomePage') > -1
        || window.location.pathname.indexOf('/cmlink/TheMarker.HomePage') > -1)
          ? env.prod : undefined;
  },
  /**
   * Returns the articleIf if on an article page, or null otherwise
   * @returns {string} an articleId string from the pathname, or null if none is found
   */
  get articleId() {
    const articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
    let articleId;
    if (articleIdMatch) {
      articleId = articleIdMatch.pop(); // Converts ["1.23145"] to "1.23145"
    }
    return articleId;
  },
  utm_: {
    get content() {
      return this.getUrlParam('utm_content');
    },
    get source() {
      return this.getUrlParam('utm_source');
    },
    get medium() {
      return this.getUrlParam('utm_medium');
    },
    get campaign() {
      return this.getUrlParam('utm_campaign');
    },
    getUrlParam(key) {
      const results = RegExp(`(${key})(=)([^&"]+)`).exec(window.location.search);
      return results && results[3] ? results[3] : undefined;
    },
  },
  get adBlockRemoved() {
    let adBlockRemoved = false;
    try {
      if (localStorage.getItem('adblock_removed')) {
        adBlockRemoved = true;
      }
    }
    catch (err) {
      // do nothing
    }
    return adBlockRemoved;
  },
  get wifiLocation() {
    let wifiLocation = '';
    const cookieMap = getCookieAsMap();
    try {
      if (cookieMap && cookieMap._htzwif) { // eslint-disable-line no-underscore-dangle
        wifiLocation = (cookieMap._htzwif === 'arcaffe') // eslint-disable-line no-underscore-dangle
          ? 'ArCafe' : 'university';
      }
    }
    catch (err) {
      // do nothing
    }
    return wifiLocation;
  },
  get gStatCampaignNumber() {
    let gstatCampaign;
    try {
      gstatCampaign = localStorage.getItem('GstatCampaign') ?
        JSON.parse(localStorage.getItem('GstatCampaign')) : undefined;
    }
    catch (err) {
      /* In case of thrown 'SecurityError' or 'QuotaExceededError',
       the variable should be undefined */
      gstatCampaign = undefined;
    }
    return gstatCampaign ? gstatCampaign.CampaignNumber : undefined;
  },
  adSlotConfig: {
    'haaretz.co.il.example.slot': {
      id: 'slotId',
      // path : "/network/base/slotId/slotId_subsection", Will be calculated from AdManager
      responsive: true,
      adSizeMapping: [['width1', 'height1'], ...['widthN', 'heightN']],
      priority: 'normal',
      fluid: false,
      responsiveAdSizeMapping: {
        xxs: [['width1', 'height1'], ...['widthN', 'heightN']],
        xs: [['width1', 'height1'], ...['widthN', 'heightN']],
        s: [['width1', 'height1'], ...['widthN', 'heightN']],
        m: [['width1', 'height1'], ...['widthN', 'heightN']],
        l: [['width1', 'height1'], ...['widthN', 'heightN']],
        xl: [['width1', 'height1'], ...['widthN', 'heightN']],
        xxl: [['width1', 'height1'], ...['widthN', 'heightN']],
      },
      blacklistReferrers: 'comma, delimited, blacklisted, referrer, list',
      whitelistReferrers: 'comma, delimited, referrer, list',
    },
  },
  adManagerConfig: {
    network: '9401',
    adUnitBase: 'haaretz.co.il_Web',
  },
  breakpointsConfig: {
    get breakpoints() {
      const isType1 = true; // Override in VM from backend to control this toggle.
      return isType1 ? this.breakpoints1 : this.breakpoints2;
    },
    // Type 1
    breakpoints1: {
      xxs: 600,
      xs: 761,
      s: 993,
      m: 1009,
      l: 1291,
      xl: 1600,
      xxl: 1900,
    },
    // Type 2
    breakpoints2: {
      xxs: 600,
      xs: 1000,
      s: 1150,
      m: 1281,
      l: 1600,
      xl: 1920,
      xxl: 1920,
    },
  },
  userConfig: {
    type: undefined,
    age: undefined,
    gender: undefined,
  },
  conflictManagementConfig: {
    'blocking.ad.unit.name': [
      {
        onsize: '1280x200,970x250,3x3',
        avoid: 'blocked.ad.unit.name',
      },
      {
        onsize: '1280x200,970x250,3x3',
        avoid: 'blocked.ad.unit.name',
      },
    ],
  },
  impressionManagerConfig: {
    'ad.unit.name': {
      target: 'all|section|homepage',
      frequency: '$1/$2(day|hour)',
      exposed: 0,
      expires: (new Date()).getTime(),
    },
  },
  sso: ssoKey,

}, window.dfpConfig);

/**
 * Helper function. Adds N hours to a given date object.
 * @param {Date} date - the date to derive from
 * @param {Number} hours - the amount of hours to add, in whole numbers
 * @throws {SyntaxError} Will throw if the 'date' param is not provided
 * @throws {SyntaxError} Will throw if the 'hours' param is not provided
 * @throws {TypeError} Will throw if the 'hours' param is not a valid integer
 * @returns {Date} date - the new date, derived from adding the given hours
 */
function addHours(date, hours) {
  if (!date) {
    throw new SyntaxError('addHours called without a required \'date\' parameter!');
  }
  if (!hours) {
    throw new SyntaxError('addHours called without a required \'hours\' parameter!');
  }
  else if (isNaN(parseInt(hours, 10))) {
    throw new TypeError('addHours called with an invalid integer \'hours\' parameter!');
  }
  const result = new Date(date);
  result.setHours(result.getHours() + parseInt(hours, 10));
  return result;
}

/**
 * Helper function. Adds N days to a given date object.
 * @param {Date} date - the date to derive from
 * @param {Integer} days - the amount of days to add
 * @throws {SyntaxError} Will throw if the 'date' param is not provided
 * @throws {SyntaxError} Will throw if the 'days' param is not provided
 * @throws {TypeError} Will throw if the 'hours' param is not a valid integer
 * @returns {Date} date - the new date, derived from adding the given days
 */
function addDays(date, days) {
  if (!date) {
    throw new SyntaxError('addDays called without a required \'date\' parameter!');
  }
  if (!days) {
    throw new SyntaxError('addDays called without a required \'days\' parameter!');
  }
  else if (isNaN(parseInt(days, 10))) {
    throw new TypeError('addDays called with an invalid integer \'days\' parameter!');
  }
  const result = new Date(date);
  result.setDate(result.getDate() + parseInt(days, 10));
  return result;
}

const breakpoints = dfpConfig.breakpointsConfig.breakpoints;

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * @param {function} func - the function to run
 * @param {Number} wait - the timeout period to avoid running the function
 * @param {Boolean} immediate - leading edge modifier
 * @returns {function} the debounced function
 * //TODO translate to ES6 format or import lodash debounce instead
 */
function debounce(func, wait = 100, immediate) {
  let timeout;
  return function debounced() {
    const context = this;
    const args = arguments;// eslint-disable-line prefer-rest-params
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Returns the current breakpoint that is closest to the window's width
 * @returns {number} the break that the current width represents
 */
function getBreakpoint() {
  let breakpoint;
  const windowWidth = window.innerWidth;
  switch (windowWidth) {
    case windowWidth < breakpoints.xs: breakpoint = breakpoints.xxs; break;
    case windowWidth < breakpoints.s: breakpoint = breakpoints.xs; break;
    case windowWidth < breakpoints.m: breakpoint = breakpoints.s; break;
    case windowWidth < breakpoints.l: breakpoint = breakpoints.m; break;
    case windowWidth < breakpoints.xl: breakpoint = breakpoints.l; break;
    case windowWidth < breakpoints.xxl: breakpoint = breakpoints.xl; break;
    default: breakpoint = breakpoints.xxl;
  }
  return breakpoint;
}
/**
 * Returns the current breakpoint that is closest to the window's width
 * @param {string} breakpoint - the breakpoint label enumerator that the current width represents
 * @returns {string} breakpoint - the breakpoint label that the current width represents,
 * as a string
 */
function getBreakpointName(breakpoint) {
  let resultBreakpoint;
  const windowWidth = breakpoint || window.innerWidth;
  switch (windowWidth) {
    case windowWidth < breakpoints.xs: resultBreakpoint = 'xxs'; break;
    case windowWidth < breakpoints.s: resultBreakpoint = 'xs'; break;
    case windowWidth < breakpoints.m: resultBreakpoint = 's'; break;
    case windowWidth < breakpoints.l: resultBreakpoint = 'm'; break;
    case windowWidth < breakpoints.xl: resultBreakpoint = 'l'; break;
    case windowWidth < breakpoints.xxl: resultBreakpoint = 'xl'; break;
    default: resultBreakpoint = 'xxl';
  }
  return resultBreakpoint;
}

const keys = {
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

class ImpressionsManager {

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
    const slotName = this.impressions[`${adSlotId}${dfpConfig.department}`] ?
      `${adSlotId}${dfpConfig.department}` : `${adSlotId}_all`;

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

const userTypes$1 = {
  payer: 'payer',
  registered: 'registered',
  anonymous: 'anonymous',
};

class User {
  constructor(config) {
    this.config = Object.assign({}, config.userConfig);
    const cookieMap = getCookieAsMap();
    this.ssoKey = dfpConfig.sso;
    if (!cookieMap[this.ssoKey]) {
      // Flips the ssoKey, since cookieMap.ssoKey cannot be used to retrieve data
      this.ssoKey = this.ssoKey === 'tmsso' ? 'engsso' : 'tmsso';
    }
    this.type = this.getUserType(cookieMap);
    this.impressionManager = new ImpressionsManager(config.impressionManagerConfig);
    this.age = this.getUserAge(cookieMap);
    this.gender = this.getUserGender(cookieMap);
  }

  getUserType(cookieMap) {
    let userType;
    if (cookieMap && cookieMap[this.ssoKey]) {
      const payerProp = window.location.hostname.indexOf('haaretz.com') > -1 ?
        'HdcPusr' : 'HtzPusr';
      userType = cookieMap[payerProp] ? userTypes$1.payer : userTypes$1.registered;
    }
    else {
      userType = userTypes$1.anonymous;
    }
    return userType;
  }

  getUserAge(cookieMap) {
    let age;
    const usrae = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].usrae;
    if (usrae) {
      age = parseInt(cookieMap[this.ssoKey].usrae, 10);
      age = age > 0 ? age : undefined;
    }
    return age;
  }

  getUserGender(cookieMap) {
    let gender;
    const urgdr = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].urgdr;
    if (urgdr) {
      gender = parseInt(cookieMap[this.ssoKey].urgdr, 10);
      gender = gender === 2 || gender === 1 ? gender : undefined;
    }
    return gender;
  }
}

class ConflictResolver {
  constructor(conflictManagementConfig) {
    this.dependencyMap = this.initializeDependencyMap(conflictManagementConfig);
    this.deferredSlots = new Set();
  }
  initializeDependencyMap(conflictManagementJson) {
    const queue = new Map();
    Object.keys(conflictManagementJson).map((key, value) => {
      let rules = conflictManagementJson[key];
      if (rules) {
        rules = rules.filter((item) => item.onsize && item.avoid);
      }
      queue.set(key, {
        id: key,
        rules,
        resolvedWith: null,
      });
      return this;
    });
    return queue;
  }

  updateResolvedSlot(adSlotId, resolvedSize) {
    if (!adSlotId) {
      throw new Error('updateResolvedSlot must be called with an adSlotId!');
    }
    if (!resolvedSize) {
      throw new Error('updateResolvedSlot must be called with a resolved size!');
    }
    if (this.dependencyMap.has(adSlotId)) {
      this.dependencyMap.get(adSlotId).resolvedWith = resolvedSize;
    }
  }


  isBlocked(adSlotId) {
    if (!adSlotId) {
      throw new Error('isBlocked must be called with an adSlotId!');
    }
    let isBlocked = false;
    for (const adSlotKey of this.dependencyMap.keys()) {
      const adSlot = this.dependencyMap.get(adSlotKey);
      for (const adSlotRule of adSlot.rules) {
        // Found rule specific to our target
        if (adSlotRule.avoid === adSlotId) {
          const parentResolvedWith = adSlot.resolvedWith;
          // Fail fast: parent is not resolved yet - unknown returned size.
          if (!parentResolvedWith) {
            isBlocked = true;
            this.deferredSlots.add(adSlotId);
          }
          if (adSlotRule.onsize.split(',').find(sizeString => { // eslint-disable-line
            const size = sizeString.split('x').map(numberStr => parseInt(numberStr, 10));
            return this.arraysEqual(size, parentResolvedWith);
          })) {
            // Block found
            this.deferredSlots.add(adSlotId);
            isBlocked = true;
          }
        }
      }
    }
    return isBlocked;
  }

  isBlocking(adSlotId) {
    if (!adSlotId) {
      throw new Error('isBlocking must be called with an adSlotId!');
    }
    let isBlocking = false;
    for (const adSlotKey of this.dependencyMap.keys()) {
      if (adSlotKey === adSlotId) {
        isBlocking = true;
      }
    }
    return isBlocking;
  }

  /**
   * Gets an array of adSlot Ids for a given adSlotId, that are dependent on (blocked by)
   * @param {String} adSlotId - the blocking slot id
   * @return {Array} an array of blocked slot, that has a dependency on the given slot
   */
  getBlockedSlotsIds(adSlotId) {
    let result;
    if (this.dependencyMap.has(adSlotId)) {
      result = Array.from(this.dependencyMap.get(adSlotId).rules.map(adSlot => adSlot.avoid));
    }
    return result || [];
  }

  arraysEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
}
ConflictResolver.EMPTY_SIZE = [];

/* global googletag */
class adSlot {

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
      case adTypes.maavaron: return true;
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
      case adTypes.maavaron: return true;
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
        if (dfpConfig.referrer.indexOf(referrer) > -1) {
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
        if (dfpConfig.referrer.indexOf(referrer) > -1) {
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
        document.getElementById(this.id).classList.remove('h-hidden');
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
      document.getElementById(this.id).classList.add('h-hidden');
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
        const breakpoints = dfpConfig.breakpointsConfig.breakpoints;
        const keys = Object.keys(this.responsiveAdSizeMapping);
        for (const key of keys) { // ['xxs','xs',...]
          responsiveSlotSizeMapping.addSize(
            [breakpoints[key], 100], // 100 is a default height, since it is height agnostic
            this.responsiveAdSizeMapping[key]);
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
    let path = dfpConfig.path || [];
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
        .setTargeting('articleId', [dfpConfig.articleId])
        .setTargeting('stg', [dfpConfig.environment]);
      return slot;
    }
    return null;
  }
}

/**
 * Checks whether two arrays are equal
 * @param {Array} a - the first array to check
 * @param {Array} b - the second array to check
 * @returns {Boolean} true iff both a and b are arrays, with equal values
 */
function arraysEqual(a, b) {
  if (!a || !b) return false;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/* global googletag */
// There are a total of 7 adTargets:
// "all","nonPaying","anonymous","registered","paying","digitalOnly" and "digitalAndPrint"
const adPriorities = {
  high: 'high',
  normal: 'normal',
  low: 'low',
};

const adTargets = {
  all: 'all',
  nonPaying: 'nonPaying',
  anonymous: 'anonymous',
  registered: 'registered',
  paying: 'paying',
  digitalOnly: 'digitalOnly',
  digitalAndPrint: 'digitalAndPrint',
};

// There are a total of 3 userTypes: "anonymous", "registered" and "payer"
const userTypes = {
  anonymous: 'anonymous',
  registered: 'registered',
  payer: 'payer',
};

const adTypes = {
  maavaron: '.maavaron',
  popunder: '.popunder',
  talkback: '.talkback',
  regular: '',
};


class AdManager {

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
      // Holds adSlot objects as soon as possible.
      googletag.cmd.push(() => {
        this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.high);
      });
      // Once DOM ready, add more adSlots.
      document.addEventListener('DOMContentLoaded', () => {
        googletag.cmd.push(() => {
          this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.high);
          googletag.cmd.push(() => {
            this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.normal);
          });
        });
      });
      // Once window was loaded, add the rest of the adSlots.
      window.addEventListener('load', () => {
        googletag.cmd.push(() => {
          this.adSlots = this.initAdSlots(config.adSlotConfig, adPriorities.low);
        });
      });
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
      const adSlot$$ = this.adSlots.get(adSlotKey);
      if (adSlot$$.type !== adTypes.talkback && this.shouldSendRequestToDfp(adSlot$$)) {
        adSlot$$.show();
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
    function priorityFilter(adSlot$$) {
      return adSlot$$.priority === priority;
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
      const adSlot$$ = this.adSlots.get(adSlotKey);
      if (adSlot$$.responsive) {
        if (adSlot$$.lastResolvedWithBreakpoint !== currentBreakpoint &&
          this.shouldSendRequestToDfp(adSlot$$)) {
          // console.log(`calling refresh for adSlot: ${adSlot.id}`);
          adSlot$$.refresh();
        }
        else {
          adSlot$$.hide();
        }
      }
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
    // adSlotPlaceholders = adSlotPlaceholders.sort((a,b) => a.offsetTop - b.offsetTop);
    adSlotPlaceholders.forEach(adSlot$$ => {
      const adSlotPriority = adSlotConfig[adSlot$$.id] ?
      adSlotConfig[adSlot$$.id].priority || adPriorities.normal : undefined;
      if (adSlotConfig[adSlot$$.id] && adSlots.has(adSlot$$.id) === false &&
        adSlotPriority === filteredPriority) {
        // The markup has a matching configuration from adSlotConfig AND was not already defined
        try {
          // adSlotConfig is built from globalConfig, but can be overridden by markup
          const computedAdSlotConfig = Object.assign({}, adSlotConfig[adSlot$$.id], {
            id: adSlot$$.id,
            target: adSlot$$.attributes['data-audtarget'] ?
              adSlot$$.attributes['data-audtarget'].value : adTargets.all,
            type: this.getAdType(adSlot$$.id),
            responsive: adSlotConfig[adSlot$$.id].responsive,
            fluid: adSlotConfig[adSlot$$.id].fluid || false,
            user: this.user,
            adManager: this,
            htmlElement: adSlot$$,
            department: this.config.department,
            network: this.config.adManagerConfig.network,
            adUnitBase: this.config.adManagerConfig.adUnitBase,
            deferredSlot: this.conflictResolver.isBlocked(adSlot$$.id),
            priority: adSlotPriority,
          });
          const adSlotInstance = new adSlot(computedAdSlotConfig);
          adSlots.set(adSlot$$.id, adSlotInstance);
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
  shouldSendRequestToDfp(adSlot$$) {
    // Conflict management check
    return this.conflictResolver.isBlocked(adSlot$$.id) === false &&
      // Valid Referrer check
      adSlot$$.isWhitelisted() &&
      // Not in referrer Blacklist
      adSlot$$.isBlacklisted() === false &&
      this.shouldDisplayAdAfterAdBlockRemoval(adSlot$$) &&
      // Responsive: breakpoint contains ad?
      this.doesBreakpointContainAd(adSlot$$) &&
      // Targeting check (userType vs. slotTargeting)
      this.doesUserTypeMatchBannerTargeting(adSlot$$) &&
      // Impressions Manager check (limits number of impressions per slot)
      this.user.impressionManager.reachedQuota(adSlot$$.id) === false;
  }

  shouldDisplayAdAfterAdBlockRemoval(adSlot$$) {
    return !(this.config.adBlockRemoved === true &&
    (adSlot$$.type === adTypes.maavaron ||
    adSlot$$.type === adTypes.popunder));
  }

  /**
   * Check whether or not an ad slot should appear for the current user type
   * @param {String} adSlotOrTarget the adSlot to check or the target as a string
   * @returns {boolean} true iff the slot should appear for the user type
   */
  doesUserTypeMatchBannerTargeting(adSlotOrTarget) {
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
      const adSlot$$ = this.adSlots.get(adSlotKey);
      if (adSlot$$.responsive === true && adSlot$$.lastResolvedWithBreakpoint) {
        if (adSlot$$.lastResolvedWithBreakpoint !== breakpoint) {
          adSlot$$.refresh();
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
  doesBreakpointContainAd(adSlot$$, breakpoint = getBreakpoint()) {
    if (!adSlot$$) {
      throw new Error('Missing argument: a call to doesBreakpointContainAd must have an adSlot');
    }
    let containsBreakpoint = true;
    if (adSlot$$.responsive === true) {
      const mapping = adSlot$$.responsiveAdSizeMapping[getBreakpointName(breakpoint)];
      if (Array.isArray(mapping) === false) {
        throw new Error(`Invalid argument: breakpoint:${breakpoint} doesn't exist!`, this);
      }
      containsBreakpoint = mapping.length > 0 && !arraysEqual(mapping, [0, 0]);
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
          const adSlot$$ = this.adSlots.get(id);
          adSlot$$.lastResolvedSize = resolvedSize;
          adSlot$$.lastResolvedWithBreakpoint = getBreakpoint();
          if (isEmpty) {
            adSlot$$.lastResolvedSize = ConflictResolver.EMPTY_SIZE;
            adSlot$$.hide();
            this.releaseSlotDependencies(adSlot$$);
          }
          else {
            this.user.impressionManager.registerImpression(`${adSlot$$.id}${this.config.department}`);
            this.user.impressionManager.registerImpression(`${adSlot$$.id}_all`);
            this.releaseSlotDependencies(adSlot$$, adSlot$$.lastResolvedSize);
          }
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

  releaseSlotDependencies(adSlot$$) {
    try {
      const id = adSlot$$.id;
      this.conflictResolver.updateResolvedSlot(id, adSlot$$.lastResolvedSize);
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
      console.error(`Cannot updateSlotDependencies for adSlot: ${adSlot$$.id}`);
      /* eslint-enable no-console*/
    }
  }

  /**
   * Initializes page-level targeting params.
   */
  initGoogleTargetingParams() {
    if (window.googletag && window.googletag.apiReady) {
      // Returns a reference to the pubads service.
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
      if (this.config.gStatCampaignNumber && this.config.gStatCampaignNumber !== -1) {
        pubads.setTargeting('gstat_campaign_id', [this.config.gStatCampaignNumber]);
      }

      // UTM targeting
      /* eslint-disable no-underscore-dangle */
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
      /* eslint-enable no-underscore-dangle */
      // AdBlock removal
      if (this.config.adBlockRemoved) {
        pubads.setTargeting('adblock_removed', [this.config.adBlockRemoved]);
      }
      // University targeting - triggered via cookie
      if (this.config.wifiLocation) {
        pubads.setTargeting('wifi', [this.config.wifiLocation]);
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
      if (window.location.search &&
        window.location.search.indexOf('sraon') > 0) {
        console.log('enableSingleRequest mode: active');// eslint-disable-line no-console
        googletag.pubads().enableSingleRequest();
      }
      if (!this.config.isMobile) {
        googletag.pubads().enableAsyncRendering();
      }
      else {
        googletag.pubads().enableAsyncRendering();
        // disabled: googletag.pubads().enableSyncRendering();
      }
      // Enables all GPT services that have been defined for ad slots on the page.
      googletag.enableServices();
    }
    else {
      throw new Error('googletag api wasn\'t ready when \'initGoogleGlobalSettings\' was called!');
    }
  }
}

/* globals googletag */
const defaultConfig = dfpConfig || {};
const googletagInitTimeout = 10000;
const resizeTimeout = 250;

class DFP {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.wasInitialized = false;
    this.breakpoint = getBreakpoint();
    this.initWindowResizeListener();
  }

  /**
   * This part of the object's construction is dependent on the call to 'init'
   */
  resumeInit() {
    try {
      this.adManager = new AdManager(this.config);
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
    }
  }

  /**
   * initializes the 'googletag' global namespace and add the
   * google publish tags library to the page
   * @returns {Promise} that resolves to true once the googletag api is ready to use
   * (googletag.apiReady = true)
   */
  initGoogleTag() {
    const dfpThis = this;
    return new Promise((resolve, reject) => {
      if (dfpThis.wasInitialized === true || (window.googletag && window.googletag.apiReady)) {
        this.adManager = this.adManager || new AdManager(this.config);
        dfpThis.wasInitialized = true;
        resolve(this.isGoogleTagReady);
      }
      else {
        // set up a place holder for the gpt code downloaded from google
        window.googletag = window.googletag || {};

        // this is a command queue used by GPT any methods added to it will be
        // executed when GPT code is available, if GPT is already available they
        // will be executed immediately
        window.googletag.cmd = window.googletag.cmd || [];
        // load google tag services JavaScript
        (() => {
          const tag = window.document.createElement('script');
          tag.async = false;
          tag.type = 'text/javascript';
          // var useSSL = 'https:' == document.location.protocol;
          tag.setAttribute('src', '//www.googletagservices.com/tag/js/gpt.js');
          const node = window.document.getElementsByTagName('script')[0];
          tag.onload = () => {
            dfpThis.wasInitialized = true;
            dfpThis.resumeInit();
            resolve(this.isGoogleTagReady);
          };
          tag.onerror = (error) => {
            dfpThis.wasInitialized = false;
            reject(error);
          };
          node.parentNode.insertBefore(tag, node);
        })();
      }
    });
  }

  /**
   *
   * @returns {Promise}
   */
  isGoogleTagReady() {
    const promise = new Promise((resolve, reject) => {
      googletag.cmd.push(() => {
        resolve(this);
      });
      setTimeout(() => {
        if (!(googletag && googletag.apiReady === true)) {
          reject(new Error('googletag failed to initialize on the page!'));
        }
      }, googletagInitTimeout);
    });
    return promise;
  }

  /**
   * Initializes the window resize listener to support responsive ad refreshes
   */
  initWindowResizeListener() {
    const dfpThis = this;
    function onResize() {
      const currentBreakpoint = getBreakpoint();
      if (dfpThis.breakpoint !== currentBreakpoint) {
        dfpThis.breakpoint = currentBreakpoint;
        if (dfpThis.adManager) {
          dfpThis.adManager.refreshAllSlots();
        }
        else {
          throw new Error('initWindowResizeListener error - adManager instance is not available');
        }
      }
    }
    const debouncedFunction = debounce(onResize, resizeTimeout);
    window.onresize = debouncedFunction;
  }
}

// Correct version will be set with the 'rollup-replace plugin'
DFP.version = '1.10.1';

/*
 // Only for development mode
 if ( "production" !== 'production' ) {
 DFP.dev = '123';
 }
 */

const config = dfpConfig;
const version = DFP.version;

export { config, version };export default DFP;
//# sourceMappingURL=dfp.es.js.map
