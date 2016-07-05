/*!
 * DFP v1.8.7
 * (c) 2016 Elia Grady
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.DFP = global.DFP || {})));
}(this, function (exports) { 'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers;

  /**
   * Htz-cookie-util
   * @module htzCookieUtil
   * @author Elia Grady elia.grady@haaretz.co.il
   * @license MIT
   */

  /**
   * Translates Key-Value string into a convenient map.
   * @param {string} string String in format of "key<operator>value<separator>....."
   * @param {object} options object for overriding defaults:
   * options.separator is a String or regExp that separates between each key value pairs
   * (default is ';'). options.operator is a String or regExp that separates between each key
   * and value within a pair (default is '=').
   * @returns {object} a map object, with key-value mapping according to the passed configuration.
   */
  function stringToMap(string) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$separator = _ref.separator;
    var separator = _ref$separator === undefined ? ';' : _ref$separator;
    var _ref$operator = _ref.operator;
    var operator = _ref$operator === undefined ? '=' : _ref$operator;

    var map = {};
    var itemsArr = string.split(separator);
    //console.log(`called stringToMap with separator:`, separator, `therefore, itemsArr is now:`,itemsArr);
    for (var key in itemsArr) {
      if (itemsArr.hasOwnProperty(key)) {
        var keyValue = itemsArr[key].split(operator);
        if (keyValue.length == 2) {
          //Only operate on valid splits
          map[keyValue[0]] = decodeURIComponent(keyValue[1]);
        }
      }
    }
    return map;
  }
  var ssoKey = window.location.hostname.indexOf('haaretz.com') > -1 ? 'engsso' : 'tmsso';

  // Translates Cookie string into a convenient map.
  function getCookieAsMap() {
    var map = stringToMap(document.cookie, { separator: /;\s?/ });
    if (typeof map['tmsso'] === 'string') {
      map['tmsso'] = stringToMap(map['tmsso'], { separator: ':' });
    }
    if (typeof map['engsso'] === 'string') {
      map['engsso'] = stringToMap(map['engsso'], { separator: ':' });
    }
    return map;
  }

  //globalConfig for DFP
  var dfpConfig = Object.assign({
    get referrer() {
      return document.referrer ? document.referrer : "";
    },
    get isMobile() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent || "")
      );
    },
    /**
     * Returns true iff the loaded page is the homepage (no inner path)
     * @returns {boolean}
     */
    get isHomepage() {
      return window.location.pathname === "/" || this.environment === 3; //'prod'
    },
    get department() {
      return this.isHomepage ? '_homepage' : '_section';
    },
    /**
     * returns the domain the page was loaded to. i.e: 'haaretz.co.il', 'haaretz.com'
     * @returns {string} the domain name from the windows's location hostname property
     */
    get domain() {
      var regexMatch = /([\d|\w]+)(\.co\.il|\.com)(.*)?/.exec(window.location.hostname);
      var result = regexMatch ? regexMatch[0] : window.location.hostname;
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
      var sectionArray = this.articleId ? window.location.pathname.split('/').slice(1, -1) : window.location.pathname.split('/').slice(1);
      sectionArray = sectionArray.filter(function (path) {
        return path != 'wwwMobileSite' && path != 'whtzMobileSite';
      });
      return sectionArray.map(function (section) {
        return "." + section;
      }).map(function (section, index, arr) {
        return arr.slice(0, index + 1).reduce(function (last, current) {
          return last.concat(current);
        });
      });
    },
    /**
     * Returns the current environment targeting param, if such is defined.
     * @returns {number} targeting param, 1 for local development, 2 for test servers and 3 for prod.
     * May return undefined if no targeting is specified.
     */
    get environment() {
      var env = {
        dev: 1,
        test: 2,
        prod: 3
      };
      return window.location.port === '8080' ? env.dev : window.location.hostname.indexOf('pre.haaretz.co.il') > -1 || window.location.hostname.indexOf('tmtest.themarker.com') > -1 ? env.test : window.location.pathname.indexOf('/cmlink/Haaretz.HomePage') > -1 || window.location.pathname.indexOf('/cmlink/TheMarker.HomePage') > -1 ? env.prod : undefined;
    },
    /**
     * Returns the articleIf if on an article page, or null otherwise
     * @returns {string} an articleId string from the pathname, or null if none is found
     */
    get articleId() {
      var articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
      var articleId = void 0;
      if (articleIdMatch) {
        articleId = articleIdMatch.pop(); //Converts ["1.23145"] to "1.23145"
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
      getUrlParam: function getUrlParam(key) {
        var results = RegExp("(" + key + ")(=)([^&\"]+)").exec(window.location.search);
        return results && results[3] ? results[3] : undefined;
      }
    },
    get adBlockRemoved() {
      var adBlockRemoved = false;
      try {
        adBlockRemoved = localStorage.getItem('adblock_removed') ? true : false;
      } catch (err) {}
      return adBlockRemoved;
    },
    get wifiLocation() {
      var wifiLocation = '';
      var cookieMap = getCookieAsMap();
      try {
        if (cookieMap && cookieMap['_htzwif']) {
          wifiLocation = cookieMap['_htzwif'] == 'arcaffe' ? 'ArCafe' : 'university';
        }
      } catch (err) {}
      return wifiLocation;
    },
    get gStatCampaignNumber() {
      var gstatCampaign = void 0;
      try {
        gstatCampaign = localStorage.getItem('GstatCampaign') ? JSON.parse(localStorage.getItem('GstatCampaign')) : undefined;
      } catch (err) {
        //In case of thrown 'SecurityError' or 'QuotaExceededError', the variable should be undefined
        gstatCampaign = undefined;
      }
      return gstatCampaign ? gstatCampaign['CampaignNumber'] : undefined;
    },
    adSlotConfig: {
      "haaretz.co.il.example.slot": {
        id: "slotId",
        //path : "/network/base/slotId/slotId_subsection", Will be calculated from AdManager
        responsive: true,
        adSizeMapping: [['width1', 'height1']].concat(['widthN', 'heightN']),
        priority: 'normal',
        fluid: false,
        responsiveAdSizeMapping: {
          xxs: [['width1', 'height1']].concat(['widthN', 'heightN']),
          xs: [['width1', 'height1']].concat(['widthN', 'heightN']),
          s: [['width1', 'height1']].concat(['widthN', 'heightN']),
          m: [['width1', 'height1']].concat(['widthN', 'heightN']),
          l: [['width1', 'height1']].concat(['widthN', 'heightN']),
          xl: [['width1', 'height1']].concat(['widthN', 'heightN']),
          xxl: [['width1', 'height1']].concat(['widthN', 'heightN'])
        },
        blacklistReferrers: "comma, delimited, blacklisted, referrer, list",
        whitelistReferrers: "comma, delimited, referrer, list"
      }
    },
    adManagerConfig: {
      network: '9401',
      adUnitBase: 'haaretz.co.il_Web'
    },
    breakpointsConfig: {
      get breakpoints() {
        var isType1 = true; //Override in VM from backend to control this toggle.
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
        xxl: 1900
      },
      // Type 2
      breakpoints2: {
        xxs: 600,
        xs: 1000,
        s: 1150,
        m: 1281,
        l: 1600,
        xl: 1920,
        xxl: 1920
      }
    },
    userConfig: {
      type: undefined,
      age: undefined,
      gender: undefined
    },
    conflictManagementConfig: {
      "blocking.ad.unit.name": [{
        onsize: "1280x200,970x250,3x3",
        avoid: "blocked.ad.unit.name"
      }, {
        onsize: "1280x200,970x250,3x3",
        avoid: "blocked.ad.unit.name"
      }]
    },
    impressionManagerConfig: {
      "ad.unit.name": {
        target: 'all|section|homepage',
        frequency: '$1/$2(day|hour)',
        exposed: 0,
        expires: new Date().getTime()
      }
    },
    sso: ssoKey

  }, window.dfpConfig);

  /**
   * Helper function. Adds N hours to a given date object.
   * @param date the date to derive from
   * @param hours the amount of hours to add, in whole numbers
   * @returns {Date} the new date, derived from adding the given hours
   */
  function addHours(date, hours) {
    if (!date) {
      throw new SyntaxError("addHours called without a required 'date' parameter!");
    }
    if (!hours) {
      throw new SyntaxError("addHours called without a required 'hours' parameter!");
    } else if (isNaN(parseInt(hours))) {
      throw new TypeError("addHours called with an invalid integer 'hours' parameter!");
    }
    var result = new Date(date);
    result.setHours(result.getHours() + parseInt(hours));
    return result;
  }

  /**
   * Helper function. Adds N days to a given date object.
   * @param date the date to derive from
   * @param hours the amount of days to add, in whole numbers
   * @returns {Date} the new date, derived from adding the given days
   */
  function addDays(date, days) {
    if (!date) {
      throw new SyntaxError("addDays called without a required 'date' parameter!");
    }
    if (!days) {
      throw new SyntaxError("addDays called without a required 'hours' parameter!");
    } else if (isNaN(parseInt(days))) {
      throw new TypeError("addDays called with an invalid integer 'hours' parameter!");
    }
    var result = new Date(date);
    result.setDate(result.getDate() + parseInt(days));
    return result;
  }

  var breakpoints = dfpConfig.breakpointsConfig.breakpoints;

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing.
   * @param func the function to run
   * @param wait the timeout period to avoid running the function
   * @param immediate leading edge modifier
   * @returns {Function} the debounced function
   * //TODO translate to ES6 format - in progress...
   */
  function debounce(func) {
    var wait = arguments.length <= 1 || arguments[1] === undefined ? 100 : arguments[1];
    var immediate = arguments[2];

    var timeout = void 0;
    return function () {
      var context = this,
          args = arguments;
      var later = function later() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
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
    var breakpoint = breakpoints.xxl;
    var windowWidth = window.innerWidth;
    if (windowWidth < breakpoints.xxl) {
      breakpoint = breakpoints.xl;
    } else {
      return breakpoint;
    }
    if (windowWidth < breakpoints.xl) {
      breakpoint = breakpoints.l;
    } else {
      return breakpoint;
    }
    if (windowWidth < breakpoints.l) {
      breakpoint = breakpoints.m;
    } else {
      return breakpoint;
    }
    if (windowWidth < breakpoints.m) {
      breakpoint = breakpoints.s;
    } else {
      return breakpoint;
    }
    if (windowWidth < breakpoints.s) {
      breakpoint = breakpoints.xs;
    } else {
      return breakpoint;
    }
    if (windowWidth < breakpoints.xs) {
      breakpoint = breakpoints.xxs;
    } else {
      return breakpoint;
    }
    return breakpoint;
  }
  /**
   * Returns the current breakpoint that is closest to the window's width
   * @returns {string} the breakpoint label that the current width represents
   */
  function getBreakpointName(breakpoint) {
    var resultBreakpoint = 'xxl';
    var windowWidth = breakpoint || window.innerWidth;
    if (windowWidth < breakpoints.xxl) {
      resultBreakpoint = 'xl';
    } else {
      return resultBreakpoint;
    }
    if (windowWidth < breakpoints.xl) {
      resultBreakpoint = 'l';
    } else {
      return resultBreakpoint;
    }
    if (windowWidth < breakpoints.l) {
      resultBreakpoint = 'm';
    } else {
      return resultBreakpoint;
    }
    if (windowWidth < breakpoints.m) {
      resultBreakpoint = 's';
    } else {
      return resultBreakpoint;
    }
    if (windowWidth < breakpoints.s) {
      resultBreakpoint = 'xs';
    } else {
      return resultBreakpoint;
    }
    if (windowWidth < breakpoints.xs) {
      resultBreakpoint = 'xxs';
    } else {
      return resultBreakpoint;
    }
    return resultBreakpoint;
  }

  var keys = {
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
    adSlotId: 'id'
  };

  var ImpressionsManager = function () {
    function ImpressionsManager(impressionManagerConfig) {
      babelHelpers.classCallCheck(this, ImpressionsManager);

      this.now = new Date().getTime(); //this date is used for comparisons only
      this.config = Object.assign({}, impressionManagerConfig);
      this.impressions = this.retrieveImpressionsData();
      this.initImpressionMap();
    }

    babelHelpers.createClass(ImpressionsManager, [{
      key: 'retrieveImpressionsData',
      value: function retrieveImpressionsData() {
        var _this = this;

        var impressions = this.migrateImpressionsData();
        //Merge migrated data with new data
        //console.log('Migrated: ',impressions);
        Object.keys(impressions).map(function (key, index) {
          impressions[key] = Object.assign({}, impressions[key], _this.config[key]);
        });
        //console.log('Merged: ',impressions);
        //Filter out entries without frequency
        for (var key in impressions) {
          if (impressions.hasOwnProperty(key)) {
            if (!impressions[key][keys.frequency]) {
              //console.log(`Removing ${key} - since it does not have a frequency`,impressions[key]);
              delete impressions[key];
            }
          }
        }
        //console.log('Filtered: ',impressions);
        return impressions;
      }
    }, {
      key: 'migrateImpressionsData',
      value: function migrateImpressionsData() {
        var _this2 = this;

        var impressions = void 0;
        var impressionsData = void 0;
        try {
          impressionsData = window.localStorage.getItem(keys.impressions);
        } catch (err) {
          //In case of thrown 'SecurityError' or 'QuotaExceededError', the variable should be undefined
          impressionsData = undefined;
        }
        try {
          impressions = JSON.parse(impressionsData);
        } catch (err) {
          //Here is where old impression data is converted to new format
          impressions = {};
          var oldImpressionsArray = impressionsData.split(';').filter(function (e) {
            return e;
          });

          oldImpressionsArray.forEach(function (impression) {
            try {
              var adUnitImpression = impression.split(' = ');
              var name = adUnitImpression[0];
              var data = adUnitImpression[1];
              var tmp = name.split('.');
              var target = tmp.pop();
              if (target && target == 'hp') {
                target = 'homepage';
              }
              var slotId = tmp.join('.');
              var id = slotId + '_' + target;
              var exposed = parseInt(data.split('/')[0]) || 0;
              var expires = parseInt(data.split('/')[1]) || _this2.now;
              impressions[id] = {};
              impressions[id][keys.adSlotId] = slotId;
              impressions[id][keys.target] = target;
              impressions[id][keys.exposed] = exposed;
              impressions[id][keys.expires] = expires;
            } catch (err) {
              console.log('Failed converting impression: ' + impression, err);
            }
          });
        }
        return impressions || {};
      }

      /**
       * Define the debounced version of the local storage save
       */

    }, {
      key: 'saveImpressionsToLocalStorage',
      value: function saveImpressionsToLocalStorage() {
        if (this.debouncedSave && typeof this.debouncedSave === 'function') {
          this.debouncedSave();
        } else {
          this.debouncedSave = debounce(this.saveImpressionsToLocalStorageImpl, 250, false);
          this.debouncedSave();
        }
      }

      /**
       * Implementation of saving the impression map to localstorage
       */

    }, {
      key: 'saveImpressionsToLocalStorageImpl',
      value: function saveImpressionsToLocalStorageImpl() {
        try {
          localStorage.setItem(keys.impressions, JSON.stringify(this.impressions));
        } catch (err) {
          //In case of thrown 'SecurityError' or 'QuotaExceededError', the operation should not break
          console.log('localStorage isn\'t available:', err);
        }
      }

      /**
       * Initializes the impression map based on the retrieved impressions and the global
       * configuration.
       */

    }, {
      key: 'initImpressionMap',
      value: function initImpressionMap() {
        var _this3 = this;

        Object.keys(this.config).map(function (key, index) {
          var adSlotId = key;
          var slot = void 0,
              shouldUpdateExpiryDate = false;
          // Case I: Existing slot (update)
          if (slot = _this3.impressions[adSlotId]) {
            // Case I.I Existing slot, frequency has changed
            if (_this3.config[adSlotId][keys.frequency] = !slot[keys.frequency]) {
              // Updating the frequency will trigger a new expiry date
              shouldUpdateExpiryDate = true;
              _this3.impressions[adSlotId][keys.frequency] = _this3.config[adSlotId][keys.frequency];
            } // Case I.II Existing slot, old expiry date
            else if (_this3.now > slot[keys.expires]) {
                // Old value that should trigger a new expiry date
                shouldUpdateExpiryDate = true;
              }
          } // Case II: Non-existing slot (create new slot)
          else {
              _this3.initSlotFromConfig(adSlotId);
            } //Finally, updates the expiry date (cases I.I and I.II)
          if (shouldUpdateExpiryDate) {
            _this3.updateExpiryDate(adSlotId);
          }
        });
      }

      /**
       * Updates the expiry date of a slotName based on the configured slot frequency
       * @param slotName the slotName to update.
       */

    }, {
      key: 'updateExpiryDate',
      value: function updateExpiryDate(slotName) {
        var now = new Date();
        if (!(this.impressions[slotName] && this.impressions[slotName][keys.frequency])) {
          throw new Error('Unable to update expiry date for slot: ' + slotName + '\n      - this.impressions[slotName]:', this.impressions[slotName]);
        }
        var frequencyMap = this.impressions[slotName][keys.frequency].match(keys.frequencyRegex);
        now.setMilliseconds(0);
        now.setSeconds(0);
        now.setMinutes(0);
        if (frequencyMap.indexOf(keys.days) > -1) {
          now.setHours(0);
        }
        this.impressions[slotName][keys.expires] = (frequencyMap.indexOf(keys.days) > -1 ? addDays(now, frequencyMap[2]) : addHours(now, frequencyMap[2])).getTime();

        //Set max impressions:
        this.impressions[slotName][keys.maxImpressions] = parseInt(frequencyMap[1]);
        //Reset exposed
        this.impressions[slotName][keys.exposed] = 0;
      }

      /**
       * Initializes a non-existing slot from the passed global configuration for the slot
       * @param slotName the name of the slot to create
       */

    }, {
      key: 'initSlotFromConfig',
      value: function initSlotFromConfig(slotName) {
        var slot = this.impressions[slotName] || {};
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

    }, {
      key: 'registerImpression',
      value: function registerImpression(adSlotId) {
        if (adSlotId) {
          var slot = this.impressions[adSlotId];
          if (slot) {
            var exposed = slot[keys.exposed];
            if (isNaN(parseInt(exposed)) === false) {
              this.impressions[adSlotId][keys.exposed] += 1;
              try {
                this.saveImpressionsToLocalStorage();
              } catch (err) {
                console.log('Error saving ad impressions to localStorage!', err);
              }
              return true;
            }
          }
        }
        return false;
      }

      /**
       * Checks whether an adSlot has reached it's allocated impressions count.
       * @param adSlotId the adSlot to check
       * @returns {boolean} true iff there is a quota for the adSlot, and it has been reached
       */

    }, {
      key: 'reachedQuota',
      value: function reachedQuota(adSlotId) {
        // An adSlotId is suffixed with _homepage | _section if it's targeting is different
        // between the two. If there is no difference, an _all suffix can be used.
        adSlotId = this.impressions['' + adSlotId + dfpConfig.department] ? '' + adSlotId + dfpConfig.department : adSlotId + '_all';

        var slot = this.impressions[adSlotId];
        var atQuota = false;
        if (slot) {
          var now = new Date().getTime();
          //Second element of 2/4day matches '2'
          var expires = this.impressions[adSlotId][keys.expires];
          if (expires < now) {
            this.updateExpiryDate(adSlotId);
          } else {
            var maxImpressions = this.impressions[adSlotId][keys.maxImpressions];
            //Not expired, did reach max impressions?
            if (maxImpressions) {
              atQuota = this.impressions[adSlotId][keys.exposed] >= maxImpressions;
            }
          }
        }
        return atQuota;
      }

      /**
       * Clears the impression map from 'exposed' impressions
       */

    }, {
      key: 'resetImpressions',
      value: function resetImpressions() {
        var impressions = this.impressions;
        for (var key in impressions) {
          if (impressions.hasOwnProperty(key)) {
            if (impressions[key][keys.exposed]) {
              impressions[key][keys.exposed] = 0;
            }
          }
        }
        this.saveImpressionsToLocalStorage();
      }
    }]);
    return ImpressionsManager;
  }();

  var userTypes$1 = {
    payer: 'payer',
    registered: 'registered',
    anonymous: 'anonymous'
  };

  var User = function () {
    function User(config) {
      babelHelpers.classCallCheck(this, User);

      this.config = Object.assign({}, config.userConfig);
      var cookieMap = getCookieAsMap();
      this.ssoKey = dfpConfig.sso;
      if (!cookieMap[this.ssoKey]) {
        //console.log(`ssoKey flipped! - was ${this.ssoKey}`);
        //Flips the ssoKey, since cookieMap.ssoKey cannot be used to retrieve data
        this.ssoKey = this.ssoKey === 'tmsso' ? 'engsso' : 'tmsso';
        //console.log(`ssoKey flipped! - now ${this.ssoKey}`);
      }
      this.type = this.getUserType(cookieMap);
      this.impressionManager = new ImpressionsManager(config.impressionManagerConfig);
      this.age = this.getUserAge(cookieMap);
      this.gender = this.getUserGender(cookieMap);
    }

    babelHelpers.createClass(User, [{
      key: 'getUserType',
      value: function getUserType(cookieMap) {
        if (cookieMap && cookieMap[this.ssoKey]) {
          var payerProp = window.location.hostname.indexOf("haaretz.com") > -1 ? 'HdcPusr' : 'HtzPusr';
          return cookieMap[payerProp] ? userTypes$1.payer : userTypes$1.registered;
        } else {
          return userTypes$1.anonymous;
        }
      }
    }, {
      key: 'getUserAge',
      value: function getUserAge(cookieMap) {
        var age = void 0;
        var usrae = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].usrae;
        if (usrae) {
          age = parseInt(cookieMap[this.ssoKey].usrae);
          age = age > 0 ? age : undefined;
        }
        return age;
      }
    }, {
      key: 'getUserGender',
      value: function getUserGender(cookieMap) {
        var gender = void 0;
        var urgdr = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].urgdr;
        if (urgdr) {
          gender = parseInt(cookieMap[this.ssoKey].urgdr);
          gender = gender === 2 || gender === 1 ? gender : undefined;
        }
        return gender;
      }
    }]);
    return User;
  }();

  var ConflictResolver = function () {
    function ConflictResolver(conflictManagementConfig) {
      babelHelpers.classCallCheck(this, ConflictResolver);

      this.dependencyMap = this.initializeDependencyMap(conflictManagementConfig);
      this.deferredSlots = new Set();
    }

    babelHelpers.createClass(ConflictResolver, [{
      key: "initializeDependencyMap",
      value: function initializeDependencyMap(conflictManagementJson) {
        var queue = new Map();
        Object.keys(conflictManagementJson).map(function (key, value) {
          var rules = conflictManagementJson[key];
          if (rules) {
            rules = rules.filter(function (item) {
              return item.onsize && item.avoid;
            });
          }
          queue.set(key, {
            id: key,
            rules: rules,
            resolvedWith: null
          });
        });
        return queue;
      }
    }, {
      key: "updateResolvedSlot",
      value: function updateResolvedSlot(adSlotId, resolvedSize) {
        if (!adSlotId) {
          throw new Error("updateResolvedSlot must be called with an adSlotId!");
        }
        if (!resolvedSize) {
          throw new Error("updateResolvedSlot must be called with a resolved size!");
        }
        if (this.dependencyMap.has(adSlotId)) {
          this.dependencyMap.get(adSlotId).resolvedWith = resolvedSize;
        }
      }
    }, {
      key: "isBlocked",
      value: function isBlocked(adSlotId) {
        var _this = this;

        if (!adSlotId) {
          throw new Error("isBlocked must be called with an adSlotId!");
        }
        var isBlocked = false;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.dependencyMap.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var adSlotKey = _step.value;

            var adSlot = this.dependencyMap.get(adSlotKey);
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = adSlot.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var adSlotRule = _step2.value;

                //Found rule specific to our target
                if (adSlotRule.avoid === adSlotId) {
                  (function () {
                    var parentResolvedWith = adSlot.resolvedWith;
                    // Fail fast: parent is not resolved yet - unknown returned size.
                    if (!parentResolvedWith) {
                      isBlocked = true;
                      _this.deferredSlots.add(adSlotId);
                    }
                    if (adSlotRule.onsize.split(',').find(function (size) {
                      size = size.split('x').map(function (numberStr) {
                        return parseInt(numberStr);
                      });
                      return _this.arraysEqual(size, parentResolvedWith);
                    })) {
                      //Block found
                      _this.deferredSlots.add(adSlotId);
                      isBlocked = true;
                    }
                  })();
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return isBlocked;
      }
    }, {
      key: "isBlocking",
      value: function isBlocking(adSlotId) {
        if (!adSlotId) {
          throw new Error("isBlocking must be called with an adSlotId!");
        }
        var isBlocking = false;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.dependencyMap.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var adSlotKey = _step3.value;

            if (adSlotKey === adSlotId) {
              isBlocking = true;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return isBlocking;
      }
    }, {
      key: "getBlockedSlotsIds",
      value: function getBlockedSlotsIds(adSlotId) {
        if (this.dependencyMap.has(adSlotId)) {
          return Array.from(this.dependencyMap.get(adSlotId).rules.map(function (adSlot) {
            return adSlot.avoid;
          }));
        }
      }
    }, {
      key: "arraysEqual",
      value: function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
    }]);
    return ConflictResolver;
  }();

  ConflictResolver.EMPTY_SIZE = [];

  var adSlot = function () {
    function adSlot(adSlotConfig) {
      babelHelpers.classCallCheck(this, adSlot);

      this.config = Object.assign({}, adSlotConfig);

      // Part I : Markup configuration - passed from AdManager
      this.id = this.config.id;
      if (!this.config.id) {
        throw new Error("an adSlot requires an id!");
      }
      this.target = this.config.target;
      this.type = this.config.type;
      this.responsive = this.config.responsive;
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
      this.blacklistReferrers = this.config.blacklistReferrers ? this.config.blacklistReferrers.split(',') : [];
      this.whitelistReferrers = this.config.whitelistReferrers ? this.config.whitelistReferrers.split(',') : [];

      // Part IV : Runtime configuration - calculated data - only present in runtime
      this.lastResolvedSize = undefined; // Initialized in 'slotRenderEnded' callback
      this.lastResolvedWithBreakpoint = undefined; // Initialized in 'slotRenderEnded' callback
      this.slot = undefined; // Holds a googletag.Slot object
      // [https://developers.google.com/doubleclick-gpt/reference#googletag.Slot]
      try {
        if (!this.deferredSlot) {
          this.slot = this.defineSlot();
        }
      } catch (err) {
        console.log(err);
      }
    }

    /**
     * Checks whether this adSlot is an 'Out-of-page' slot or not.
     * An Out-of-page slot is a slot that is not embedded in the page 'normally'.
     * @returns {boolean} true iff this adSlot is one of the predefined 'out-of-page' slots.
     */


    babelHelpers.createClass(adSlot, [{
      key: 'isOutOfPage',
      value: function isOutOfPage() {
        if (typeof this.type != 'string') {
          throw new Error("An adSlot cannot by typeless!", this);
        }
        if (this.isMobile() == true) {
          return false;
        }
        switch (this.type) {
          case adTypes.maavaron:
            return true;
          case adTypes.popunder:
            return true;
          case adTypes.talkback:
            return false;
          case adTypes.regular:
            return false;
          default:
            return false;
        }
      }

      /**
       * Checks whether this adSlot is a 'maavaron' slot or not.
       * An Out-of-page slot is a slot that is not embedded in the page 'normally'.
       * @returns {boolean} true iff this adSlot is one of the predefined 'out-of-page' slots.
       */

    }, {
      key: 'isMaavaron',
      value: function isMaavaron() {
        if (typeof this.type != 'string') {
          throw new Error("An adSlot cannot by typeless!", this);
        }
        if (this.isMobile() == true) {
          return false;
        }
        switch (this.type) {
          case adTypes.maavaron:
            return true;
          default:
            return false;
        }
      }
    }, {
      key: 'isMobile',
      value: function isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent || "")
        );
      }
      /**
       * Checks whether or not this adSlot has a non-empty whitelist, and if so, that the current
       * referrer appears in the whitelist.
       * Should return false iff there is a whitelist for the current adSlot, but the referrer is not
       * mentioned in the whitelist.
       * @returns {boolean} true iff the ad can be displayed.
       */

    }, {
      key: 'isWhitelisted',
      value: function isWhitelisted() {
        var whitelisted = false;
        if (this.whitelistReferrers.length !== 0) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.whitelistReferrers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var referrer = _step.value;

              if (dfpConfig.referrer.indexOf(referrer) > -1) {
                whitelisted = true;
                break;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        } else {
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

    }, {
      key: 'isBlacklisted',
      value: function isBlacklisted() {
        var blacklisted = false;
        if (this.blacklistReferrers.length !== 0) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = this.blacklistReferrers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var referrer = _step2.value;

              if (dfpConfig.referrer.indexOf(referrer) > -1) {
                blacklisted = true;
                break;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
        return blacklisted;
      }

      /**
       * Shows the current adSlot.
       * It assumes a markup is available for this slot (any tag with an id attribute = this.id)
       */

    }, {
      key: 'show',
      value: function show() {
        var _this = this;

        if (!this.shown === true) {
          this.shown = true; //Ensure show will be called once per adSlot
          googletag.cmd.push(function () {
            if (_this.deferredSlot) {
              _this.slot = _this.defineSlot();
            }
            //console.log('calling show for slot',this.id,' called @',window.performance.now());
            document.getElementById(_this.id).classList.remove('h-hidden');
            googletag.display(_this.id);
          });
        }
      }

      /**
       * Shows the current adSlot.
       * It assumes a markup is available for this slot (any tag with an id attribute = this.id)
       */

    }, {
      key: 'hide',
      value: function hide() {
        var _this2 = this;

        googletag.cmd.push(function () {
          document.getElementById(_this2.id).classList.add('h-hidden');
        });
      }

      /**
       * Initializes page-level slot definition for the current slot
       */

    }, {
      key: 'defineSlot',
      value: function defineSlot() {
        if (this.isMaavaron()) {
          var maavaronSlot = this.defineMaavaron();
          if (this.adManager.shouldSendRequestToDfp(this)) {
            if (!this.shown) {
              this.shown = true; //Ensure show will be called once
              maavaronSlot.display();
            }
          }
          return maavaronSlot;
        }
        var googletag = window.googletag;
        var pubads = googletag.pubads();
        var args = [];
        var defineFn = this.isOutOfPage() ? googletag.defineOutOfPageSlot : googletag.defineSlot;
        //3 or 2 params according to the function that we want to activate.
        args.push(this.getPath());
        if (this.isOutOfPage() === false) {
          args.push(this.adSizeMapping);
        }
        args.push(this.id);
        var slot = defineFn.apply(defineFn, args);
        if (slot) {
          // Responsive size Mapping
          if (this.responsive) {
            var responsiveSlotSizeMapping = googletag.sizeMapping();
            var breakpoints = dfpConfig.breakpointsConfig.breakpoints;
            var keys = Object.keys(this.responsiveAdSizeMapping);
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var key = _step3.value;
                //['xxs','xs',...]
                responsiveSlotSizeMapping.addSize([breakpoints[key], 100], //100 is a default height, since it is height agnostic
                this.responsiveAdSizeMapping[key]);
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
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
       * @returns {*} a formatted string that represent the path for the slot definition
       */

    }, {
      key: 'getPath',
      value: function getPath() {
        var _this3 = this;

        var path = dfpConfig.path || [];
        path = path.filter(function (path) {
          return path != '.';
        });
        path = path.map(function (section) {
          return '' + _this3.id + _this3.department + section;
        }).join('/');
        //If a path exist, it will be preceded with a forward slash
        path = path && this.config.department !== '_homepage' ? '/' + path : '';
        var calculatedPath = '/' + this.config.network + '/' + this.config.adUnitBase + '/' + this.id + '/' + this.id + this.department + path;
        return calculatedPath.toLowerCase();
      }
    }, {
      key: 'slotRendered',
      value: function slotRendered(event) {
        var id = event.slot.getAdUnitPath().split('/')[3]; // Convention: [0]/[1]network/[2]base/[3]id
        var isEmpty = event.isEmpty; // Did the ad return as empty?
        var resolvedSize = event.size; // What 'creative' size did the ad return with?
        // Empty or onload callback should be called next?
      }

      /**
       * Refresh this adSlot
       */

    }, {
      key: 'refresh',
      value: function refresh() {
        var _this4 = this;

        googletag.cmd.push(function () {
          googletag.pubads().refresh([_this4.slot]);
        });
      }

      /**
       * Shows 'Maavaron' type adSlot using Passback definition
       */

    }, {
      key: 'defineMaavaron',
      value: function defineMaavaron() {
        if (!document.referrer.match('loc.haaretz')) {
          var adUnitMaavaronPath = this.getPath();
          var adUnitMaavaronSize = [[2, 1]];
          var slot = googletag.pubads().definePassback(adUnitMaavaronPath, adUnitMaavaronSize).setTargeting('UserType', [this.user.type]).setTargeting('age', [this.user.age]).setTargeting('urgdr', [this.user.gender]).setTargeting('articleId', [dfpConfig.articleId]).setTargeting('stg', [dfpConfig.environment]);
          return slot;
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

    }]);
    return adSlot;
  }();

  /**
   * Checks whether two arrays are equal
   * @param a the first array to check
   * @param b the second array to check
   * @returns {boolean} true iff both a and b are arrays, with equal values
   */
  function arraysEqual(a, b) {
    if (!a || !b) return false;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a === b) return true;
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // There are a total of 7 adTargets:
  // "all","nonPaying","anonymous","registered","paying","digitalOnly" and "digitalAndPrint"
  var adPriorities = {
    high: 'high',
    normal: 'normal',
    low: 'low'
  };

  var adTargets = {
    all: 'all',
    nonPaying: 'nonPaying',
    anonymous: 'anonymous',
    registered: 'registered',
    paying: 'paying',
    digitalOnly: 'digitalOnly',
    digitalAndPrint: 'digitalAndPrint'
  };

  // There are a total of 3 userTypes: "anonymous", "registered" and "payer"
  var userTypes = {
    anonymous: 'anonymous',
    registered: 'registered',
    payer: 'payer'
  };

  var adTypes = {
    maavaron: '.maavaron',
    popunder: '.popunder',
    talkback: '.talkback',
    regular: ''
  };

  var AdManager = function () {
    function AdManager(config) {
      var _this = this;

      babelHelpers.classCallCheck(this, AdManager);

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
        googletag.cmd.push(function () {
          _this.initGoogleTargetingParams(); //  Define page-level settings
          _this.initGoogleGlobalSettings(); //  enableServices()
          _this.initSlotRenderedCallback(); //  Define callbacks
        });
        // Holds adSlot objects as soon as possible.
        googletag.cmd.push(function () {
          _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.high);
        });
        // Once DOM ready, add more adSlots.
        document.addEventListener('DOMContentLoaded', function () {
          googletag.cmd.push(function () {
            _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.high);
            googletag.cmd.push(function () {
              _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.normal);
            });
          });
        });
        // Once window was loaded, add the rest of the adSlots.
        window.addEventListener('load', function () {
          googletag.cmd.push(function () {
            _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.low);
          });
        });
      } catch (err) {
        console.log(err);
      }
    }

    /**
     * Shows all of the adSlots that can be displayed.
     */


    babelHelpers.createClass(AdManager, [{
      key: 'showAllSlots',
      value: function showAllSlots() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.adSlots.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var adSlotKey = _step.value;

            var adSlot$$ = this.adSlots.get(adSlotKey);
            if (adSlot$$.type !== adTypes.talkback && this.shouldSendRequestToDfp(adSlot$$)) {
              adSlot$$.show();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      /**
       * Gets all adSlots that has a certain priority
       */

    }, {
      key: 'getAdSlotsByPriority',
      value: function getAdSlotsByPriority(priority) {
        function priorityFilter(adSlot$$) {
          return adSlot$$.priority === priority;
        }
        return Array.from(this.adSlots.values()).filter(priorityFilter);
      }
    }, {
      key: 'showAllDeferredSlots',
      value: function showAllDeferredSlots() {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.conflictResolver.deferredSlots[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var deferredSlotId = _step2.value;

            if (this.adSlots.has(deferredSlotId)) {
              if (!this.conflictResolver.isBlocked(deferredSlotId)) {
                var deferredAdSlot = this.adSlots.get(deferredSlotId);
                if (this.shouldSendRequestToDfp(deferredAdSlot)) {
                  deferredAdSlot.show();
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      /**
       * Refreshes all responsive adSlots
       */

    }, {
      key: 'refreshAllSlots',
      value: function refreshAllSlots() {
        var currentBreakpoint = getBreakpoint();
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.adSlots.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var adSlotKey = _step3.value;

            var adSlot$$ = this.adSlots.get(adSlotKey);
            if (adSlot$$.responsive) {
              if (adSlot$$.lastResolvedWithBreakpoint != currentBreakpoint && this.shouldSendRequestToDfp(adSlot$$)) {
                //console.log(`calling refresh for adSlot: ${adSlot.id}`);
                adSlot$$.refresh();
              } else {
                adSlot$$.hide();
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }

      /**
       * Initializes adSlots based on the currently found slot markup (HTML page specific),
       * and the predefined configuration for the slots.
       * @param adSlotConfig
       * @returns {Map}
       */

    }, {
      key: 'initAdSlots',
      value: function initAdSlots(adSlotConfig, filteredPriority) {
        var _this2 = this;

        var adSlots = new Map(this.adSlots);
        var adSlotPlaceholders = Array.from(document.getElementsByClassName('js-dfp-ad'));
        adSlotPlaceholders = adSlotPlaceholders.filter(function (node) {
          return node.id;
        }); //only nodes with an id
        var adSlotNodeSet = new Set();
        adSlotPlaceholders = Array.prototype.filter.call(adSlotPlaceholders, function (node) {
          if (adSlotNodeSet.has(node.id) === false) {
            //first occurrence of Node
            adSlotNodeSet.add(node.id);
            return true;
          }
          return false;
        });
        //adSlotPlaceholders = adSlotPlaceholders.sort((a,b) => a.offsetTop - b.offsetTop);
        adSlotPlaceholders.forEach(function (adSlot$$) {
          var adSlotPriority = adSlotConfig[adSlot$$.id] ? adSlotConfig[adSlot$$.id].priority || adPriorities.normal : undefined;
          if (adSlotConfig[adSlot$$.id] && adSlots.has(adSlot$$.id) === false && adSlotPriority === filteredPriority) {
            //the markup has a matching configuration from adSlotConfig AND was not already defined
            try {
              // adSlotConfig is built from globalConfig, but can be overridden by markup
              var computedAdSlotConfig = Object.assign({}, adSlotConfig[adSlot$$.id], {
                id: adSlot$$.id,
                target: adSlot$$.attributes['data-audtarget'] ? adSlot$$.attributes['data-audtarget'].value : adTargets.all,
                type: _this2.getAdType(adSlot$$.id),
                responsive: adSlotConfig[adSlot$$.id].responsive,
                user: _this2.user,
                adManager: _this2,
                htmlElement: adSlot$$,
                department: _this2.config.department,
                network: _this2.config.adManagerConfig.network,
                adUnitBase: _this2.config.adManagerConfig.adUnitBase,
                deferredSlot: _this2.conflictResolver.isBlocked(adSlot$$.id),
                priority: adSlotPriority
              });
              var adSlotInstance = new adSlot(computedAdSlotConfig);
              adSlots.set(adSlot$$.id, adSlotInstance);
              if (adSlotInstance.type !== adTypes.talkback && adSlotInstance.priority === adPriorities.high && _this2.shouldSendRequestToDfp(adSlotInstance)) {
                //console.log('calling show for high priority slot', adSlotInstance.id, ' called @', window.performance.now());
                adSlotInstance.show();
              }
            } catch (err) {
              console.log(err);
            }
          }
        });
        return adSlots;
      }
    }, {
      key: 'isPriority',
      value: function isPriority(adSlotId) {
        return typeof adSlotId === 'string' && (adSlotId.indexOf('plazma') > 0 || adSlotId.indexOf('maavaron') > 0 || adSlotId.indexOf('popunder') > 0);
      }

      /**
       * Returns the adType based on the adSlot name.
       * @param adSlotId the adSlot's identifier.
       * @returns {*} enumerated export 'adTypes'
       */

    }, {
      key: 'getAdType',
      value: function getAdType(adSlotId) {
        if (!adSlotId) {
          throw new Error('Missing argument: a call to getAdType must have an adSlotId', this);
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

    }, {
      key: 'shouldSendRequestToDfp',
      value: function shouldSendRequestToDfp(adSlot$$) {
        // TODO: go over each one of the following and mark as checked once implemented
        // Conflict management check
        return this.conflictResolver.isBlocked(adSlot$$.id) === false &&
        // Valid Referrer check
        adSlot$$.isWhitelisted() &&
        // Not in referrer Blacklist
        adSlot$$.isBlacklisted() === false && this.shouldDisplayAdAfterAdBlockRemoval(adSlot$$) &&
        // Responsive: breakpoint contains ad?
        this.doesBreakpointContainAd(adSlot$$) &&
        // Targeting check (userType vs. slotTargeting)
        this.doesUserTypeMatchBannerTargeting(adSlot$$) &&
        // Impressions Manager check (limits number of impressions per slot)
        this.user.impressionManager.reachedQuota(adSlot$$.id) === false;
      }
    }, {
      key: 'shouldDisplayAdAfterAdBlockRemoval',
      value: function shouldDisplayAdAfterAdBlockRemoval(adSlot$$) {
        return !(this.config.adBlockRemoved === true && (adSlot$$.type === adTypes.maavaron || adSlot$$.type === adTypes.popunder));
      }

      /**
       * Check whether or not an ad slot should appear for the current user type
       * @param adSlotOrTarget the adSlot to check or the target as a sting
       * @returns {boolean} true iff the slot should appear for the user type
       */

    }, {
      key: 'doesUserTypeMatchBannerTargeting',
      value: function doesUserTypeMatchBannerTargeting(adSlotOrTarget) {

        var userType = this.user.type;
        var adTarget = typeof adSlotOrTarget === 'string' ? adSlotOrTarget : adSlotOrTarget.target;

        switch (adTarget) {
          case adTargets.all:
            return true;
          case adTargets.nonPaying:
            return userType === userTypes.anonymous || userType === userTypes.registered;
          case adTargets.anonymous:
            return userType === userTypes.anonymous;
          case adTargets.registered:
            return userType === userTypes.registered;
          case adTargets.paying:
            return userType === userTypes.payer;
          case adTargets.digitalOnly:
            return userType === userTypes.payer;
          case adTargets.digitalAndPrint:
            return userType === userTypes.payer;
          default:
            return false;
        }
      }

      /**
       * Report to the AdManager that a breakpoint has been switched (passed from one break to
       * another). Should there be a responsive slot with a
       * @param breakpoint the breakpoint that is currently being displayed
       * @returns {number} the number of adSlots affected by the change
       */

    }, {
      key: 'switchedToBreakpoint',
      value: function switchedToBreakpoint(breakpoint) {
        if (!breakpoint) {
          throw new Error('Missing argument: a call to switchedToBreakpoint must have an breakpoint', this);
        }
        var count = 0;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.adSlots.keys()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var adSlotKey = _step4.value;

            var adSlot$$ = this.adSlots.get(adSlotKey);
            if (adSlot$$.responsive === true && adSlot$$.lastResolvedWithBreakpoint) {
              if (adSlot$$.lastResolvedWithBreakpoint !== breakpoint) {
                adSlot$$.refresh();
                count++;
              }
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        return count;
      }

      /**
       * Checks whether an adSlot is defined for a given breakpoint (Default: current breakpoint)
       * @returns {boolean} true iff the adSlot is defined for the given breakpoint.
       */

    }, {
      key: 'doesBreakpointContainAd',
      value: function doesBreakpointContainAd(adSlot$$) {
        var breakpoint = arguments.length <= 1 || arguments[1] === undefined ? getBreakpoint() : arguments[1];

        if (!adSlot$$) {
          throw new Error('Missing argument: a call to doesBreakpointContainAd must have an adSlot', this);
        }
        var containsBreakpoint = true;
        if (adSlot$$.responsive === true) {
          var mapping = adSlot$$.responsiveAdSizeMapping[getBreakpointName(breakpoint)];
          if (Array.isArray(mapping) === false) {
            throw new Error('Invalid argument: breakpoint:' + breakpoint + ' doesn\'t exist!', this);
          }
          containsBreakpoint = mapping.length > 0 && !arraysEqual(mapping, [0, 0]);
        }
        return containsBreakpoint;
      }

      /**
       * Initializes the callback from the 'slotRenderEnded' event for each slot
       */

    }, {
      key: 'initSlotRenderedCallback',
      value: function initSlotRenderedCallback() {
        var _this3 = this;

        if (window.googletag && window.googletag.apiReady) {
          var pubads = window.googletag.pubads();
          pubads.addEventListener('slotRenderEnded', function (event) {
            var id = event.slot.getAdUnitPath().split('/')[3];
            var isEmpty = event.isEmpty;
            var resolvedSize = event.size;
            //console.log('slotRenderEnded for slot',id,' called @',window.performance.now());
            if (_this3.adSlots.has(id)) {
              var adSlot$$ = _this3.adSlots.get(id);
              adSlot$$.lastResolvedSize = resolvedSize;
              adSlot$$.lastResolvedWithBreakpoint = getBreakpoint();
              if (isEmpty) {
                adSlot$$.lastResolvedSize = ConflictResolver.EMPTY_SIZE;
                adSlot$$.hide();
                _this3.releaseSlotDependencies(adSlot$$);
              } else {
                _this3.user.impressionManager.registerImpression('' + adSlot$$.id + _this3.config.department);
                _this3.user.impressionManager.registerImpression(adSlot$$.id + '_all');
                _this3.releaseSlotDependencies(adSlot$$, adSlot$$.lastResolvedSize);
              }
            } else {
              console.error('Cannot find an adSlot with id: ' + id + ' - Ad Unit path is ' + event.slot.getAdUnitPath());
            }
          });
        } else {
          throw new Error('googletag api was not ready when \'initSlotRenderedCallback\' was called!');
        }
      }
    }, {
      key: 'releaseSlotDependencies',
      value: function releaseSlotDependencies(adSlot$$) {
        try {
          var id = adSlot$$.id;
          this.conflictResolver.updateResolvedSlot(id, adSlot$$.lastResolvedSize);
          if (this.conflictResolver.isBlocking(id)) {
            // Hide all blocked adSlots
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = this.conflictResolver.getBlockedSlotsIds(id)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var blockedSlot = _step5.value;

                if (this.conflictResolver.isBlocked(blockedSlot)) {
                  if (this.adSlots.has(blockedSlot)) {
                    this.adSlots.get(blockedSlot).hide();
                  }
                }
              }
              // Show the non blocked
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }

            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = this.conflictResolver.deferredSlots.keys()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var deferredSlotKey = _step6.value;

                var deferredAdSlot = this.adSlots.get(deferredSlotKey);
                if (deferredAdSlot && this.shouldSendRequestToDfp(deferredAdSlot)) {
                  this.conflictResolver.deferredSlots.delete(deferredSlotKey);
                  if (deferredAdSlot.deferredSlot) {
                    deferredAdSlot.defineSlot();
                    deferredAdSlot.deferredSlot = false;
                  }
                  deferredAdSlot.show();
                }
              }
            } catch (err) {
              _didIteratorError6 = true;
              _iteratorError6 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                  _iterator6.return();
                }
              } finally {
                if (_didIteratorError6) {
                  throw _iteratorError6;
                }
              }
            }
          }
        } catch (err) {
          console.error('Cannot updateSlotDependencies for adSlot: ' + adSlot$$.id);
        }
      }

      //TODO - move these to a separate service
      /**
       * Initializes page-level targeting params.
       */

    }, {
      key: 'initGoogleTargetingParams',
      value: function initGoogleTargetingParams() {
        if (window.googletag && window.googletag.apiReady) {

          //Returns a reference to the pubads service.
          var pubads = googletag.pubads();

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
          if (this.config.gStatCampaignNumber && this.config.gStatCampaignNumber != -1) {
            pubads.setTargeting('gstat_campaign_id', [this.config.gStatCampaignNumber]);
          }

          // UTM targeting
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
        } else {
          throw new Error('googletag api was not ready when \'initGoogleTargetingParams\' was called!');
        }
      }

      /**
       * Initializes googletag services.
       */

    }, {
      key: 'initGoogleGlobalSettings',
      value: function initGoogleGlobalSettings() {
        if (window.googletag && window.googletag.apiReady) {
          if (window.location.search && window.location.search.indexOf('sraon') > 0) {
            console.log('enableSingleRequest mode: active');
            googletag.pubads().enableSingleRequest();
          }
          if (!this.config.isMobile) {
            googletag.pubads().enableAsyncRendering();
          } else {
            googletag.pubads().enableAsyncRendering(); // disabled: googletag.pubads().enableSyncRendering();
          }
          // Enables all GPT services that have been defined for ad slots on the page.
          googletag.enableServices();
        } else {
          throw new Error('googletag api was not ready when \'initGoogleGlobalSettings\' was called!');
        }
      }
    }]);
    return AdManager;
  }();

  var defaultConfig = dfpConfig || {};
  var googletagInitTimeout = 10000;
  var resizeTimeout = 250;

  var DFP = function () {
    function DFP(config) {
      babelHelpers.classCallCheck(this, DFP);

      this.config = Object.assign({}, defaultConfig, config);
      this.wasInitialized = false;
      this.breakpoint = getBreakpoint();
      this.initWindowResizeListener();
    }

    /**
     * This part of the object's construction is dependent on the call to 'init'
     */


    babelHelpers.createClass(DFP, [{
      key: 'resumeInit',
      value: function resumeInit() {
        try {
          this.adManager = new AdManager(this.config);
        } catch (err) {
          console.log(err);
        }
      }

      /**
       * initializes the 'googletag' global namespace and add the
       * google publish tags library to the page
       * @returns {Promise} that resolves to true once the googletag api is ready to use
       * (googletag.apiReady = true)
       */

    }, {
      key: 'initGoogleTag',
      value: function initGoogleTag() {
        var _this = this;

        var dfpThis = this;
        return new Promise(function (resolve, reject) {
          if (dfpThis.wasInitialized == true || window.googletag && window.googletag.apiReady) {
            _this.adManager = _this.adManager || new AdManager(_this.config);
            dfpThis.wasInitialized = true;
            resolve(_this.isGoogleTagReady);
          } else {
            // set up a place holder for the gpt code downloaded from google
            window.googletag = window.googletag || {};

            // this is a command queue used by GPT any methods added to it will be
            // executed when GPT code is available, if GPT is already available they
            // will be executed immediately
            window.googletag.cmd = window.googletag.cmd || [];
            //load google tag services JavaScript
            (function () {
              var tag = window.document.createElement('script');
              tag.async = false;
              tag.type = 'text/javascript';
              //var useSSL = 'https:' == document.location.protocol;
              tag.setAttribute('src', '//www.googletagservices.com/tag/js/gpt.js');
              var node = window.document.getElementsByTagName('script')[0];
              tag.onload = function () {
                dfpThis.wasInitialized = true;
                dfpThis.resumeInit();
                resolve(_this.isGoogleTagReady);
              };
              tag.onerror = function (error) {
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

    }, {
      key: 'isGoogleTagReady',
      value: function isGoogleTagReady() {
        var _this2 = this;

        var promise = new Promise(function (resolve, reject) {
          googletag.cmd.push(function () {
            resolve(_this2);
          });
          setTimeout(function () {
            if (!(googletag && googletag.apiReady === true)) {
              reject(new Error("googletag failed to initialize on the page!"));
            }
          }, googletagInitTimeout);
        });
        return promise;
      }

      /**
       * Initializes the window resize listener to support responsive ad refreshes
       */

    }, {
      key: 'initWindowResizeListener',
      value: function initWindowResizeListener() {
        var dfpThis = this;
        function onResize() {
          var currentBreakpoint = getBreakpoint();
          if (dfpThis.breakpoint != currentBreakpoint) {
            dfpThis.breakpoint = currentBreakpoint;
            if (dfpThis.adManager) {
              dfpThis.adManager.refreshAllSlots();
            } else {
              throw new Error("initWindowResizeListener error - adManager instance is not available");
            }
          }
        }
        var debouncedFunction = debounce(onResize, resizeTimeout);
        window.onresize = debouncedFunction;
      }
    }]);
    return DFP;
  }();

  // Correct version will be set with the 'rollup-replace plugin'
  DFP.version = '1.8.7';

  //// Only for development mode
  //if ( "production" !== 'production' ) {
  //  DFP.dev = '123';
  //}

  var config = dfpConfig;
  var version = DFP.version;

  exports.config = config;
  exports.version = version;
  exports['default'] = DFP;

}));
//# sourceMappingURL=dfp.js.map