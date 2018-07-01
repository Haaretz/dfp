var DFP = (function (exports) {
  'use strict';

  var _classCallCheck = (function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  });

  var _createClass = (function () {
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
  })();

  var _toConsumableArray = (function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }return arr2;
    } else {
      return Array.from(arr);
    }
  });

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
  function stringToMap(string) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$separator = _ref.separator,
        separator = _ref$separator === undefined ? ';' : _ref$separator,
        _ref$operator = _ref.operator,
        operator = _ref$operator === undefined ? '=' : _ref$operator;

    var map = {};
    var itemsArr = string.split(separator);
    itemsArr.forEach(function (element) {
      if (typeof element === 'string') {
        var keyValue = element.split(operator);
        if (keyValue.length === 2) {
          try {
            map[keyValue[0]] = decodeURIComponent(keyValue[1]);
          } catch (e) {
            // Do nothing, malformed URI
          }
        }
      }
    });
    return map;
  }
  var ssoKey = window.location.hostname.indexOf('haaretz.com') > -1 ? 'engsso' : 'tmsso';

  // Translates Cookie string into a convenient map.
  function getCookieAsMap() {
    var map = stringToMap(document.cookie, { separator: /;\s?/ });
    if (typeof map.tmsso === 'string') {
      map.tmsso = stringToMap(map.tmsso, { separator: ':' });
    }
    if (typeof map.engsso === 'string') {
      map.engsso = stringToMap(map.engsso, { separator: ':' });
    }
    return map;
  }

  /* global dfpConfig */
  // globalConfig for DFP
  var dfpBaseConf = void 0;
  try {
    dfpBaseConf = window.JSON.parse(document.getElementById('dfpConfig').textContent);
  } catch (err) {
    dfpBaseConf = window.dfpConfig;
  }
  var dfpConfig = Object.assign({
    get referrer() {
      return document.referrer ? document.referrer : '';
    },
    get isMobile() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent || '')
      );
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
     * non articles (sections) will be given a '0' - no articleId value for targeting purposes)
     * @returns {Array.<T>} an array of path names
     */
    get path() {
      var sectionArray = this.articleId && this.articleId !== '0' ? window.location.pathname.split('/').slice(1, -1) : window.location.pathname.split('/').slice(1);
      sectionArray = sectionArray.filter(function (path) {
        return path !== 'wwwMobileSite' && path !== 'whtzMobileSite';
      });
      return sectionArray.map(function (section) {
        return '.' + section;
      }).map(function (section, index, arr) {
        return arr.slice(0, index + 1).reduce(function (last, current) {
          return last.concat(current);
        });
      });
    },
    /**
     * Returns a string representation for the name of the site
     * @return {*|string}
     */
    get site() {
      var site = void 0;
      if (window.location.hostname.indexOf('haaretz.co.il') > -1) {
        site = 'haaretz';
      } else if (window.location.hostname.indexOf('themarker.com') > -1) {
        site = 'themarker';
      } else if (window.location.hostname.indexOf('mouse.co.il') > -1) {
        site = 'mouse';
      }
      return site || 'haaretz';
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
      return window.location.port === '8080' ? env.dev : window.location.hostname.indexOf('pre.haaretz.co.il') > -1 || window.location.hostname.indexOf('tmtest.themarker.com') > -1 || window.location.hostname.indexOf('pre.haaretz.com') > -1 || window.location.hostname.indexOf('prodmouse.mouse.co.il') > -1 ? env.test : window.location.pathname.indexOf('/cmlink/Haaretz.HomePage') > -1 || window.location.pathname.indexOf('/cmlink/TheMarker.HomePage') > -1 || window.location.pathname.indexOf('/cmlink/Mouse.HomePage') > -1 ? env.prod : undefined;
    },
    /**
     * Returns the articleIf if on an article page, or null otherwise
     * @returns {string} an articleId string from the pathname, or 0 if not found
     */
    get articleId() {
      var articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
      var articleId = '0';
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
      getUrlParam: function getUrlParam(key) {
        var results = RegExp('(' + key + ')(=)([^&"]+)').exec(window.location.search);
        return results && results[3] ? results[3] : undefined;
      }
    },
    get adBlockRemoved() {
      var adBlockRemoved = false;
      try {
        if (localStorage.getItem('adblock_removed')) {
          adBlockRemoved = true;
        }
      } catch (err) {
        // do nothing
      }
      return adBlockRemoved;
    },
    get ssoGroupKey() {
      return window.localStorage.getItem('_SsoGroupKey');
    },
    get anonymousId() {
      var cookieName = 'anonymousId';
      var cookieMap = getCookieAsMap();
      var anonymousId = '';
      if (cookieMap && cookieMap[cookieName]) {
        anonymousId = cookieMap[cookieName];
      }
      return anonymousId;
    },
    get isWriterAlerts() {
      return location.search.indexOf('writerAlerts=true') > -1;
    },
    get wifiLocation() {
      var wifiLocation = void 0;
      var cookieName = '_htzwif'; // eslint-disable-line no-underscore-dangle
      var cookieMap = getCookieAsMap();
      try {
        if (cookieMap && cookieMap[cookieName]) {
          if (cookieMap[cookieName].toLowerCase() === 'arcaffe') {
            wifiLocation = 'ArCafe';
          }
          if (cookieMap[cookieName].toLowerCase() === 'university') {
            wifiLocation = 'university';
          }
        }
      } catch (err) {
        // do nothing
      }
      return wifiLocation;
    },
    get isValidForsmartPhone() {
      var validForAds = true;
      var PageUrl = window.location.href;
      var isSmartphoneapp = PageUrl.match('haaretzsmartphoneapp');
      var cookieMap = getCookieAsMap();
      try {
        if (isSmartphoneapp) {
          // eslint-disable-line no-underscore-dangle
          if (!cookieMap || !(cookieMap.NotPayer || cookieMap.HtzPusr)) {
            validForAds = false;
          }
        }
      } catch (err) {
        // do nothing
      }
      return validForAds;
    },
    get gStatCampaignNumber() {
      var gstatCampaign = void 0;
      try {
        gstatCampaign = localStorage.getItem('GstatCampaign') ? JSON.parse(localStorage.getItem('GstatCampaign')) : undefined;
      } catch (err) {
        /* In case of thrown 'SecurityError' or 'QuotaExceededError',
         the variable should be undefined */
        gstatCampaign = undefined;
      }
      return gstatCampaign ? gstatCampaign.CampaignNumber : undefined;
    },
    get pageType() {
      var type = '';
      try {
        var htmlclassList = document.querySelector('html').classList;
        switch (true) {
          case /mouse_location/.test(htmlclassList):
            type = 'mouse_location';
            break;
          case /mouse_event/.test(htmlclassList):
            type = 'mouse_event';
            break;
          case /contentType-story/.test(htmlclassList):
            type = 'mouse_article';
            break;
          default:
            type = '';
        }
      } catch (err) {
        /* In case of thrown 'SecurityError' or 'QuotaExceededError',
         the variable should be undefined */
        type = '';
      }
      return type;
    },
    get proposalNumber() {
      var proposal = void 0;
      try {
        proposal = localStorage.getItem('proposaltype') ? localStorage.getItem('proposaltype') : undefined;
      } catch (err) {
        /* In case of thrown 'SecurityError' or 'QuotaExceededError',
         the variable should be undefined */
        proposal = undefined;
      }
      return proposal;
    },
    adSlotConfig: {
      'haaretz.co.il.example.slot': {
        id: 'slotId',
        // path : "/network/base/slotId/slotId_subsection", Will be calculated from AdManager
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
        blacklistReferrers: 'comma, delimited, blacklisted, referrer, list',
        whitelistReferrers: 'comma, delimited, referrer, list'
      }
    },
    adManagerConfig: {
      network: '9401',
      adUnitBase: 'haaretz.co.il_Web'
    },
    breakpointsConfig: {
      get breakpoints() {
        // Override in VM from backend to control this toggle.
        var breakpoints = void 0;
        switch (dfpConfig.googleGlobalSettings.breakpointType) {
          case 'type1':
            breakpoints = this.breakpoints1;break;
          case 'type2':
            breakpoints = this.breakpoints2;break;
          case 'type3':
            breakpoints = this.breakpoints3;break;
          case 'type4':
            breakpoints = this.breakpoints4;break;
          default:
            breakpoints = this.breakpoints1;
        }
        return breakpoints;
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
      },
      // Type 3
      breakpoints3: {
        xxs: 100,
        xs: 480,
        s: 600,
        m: 768,
        l: 1024,
        xl: 1280,
        xxl: 1900
      },
      // Type 4
      breakpoints4: {
        xxs: 600,
        xs: 768,
        s: 1024,
        m: 1280,
        l: 1900,
        xl: 1900,
        xxl: 1900
      }
    },
    userConfig: {
      type: undefined,
      age: undefined,
      gender: undefined
    },
    conflictManagementConfig: {
      'blocking.ad.unit.name': [{
        onsize: '1280x200,970x250,3x3',
        avoid: 'blocked.ad.unit.name'
      }, {
        onsize: '1280x200,970x250,3x3',
        avoid: 'blocked.ad.unit.name'
      }]
    },
    impressionManagerConfig: {
      'ad.unit.name': {
        target: 'all|section|homepage',
        frequency: '$1/$2(day|hour)',
        exposed: 0,
        expires: new Date().getTime()
      }
    },
    googleGlobalSettings: {
      enableSingleRequest: true,
      enableAsyncRendering: true,
      refreshIntervalTime: 1000,
      breakpointType: 'type1'
    },
    sso: ssoKey

  }, dfpBaseConf);

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
    } else if (isNaN(parseInt(hours, 10))) {
      throw new TypeError('addHours called with an invalid integer \'hours\' parameter!');
    }
    var result = new Date(date);
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
    } else if (isNaN(parseInt(days, 10))) {
      throw new TypeError('addDays called with an invalid integer \'days\' parameter!');
    }
    var result = new Date(date);
    result.setDate(result.getDate() + parseInt(days, 10));
    return result;
  }

  var breakpoints = dfpConfig.breakpointsConfig.breakpoints;

  /**
   * Returns a function, that, as long as it continues to be invoked, will not
   * be triggered. The function will be called after it stops being called for
   * N milliseconds. If `immediate` is passed, trigger the function on the
   * leading edge, instead of the trailing.
   * @param { function } func - the function to run
   * @param { number } wait - the timeout period to avoid running the function
   * @param { boolean } immediate - leading edge modifier
   * @returns {function } the debounced function
   */
  function debounce(func) {
    var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
    var immediate = arguments[2];

    var timeout = void 0;
    return function debounced() {
      var context = this;
      var args = arguments; // eslint-disable-line prefer-rest-params
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
    var breakpoint = void 0;
    var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    switch (true) {
      case windowWidth < breakpoints.xs:
        breakpoint = breakpoints.xxs;break;
      case windowWidth < breakpoints.s:
        breakpoint = breakpoints.xs;break;
      case windowWidth < breakpoints.m:
        breakpoint = breakpoints.s;break;
      case windowWidth < breakpoints.l:
        breakpoint = breakpoints.m;break;
      case windowWidth < breakpoints.xl:
        breakpoint = breakpoints.l;break;
      case windowWidth < breakpoints.xxl:
        breakpoint = breakpoints.xl;break;
      default:
        breakpoint = breakpoints.xxl;
    }
    return breakpoint;
  }
  /**
   * Returns the current breakpoint that is closest to the window's width
   * @param {number} breakpoint - the breakpoint label enumerator that the current width represents
   * (yield with a getBreakpoint() call or passed manually )
   * @returns {string} breakpoint - the breakpoint label that the current width represents,
   * as a string
   */
  function getBreakpointName(breakpoint) {
    var resultBreakpoint = void 0;
    var windowWidth = breakpoint || window.innerWidth;
    switch (true) {
      case windowWidth < breakpoints.xs:
        resultBreakpoint = 'xxs';break;
      case windowWidth < breakpoints.s:
        resultBreakpoint = 'xs';break;
      case windowWidth < breakpoints.m:
        resultBreakpoint = 's';break;
      case windowWidth < breakpoints.l:
        resultBreakpoint = 'm';break;
      case windowWidth < breakpoints.xl:
        resultBreakpoint = 'l';break;
      case windowWidth < breakpoints.xxl:
        resultBreakpoint = 'xl';break;
      default:
        resultBreakpoint = 'xxl';
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
      _classCallCheck(this, ImpressionsManager);

      this.now = new Date().getTime(); // this date is used for comparisons only
      this.config = Object.assign({}, impressionManagerConfig);
      this.impressions = this.retrieveImpressionsData();
      this.initImpressionMap();
    }

    _createClass(ImpressionsManager, [{
      key: 'retrieveImpressionsData',
      value: function retrieveImpressionsData() {
        var _this = this;

        var impressions = this.migrateImpressionsData();
        /*
         Merge migrated data with new data
         console.log('Migrated: ',impressions);
         */
        Object.keys(impressions).map(function (key, index) {
          impressions[key] = Object.assign({}, impressions[key], _this.config[key]);
          return _this;
        });
        /*
         console.log('Merged: ',impressions);
         Filter out entries without frequency
         */
        for (var key in impressions) {
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
    }, {
      key: 'migrateImpressionsData',
      value: function migrateImpressionsData() {
        var _this2 = this;

        var impressions = void 0;
        var impressionsData = void 0;
        try {
          impressionsData = window.localStorage.getItem(keys.impressions);
        } catch (err) {
          // In case of thrown 'SecurityError' or 'QuotaExceededError', the variable should be undefined
          impressionsData = undefined;
        }
        try {
          impressions = JSON.parse(impressionsData);
        } catch (err) {
          // Here is where old impression data is converted to new format
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
              if (target && target === 'hp') {
                target = 'homepage';
              }
              var slotId = tmp.join('.');
              var id = slotId + '_' + target;
              var exposed = parseInt(data.split('/')[0], 10) || 0;
              var expires = parseInt(data.split('/')[1], 10) || _this2.now;
              impressions[id] = {};
              impressions[id][keys.adSlotId] = slotId;
              impressions[id][keys.target] = target;
              impressions[id][keys.exposed] = exposed;
              impressions[id][keys.expires] = expires;
            } catch (err1) {
              // console.log(`Failed converting impression: ${impression}`, err1);
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
          /* In case of thrown 'SecurityError' or 'QuotaExceededError',
           the operation should not break*/
          console.error('localStorage isn\'t available:', err); // eslint-disable-line no-console
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
          var slot = _this3.impressions[adSlotId];
          var shouldUpdateExpiryDate = false;
          // Case I: Existing slot (update)
          if (slot) {
            // Case I.I Existing slot, frequency has changed
            if (_this3.config[adSlotId][keys.frequency] !== slot[keys.frequency]) {
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
            } // Finally, updates the expiry date (cases I.I and I.II)
          if (shouldUpdateExpiryDate) {
            _this3.updateExpiryDate(adSlotId);
          }
          return _this3;
        });
      }

      /**
       * Updates the expiry date of a slotName based on the configured slot frequency
       * @param {String} slotName - the slotName to update.
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

        // Set max impressions:
        this.impressions[slotName][keys.maxImpressions] = parseInt(frequencyMap[1], 10);
        // Reset exposed
        this.impressions[slotName][keys.exposed] = 0;
      }

      /**
       * Initializes a non-existing slot from the passed global configuration for the slot
       * @param {String} slotName - the name of the slot to create
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
       * @param {String} adSlotId - the adSlot id to register an impression for
       * @returns {boolean} returns true iff the impression has been registered
       */

    }, {
      key: 'registerImpression',
      value: function registerImpression(adSlotId) {
        if (adSlotId) {
          var slot = this.impressions[adSlotId];
          if (slot) {
            var exposed = slot[keys.exposed];
            if (isNaN(parseInt(exposed, 10)) === false) {
              this.impressions[adSlotId][keys.exposed] += 1;
              try {
                this.saveImpressionsToLocalStorage();
              } catch (err) {
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

    }, {
      key: 'reachedQuota',
      value: function reachedQuota(adSlotId) {
        // An adSlotId is suffixed with _homepage | _section if it's targeting is different
        // between the two. If there is no difference, an _all suffix can be used.
        var slotName = this.impressions['' + adSlotId + dfpConfig.department] ? '' + adSlotId + dfpConfig.department : adSlotId + '_all';

        var slot = this.impressions[slotName];
        var atQuota = false;
        if (slot) {
          var now = new Date().getTime();
          // Second element of 2/4day matches '2'
          var expires = this.impressions[slotName][keys.expires];
          if (expires < now) {
            this.updateExpiryDate(slotName);
          } else {
            var maxImpressions = this.impressions[slotName][keys.maxImpressions];
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

    }, {
      key: 'resetImpressions',
      value: function resetImpressions() {
        var impressions = this.impressions;
        for (var key in impressions) {
          if ({}.hasOwnProperty.call(impressions, key)) {
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

  var userTypes = {
    payer: 'payer',
    registered: 'registered',
    anonymous: 'anonymous',
    trial: 'trial'
  };

  var productTypes = {
    htz: 243,
    tm: 273,
    hdc: 239,
    htz_tm: 274
  };

  var User = function () {
    function User(config) {
      _classCallCheck(this, User);

      this.config = Object.assign({}, config.userConfig);
      var cookieMap = getCookieAsMap();
      this.ssoKey = dfpConfig.sso;
      if (!cookieMap[this.ssoKey]) {
        // Flips the ssoKey, since cookieMap.ssoKey cannot be used to retrieve data
        this.ssoKey = this.ssoKey === 'tmsso' ? 'engsso' : 'tmsso';
      }
      this.type = this.getUserType(cookieMap);
      this.htz_type = this.getUserTypeByProduct(cookieMap, productTypes.htz);
      this.tm_type = this.getUserTypeByProduct(cookieMap, productTypes.tm);
      this.hdc_type = this.getUserTypeByProduct(cookieMap, productTypes.hdc);
      this.impressionManager = new ImpressionsManager(config.impressionManagerConfig);
      this.age = this.getUserAge(cookieMap);
      this.gender = this.getUserGender(cookieMap);
      this.sso = this.getUserSSO(cookieMap, this.ssoKey);
    }

    _createClass(User, [{
      key: 'getUserType',
      value: function getUserType(cookieMap) {
        var userType = void 0;
        if (cookieMap && cookieMap[this.ssoKey]) {
          userType = cookieMap.HtzPusr || cookieMap.TmPusr || cookieMap.HdcPusr ? userTypes.payer : userTypes.registered;
        } else {
          userType = userTypes.anonymous;
        }
        return userType;
      }
    }, {
      key: 'getUserTypeByProduct',
      value: function getUserTypeByProduct(cookieMap, productType) {
        var userType = userTypes.anonymous;
        if (cookieMap && cookieMap[this.ssoKey]) {
          if (cookieMap.userProducts) {
            var userProducts = decodeURIComponent(cookieMap.userProducts);
            userProducts = JSON.parse(userProducts);
            if (productType === productTypes.hdc) {
              userType = this.getHdcUserType(userProducts);
            } else {
              userType = this.getHtzTmUserType(userProducts, productType);
            }
          }
        }
        return userType;
      }
    }, {
      key: 'getHdcUserType',
      value: function getHdcUserType(userProducts) {
        // user has hdc paying product
        if (this.userHasProduct(userProducts, productTypes.hdc, false)) {
          return userTypes.payer;
        }
        // user has hdc trial product
        else if (this.userHasProduct(userProducts, productTypes.hdc, true)) {
            return userTypes.trial;
          }
        return userTypes.registered;
      }
    }, {
      key: 'getHtzTmUserType',
      value: function getHtzTmUserType(userProducts, productType) {
        // user has htz/tm paying product
        if (this.userHasProduct(userProducts, productType, false) || this.userHasProduct(userProducts, productTypes.htz_tm, false)) {
          return userTypes.payer;
        }
        // user has htz/tm trial product
        else if (this.userHasProduct(userProducts, productType, true) || this.userHasProduct(userProducts, productTypes.htz_tm, true)) {
            return userTypes.trial;
          }
        return userTypes.registered;
      }
    }, {
      key: 'userHasProduct',
      value: function userHasProduct(userProducts, productType, trial) {
        return userProducts.products.filter(function (product) {
          return product.prodNum === productType && product.trial === trial;
        }).length > 0;
      }
    }, {
      key: 'getUserAge',
      value: function getUserAge(cookieMap) {
        var age = void 0;
        var usrae = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].usrae;
        if (usrae) {
          age = parseInt(cookieMap[this.ssoKey].usrae, 10);
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
          gender = parseInt(cookieMap[this.ssoKey].urgdr, 10);
          gender = gender === 2 || gender === 1 ? gender : undefined;
        }
        return gender;
      }
    }, {
      key: 'getUserSSO',
      value: function getUserSSO(cookieMap, ssoKey$$1) {
        return cookieMap[ssoKey$$1];
      }
    }]);

    return User;
  }();

  var ConflictResolver = function () {
    function ConflictResolver(conflictManagementConfig) {
      _classCallCheck(this, ConflictResolver);

      this.dependencyMap = this.initializeDependencyMap(conflictManagementConfig);
      this.deferredSlots = new Set();
    }

    _createClass(ConflictResolver, [{
      key: 'initializeDependencyMap',
      value: function initializeDependencyMap(conflictManagementJson) {
        var _this = this;

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
          return _this;
        });
        return queue;
      }
    }, {
      key: 'updateResolvedSlot',
      value: function updateResolvedSlot(adSlotId, resolvedSize) {
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
    }, {
      key: 'isBlocked',
      value: function isBlocked(adSlotId) {
        var _this2 = this;

        if (!adSlotId) {
          throw new Error('isBlocked must be called with an adSlotId!');
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

                // Found rule specific to our target
                if (adSlotRule.avoid === adSlotId) {
                  (function () {
                    var parentResolvedWith = adSlot.resolvedWith;
                    // Fail fast: parent is not resolved yet - unknown returned size.
                    if (!parentResolvedWith) {
                      isBlocked = true;
                      _this2.deferredSlots.add(adSlotId);
                    }
                    if (adSlotRule.onsize.split(',').find(function (sizeString) {
                      // eslint-disable-line
                      var size = sizeString.split('x').map(function (numberStr) {
                        return parseInt(numberStr, 10);
                      });
                      return _this2.arraysEqual(size, parentResolvedWith);
                    })) {
                      // Block found
                      _this2.deferredSlots.add(adSlotId);
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
      key: 'isBlocking',
      value: function isBlocking(adSlotId) {
        if (!adSlotId) {
          throw new Error('isBlocking must be called with an adSlotId!');
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

      /**
       * Gets an array of adSlot Ids for a given adSlotId, that are dependent on (blocked by)
       * @param {String} adSlotId - the blocking slot id
       * @return {Array} an array of blocked slot, that has a dependency on the given slot
       */

    }, {
      key: 'getBlockedSlotsIds',
      value: function getBlockedSlotsIds(adSlotId) {
        var result = void 0;
        if (this.dependencyMap.has(adSlotId)) {
          result = Array.from(this.dependencyMap.get(adSlotId).rules.map(function (adSlot) {
            return adSlot.avoid;
          }));
        }
        return result || [];
      }
    }, {
      key: 'arraysEqual',
      value: function arraysEqual(a, b) {
        if (a === b) return true;
        if (a === null || b === null) return false;
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; ++i) {
          if (a[i] !== b[i]) return false;
        }
        return true;
      }
    }]);

    return ConflictResolver;
  }();

  ConflictResolver.EMPTY_SIZE = [];

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
    for (var i = 0; i < a.length; ++i) {
      if (Array.isArray(a[i]) && Array.isArray(b[i])) {
        if (!arraysEqual(a[i], b[i])) return false;
      } else if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  var hiddenClass = dfpConfig.site.indexOf('mouse') > -1 ? 'u-is-hidden' : 'h-hidden';

  var adSlot = function () {
    function adSlot(adSlotConfig) {
      _classCallCheck(this, adSlot);

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
        console.error(err); // eslint-disable-line no-console
      }
    }

    /**
     * Checks whether this adSlot is an 'Out-of-page' slot or not.
     * An Out-of-page slot is a slot that is not embedded in the page 'normally'.
     * @returns {boolean} true iff this adSlot is one of the predefined 'out-of-page' slots.
     */

    _createClass(adSlot, [{
      key: 'isOutOfPage',
      value: function isOutOfPage() {
        if (typeof this.type !== 'string') {
          throw new Error('An adSlot cannot by typeless!', this);
        }
        if (this.isMobile() === true) {
          return false;
        }
        switch (this.type) {
          case adTypes.maavaron:
            return false;
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
        if (typeof this.type !== 'string') {
          throw new Error('An adSlot cannot by typeless!', this);
        }
        if (this.isMobile() === true) {
          return false;
        }
        switch (this.type) {
          case adTypes.maavaron:
            return false;
          default:
            return false;
        }
      }
    }, {
      key: 'isMobile',
      value: function isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent || '')
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
          this.shown = true; // Ensure show will be called once per adSlot
          googletag.cmd.push(function () {
            if (_this.deferredSlot) {
              _this.slot = _this.defineSlot();
            }
            // console.log('calling show for slot',this.id,' called @',window.performance.now());
            document.getElementById(_this.id).classList.remove(hiddenClass);
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
          document.getElementById(_this2.id).classList.add(hiddenClass);
        });
      }

      /**
       * Initializes page-level slot definition for the current slot
       * @return {Slot} slot - the Google Slot that was defined from this AdSlot configuration
       */

    }, {
      key: 'defineSlot',
      value: function defineSlot() {
        if (this.isMaavaron()) {
          var maavaronSlot = this.defineMaavaron();
          if (this.adManager.shouldSendRequestToDfp(this)) {
            if (!this.shown) {
              this.shown = true; // Ensure show will be called once
              maavaronSlot.display();
            }
          }
          return maavaronSlot;
        }
        var googletag = window.googletag;
        var pubads = googletag.pubads();
        var args = [];
        var defineFn = this.isOutOfPage() ? googletag.defineOutOfPageSlot : googletag.defineSlot;
        // 3 or 2 params according to the function that we want to activate.
        args.push(this.getPath());
        if (this.isOutOfPage() === false) {
          if (this.fluid) {
            args.push('fluid');
          } else {
            args.push(this.adSizeMapping);
          }
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
                // ['xxs','xs',...]
                responsiveSlotSizeMapping.addSize([breakpoints[key], 100], // 100 is a default height, since it is height agnostic
                !arraysEqual(this.responsiveAdSizeMapping[key], [[0, 0]]) ? this.responsiveAdSizeMapping[key] : []);
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
       * @returns {String} a formatted string that represent the path for the slot definition
       */

    }, {
      key: 'getPath',
      value: function getPath() {
        var _this3 = this;

        /* eslint-disable no-shadow */
        var path = dfpConfig.path || [];
        path = path.filter(function (path) {
          return path !== '.';
        });
        path = path.map(function (section) {
          return '' + _this3.id + _this3.department + section;
        }).join('/');
        // If a path exist, it will be preceded with a forward slash
        path = path && this.config.department !== '_homepage' ? '/' + path : '';
        /* eslint-enable no-shadow */
        var calculatedPath = '/' + this.config.network + '/' + this.config.adUnitBase + '/' + this.id + '/' + this.id + this.department + path; // eslint-disable-line max-len
        return calculatedPath.toLowerCase();
      }

      /* eslint-disable */

    }, {
      key: 'slotRendered',
      value: function slotRendered(event) {
        var id = event.slot.getAdUnitPath().split('/')[3]; // Convention: [0]/[1]network/[2]base/[3]id
        var isEmpty = event.isEmpty; // Did the ad return as empty?
        var resolvedSize = event.size; // What 'creative' size did the ad return with?
        // Empty or onload callback should be called next?
      }
      /* eslint-enable */

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
       * @return {Slot} slot - the Google Slot that was defined for Maavaron
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
        return null;
      }
    }]);

    return adSlot;
  }();

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
  var userTypes$1 = {
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

      _classCallCheck(this, AdManager);

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
        // Mouse special treatment to base path on mobile breakpoints
        var currentBreakpointName = getBreakpointName(getBreakpoint());
        if (this.config.adManagerConfig.adUnitBase.indexOf('mouse.co.il') > -1 && currentBreakpointName.indexOf('xs') > -1) {
          this.config.adManagerConfig.adUnitBase = 'mouse.co.il.mobile_web';
        }
        // Holds adSlot objects as soon as possible.
        googletag.cmd.push(function () {
          _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.high);
        });
        // Once DOM ready, add more adSlots.
        var onDomLoaded = function onDomLoaded() {
          // eslint-disable-line no-inner-declarations
          try {
            googletag.cmd.push(function () {
              _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.high);
              googletag.cmd.push(function () {
                _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.normal);
              });
            });
          } catch (err) {
            console.log(err); // eslint-disable-line no-console
          }
        };
        // Once window was loaded, add the rest of the adSlots.
        var onWindowLoaded = function onWindowLoaded() {
          // eslint-disable-line no-inner-declarations
          googletag.cmd.push(function () {
            _this.adSlots = _this.initAdSlots(config.adSlotConfig, adPriorities.low);
            // Clean blocking adSlots that are not defined on this page
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = _this.conflictResolver.dependencyMap.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var blockingAdSlotKey = _step.value;

                if (!_this.adSlots.has(blockingAdSlotKey)) {
                  _this.conflictResolver.dependencyMap.delete(blockingAdSlotKey);
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

            _this.showAllDeferredSlots();
          });
        };
        switch (document.readyState) {
          case 'loading':
            document.addEventListener('DOMContentLoaded', onDomLoaded);
            window.addEventListener('load', onWindowLoaded);
            break;
          case 'interactive':
            onDomLoaded();
            window.addEventListener('load', onWindowLoaded);
            break;
          default:
            // 'complete' - no need for event listeners.
            onDomLoaded();
            onWindowLoaded();
        }
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
      }
    }

    /**
     * Shows all of the adSlots that can be displayed.
     */

    _createClass(AdManager, [{
      key: 'showAllSlots',
      value: function showAllSlots() {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.adSlots.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var adSlotKey = _step2.value;

            var adSlot$$1 = this.adSlots.get(adSlotKey);
            if (adSlot$$1.type !== adTypes.talkback && this.shouldSendRequestToDfp(adSlot$$1)) {
              adSlot$$1.show();
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
       * Gets all adSlots that has a certain priority
       * @param {adPriority} priority - the priority of the ad {high, normal, low}
       * @return {Array<AdSlot>} adSlots - all of the defined adSlots that matches
       * the given priority
       */

    }, {
      key: 'getAdSlotsByPriority',
      value: function getAdSlotsByPriority(priority) {
        function priorityFilter(adSlot$$1) {
          return adSlot$$1.priority === priority;
        }
        return Array.from(this.adSlots.values()).filter(priorityFilter);
      }
    }, {
      key: 'showAllDeferredSlots',
      value: function showAllDeferredSlots() {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.conflictResolver.deferredSlots[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var deferredSlotId = _step3.value;

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
       * Refreshes all responsive adSlots
       */

    }, {
      key: 'refreshAllSlots',
      value: function refreshAllSlots() {
        var currentBreakpoint = getBreakpoint();
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.adSlots.keys()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var adSlotKey = _step4.value;

            var adSlot$$1 = this.adSlots.get(adSlotKey);
            if (adSlot$$1.responsive && adSlot$$1.type !== adTypes.maavaron) {
              if (adSlot$$1.lastResolvedWithBreakpoint !== currentBreakpoint && this.shouldSendRequestToDfp(adSlot$$1)) {
                // console.log(`calling refresh for adSlot: ${adSlot.id}`);
                adSlot$$1.refresh();
              } else {
                adSlot$$1.hide();
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
      }

      /**
       * Refreshes all adSlots
       */

    }, {
      key: 'refreshAllSlotsInPage',
      value: function refreshAllSlotsInPage() {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.adSlots.keys()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var adSlotKey = _step5.value;

            var adSlot$$1 = this.adSlots.get(adSlotKey);
            if (this.shouldSendRequestToDfp(adSlot$$1)) {
              // console.log(`calling refresh for adSlot: ${adSlot.id}`);
              adSlot$$1.refresh();
            } else {
              adSlot$$1.hide();
            }
          }
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
      }

      /**
       * Refreshes adSlot
       */

    }, {
      key: 'refreshSlot',
      value: function refreshSlot(adUnitName) {
        var adSlot$$1 = this.adSlots.get(adUnitName);
        if (this.shouldSendRequestToDfp(adSlot$$1)) {
          // console.log(`calling refresh for adSlot: ${adSlot.id}`);
          adSlot$$1.refresh();
        } else {
          adSlot$$1.hide();
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

    }, {
      key: 'initAdSlots',
      value: function initAdSlots(adSlotConfig, filteredPriority) {
        var _this2 = this;

        var adSlots = new Map(this.adSlots);
        var adSlotPlaceholders = Array.from(document.getElementsByClassName('js-dfp-ad'));
        adSlotPlaceholders = adSlotPlaceholders.filter(function (node) {
          return node.id;
        }); // only nodes with an id
        var adSlotNodeSet = new Set();
        adSlotPlaceholders = Array.prototype.filter.call(adSlotPlaceholders, function (node) {
          if (adSlotNodeSet.has(node.id) === false) {
            // first occurrence of Node
            adSlotNodeSet.add(node.id);
            return true;
          }
          return false;
        });
        // adSlotPlaceholders = adSlotPlaceholders.sort((a, b) => a.offsetTop - b.offsetTop);
        adSlotPlaceholders.forEach(function (adSlot$$1) {
          var adSlotPriority = adSlotConfig[adSlot$$1.id] ? adSlotConfig[adSlot$$1.id].priority || adPriorities.normal : undefined;
          if (adSlotConfig[adSlot$$1.id] && adSlots.has(adSlot$$1.id) === false && adSlotPriority === filteredPriority) {
            // The markup has a matching configuration from adSlotConfig AND was not already defined
            try {
              // adSlotConfig is built from globalConfig, but can be overridden by markup
              var computedAdSlotConfig = Object.assign({}, adSlotConfig[adSlot$$1.id], {
                id: adSlot$$1.id,
                target: adSlot$$1.attributes['data-audtarget'] ? adSlot$$1.attributes['data-audtarget'].value : adTargets.all,
                type: _this2.getAdType(adSlot$$1.id),
                responsive: adSlotConfig[adSlot$$1.id].responsive,
                fluid: adSlotConfig[adSlot$$1.id].fluid || false,
                user: _this2.user,
                adManager: _this2,
                htmlElement: adSlot$$1,
                department: _this2.config.department,
                network: _this2.config.adManagerConfig.network,
                adUnitBase: _this2.config.adManagerConfig.adUnitBase,
                deferredSlot: _this2.conflictResolver.isBlocked(adSlot$$1.id),
                priority: adSlotPriority
              });
              var adSlotInstance = new adSlot(computedAdSlotConfig);
              adSlots.set(adSlot$$1.id, adSlotInstance);
              if (adSlotInstance.type !== adTypes.talkback && adSlotInstance.priority === adPriorities.high && _this2.shouldSendRequestToDfp(adSlotInstance)) {
                /*
                 console.log('calling show for high priority slot', adSlotInstance.id, ' called @',
                 window.performance.now());
                 */
                adSlotInstance.show();
              }
            } catch (err) {
              console.error(err); // eslint-disable-line no-console
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
       * @param {String} adSlotId - the adSlot's identifier.
       * @returns {*} enumerated export 'adTypes'
       */

    }, {
      key: 'getAdType',
      value: function getAdType(adSlotId) {
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

    }, {
      key: 'shouldSendRequestToDfp',
      value: function shouldSendRequestToDfp(adSlot$$1) {
        // Conflict management check
        return this.conflictResolver.isBlocked(adSlot$$1.id) === false &&
        // Valid Referrer check
        adSlot$$1.isWhitelisted() &&
        // Not in referrer Blacklist
        adSlot$$1.isBlacklisted() === false && this.shouldDisplayAdAfterAdBlockRemoval(adSlot$$1) &&
        //  if a paywall pop-up is shown And the number is 12 or more - SHOW MAAVRON
        this.shouldDisplayAdMaavaronAfterPayWallBanner(adSlot$$1) &&
        // Responsive: breakpoint contains ad?
        this.doesBreakpointContainAd(adSlot$$1) &&
        // check in case of Smartphoneapp
        this.haveValidCookieForSmartphoneapp() &&
        // Targeting check (userType vs. slotTargeting)
        this.doesUserTypeMatchBannerTargeting(adSlot$$1) &&
        // Impressions Manager check (limits number of impressions per slot)
        this.user.impressionManager.reachedQuota(adSlot$$1.id) === false;
      }
    }, {
      key: 'shouldDisplayAdAfterAdBlockRemoval',
      value: function shouldDisplayAdAfterAdBlockRemoval(adSlot$$1) {
        return !(this.config.adBlockRemoved === true && (adSlot$$1.type === adTypes.maavaron || adSlot$$1.type === adTypes.popunder));
      }
    }, {
      key: 'shouldDisplayAdMaavaronAfterPayWallBanner',
      value: function shouldDisplayAdMaavaronAfterPayWallBanner(adSlot$$1) {
        var shouldDisplay = true;
        if (this.config.site === 'haaretz' && adSlot$$1.type === adTypes.maavaron) {
          try {
            var paywallBanner = JSON.parse(window.localStorage.getItem('_cobj'));
            shouldDisplay = !paywallBanner || paywallBanner.mc && paywallBanner.mc >= 12 || paywallBanner.nextslotLocation && !paywallBanner.nextslotLocation.includes('pop');
          } catch (err) {
            /* eslint-disable no-console*/
            console.error('ERROR ON shouldDisplayAdMaavaronAfterPayWallBanner');
            /* eslint-enable no-console*/
          }
        }
        return shouldDisplay;
      }

      /**
       * Check whether or not an ad slot should appear for the current user type
       * @param {String} adSlotOrTarget the adSlot to check or the target as a string
       * @returns {boolean} true iff the slot should appear for the user type
       */

    }, {
      key: 'haveValidCookieForSmartphoneapp',
      value: function haveValidCookieForSmartphoneapp() {
        return this.config.isValidForsmartPhone;
      }

      /**
       * Check whether or not an ad slot should appear for the current user type
       * @param {String} adSlotOrTarget the adSlot to check or the target as a string
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
            return userType === userTypes$1.anonymous || userType === userTypes$1.registered;
          case adTargets.anonymous:
            return userType === userTypes$1.anonymous;
          case adTargets.registered:
            return userType === userTypes$1.registered;
          case adTargets.paying:
            return userType === userTypes$1.payer;
          case adTargets.digitalOnly:
            return userType === userTypes$1.payer;
          case adTargets.digitalAndPrint:
            return userType === userTypes$1.payer;
          default:
            return false;
        }
      }

      /**
       * Report to the AdManager that a breakpoint has been switched (passed from one break to
       * another). Should there be a responsive slot with a
       * @param {Breakpoint} breakpoint - the breakpoint that is currently being displayed
       * @returns {Integer} affected - the number of adSlots affected by the change
       */

    }, {
      key: 'switchedToBreakpoint',
      value: function switchedToBreakpoint(breakpoint) {
        if (!breakpoint) {
          throw new Error('Missing argument: a call to switchedToBreakpoint must have an breakpoint');
        }
        var count = 0;
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.adSlots.keys()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var adSlotKey = _step6.value;

            var adSlot$$1 = this.adSlots.get(adSlotKey);
            if (adSlot$$1.responsive === true && adSlot$$1.lastResolvedWithBreakpoint) {
              if (adSlot$$1.lastResolvedWithBreakpoint !== breakpoint) {
                adSlot$$1.refresh();
                count++;
              }
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

        return count;
      }

      /**
       * Checks whether an adSlot is defined for a given breakpoint (Default: current breakpoint)
       * @param {AdSlot} adSlot - the adSlot to check.
       * @param {Breakpoint} [breakpoint=currentBreakpoint] - the breakpoint to check this ad in.
       * @returns {boolean} true iff the adSlot is defined for the given breakpoint.
       */

    }, {
      key: 'doesBreakpointContainAd',
      value: function doesBreakpointContainAd(adSlot$$1) {
        var breakpoint = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getBreakpoint();

        if (!adSlot$$1) {
          throw new Error('Missing argument: a call to doesBreakpointContainAd must have an adSlot');
        }
        var containsBreakpoint = true;
        if (adSlot$$1.responsive === true) {
          var mapping = adSlot$$1.responsiveAdSizeMapping[getBreakpointName(breakpoint)];
          if (Array.isArray(mapping) === false) {
            throw new Error('Invalid argument: breakpoint:' + breakpoint + ' doesn\'t exist!', this);
          }
          containsBreakpoint = mapping.length > 0 && !arraysEqual(mapping, [[0, 0]]);
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
            // console.log('slotRenderEnded for slot',id,' called @',window.performance.now());
            if (_this3.adSlots.has(id)) {
              var adSlot$$1 = _this3.adSlots.get(id);
              adSlot$$1.lastResolvedSize = resolvedSize;
              adSlot$$1.lastResolvedWithBreakpoint = getBreakpoint();
              if (isEmpty) {
                adSlot$$1.lastResolvedSize = ConflictResolver.EMPTY_SIZE;
                adSlot$$1.hide();
                _this3.releaseSlotDependencies(adSlot$$1);
              } else {
                _this3.releaseSlotDependencies(adSlot$$1, adSlot$$1.lastResolvedSize);
              }
              _this3.user.impressionManager.registerImpression('' + adSlot$$1.id + _this3.config.department);
              _this3.user.impressionManager.registerImpression(adSlot$$1.id + '_all');
            }
          });
        } else {
          throw new Error('googletag api was not ready when \'initSlotRenderedCallback\' was called!');
        }
      }
    }, {
      key: 'releaseSlotDependencies',
      value: function releaseSlotDependencies(adSlot$$1) {
        try {
          var id = adSlot$$1.id;
          this.conflictResolver.updateResolvedSlot(id, adSlot$$1.lastResolvedSize);
          if (this.conflictResolver.isBlocking(id)) {
            // Hide all blocked adSlots
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
              for (var _iterator7 = this.conflictResolver.getBlockedSlotsIds(id)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var blockedSlot = _step7.value;

                if (this.conflictResolver.isBlocked(blockedSlot)) {
                  if (this.adSlots.has(blockedSlot)) {
                    this.adSlots.get(blockedSlot).hide();
                  }
                }
              }
              // Show the non blocked
            } catch (err) {
              _didIteratorError7 = true;
              _iteratorError7 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                  _iterator7.return();
                }
              } finally {
                if (_didIteratorError7) {
                  throw _iteratorError7;
                }
              }
            }

            var _iteratorNormalCompletion8 = true;
            var _didIteratorError8 = false;
            var _iteratorError8 = undefined;

            try {
              for (var _iterator8 = this.conflictResolver.deferredSlots.keys()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var deferredSlotKey = _step8.value;

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
              _didIteratorError8 = true;
              _iteratorError8 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                  _iterator8.return();
                }
              } finally {
                if (_didIteratorError8) {
                  throw _iteratorError8;
                }
              }
            }
          }
        } catch (err) {
          /* eslint-disable no-console*/
          console.error('Cannot updateSlotDependencies for adSlot: ' + adSlot$$1.id);
          /* eslint-enable no-console*/
        }
      }
    }, {
      key: 'setSsoGroupKey',
      value: function setSsoGroupKey() {
        fetch('/ssoGroupKey?value=' + this.user.sso.userId, {
          method: 'GET',
          cache: false
        }).then(function (value) {
          if (value) {
            value.json().then(function (data) {
              if (data && data.result && data.result !== 'item not found' && data.result !== 'value is empty') {
                localStorage.setItem('_SsoGroupKey', data.result);
              }
            });
          }
        });
      }

      /**
       * Initializes page-level targeting params.
       */

    }, {
      key: 'initGoogleTargetingParams',
      value: function initGoogleTargetingParams() {
        if (window.googletag && window.googletag.apiReady) {
          // Returns a reference to the pubads service.
          var SsoGroupKey = null;
          try {
            SsoGroupKey = localStorage.getItem('_SsoGroupKey');
            if (!SsoGroupKey) {
              this.setSsoGroupKey();
            }
          } catch (e) {
            SsoGroupKey = null;
          }
          var pubads = googletag.pubads();
          // Environment targeting (dev, test, prod)
          if (this.config.environment) {
            pubads.setTargeting('stg', [this.config.environment]);
          }

          // User targeting
          if (this.user.type) {
            pubads.setTargeting('UserType', [this.user.type]);
          }
          if (this.user.htz_type) {
            pubads.setTargeting('htz_user_type', [this.user.htz_type]);
          }
          if (this.user.tm_type) {
            pubads.setTargeting('tm_user_type', [this.user.tm_type]);
          }
          if (this.user.hdc_type) {
            pubads.setTargeting('hdc_user_type', [this.user.hdc_type]);
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
          if (this.config.proposalNumber) {
            pubads.setTargeting('proposaltype', [this.config.proposalNumber]);
          }
          if (this.config.pageType) {
            pubads.setTargeting('pageType', [this.config.pageType]);
          }
          if (this.config.isWriterAlerts) {
            pubads.setTargeting('WriterAlerts', ['true']);
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
          if (this.config.tags && Array.isArray(this.config.tags)) {
            pubads.setTargeting('tags', [].concat(_toConsumableArray(this.config.tags)));
          }

          if (this.user.sso && this.user.sso.userId && SsoGroupKey) {
            pubads.setTargeting(SsoGroupKey, this.user.sso.userId);
          }
          if (this.config.anonymousId) {
            var anonymousIdKeyName = 'anonymousIdKey';
            pubads.setTargeting(anonymousIdKeyName, this.config.anonymousId);
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
          var googleGlobalSettings = this.config.googleGlobalSettings;
          // Enable GET parameter overrides
          if (window.location.search) {
            var search = window.location.search;
            if (search.indexOf('sraon') > 0) {
              console.log('Single Request Mode: active'); // eslint-disable-line no-console
              googleGlobalSettings.enableSingleRequest = true;
            } else if (search.indexOf('sraoff') > 0) {
              console.log('Single Request Mode: disabled'); // eslint-disable-line no-console
              googleGlobalSettings.enableSingleRequest = false;
            }
            if (search.indexOf('asyncrenderingon') > 0) {
              console.log('Async rendering mode: active'); // eslint-disable-line no-console
              googleGlobalSettings.enableAsyncRendering = true;
            } else if (search.indexOf('asyncrenderingonoff') > 0) {
              console.log('Sync rendering mode: active'); // eslint-disable-line no-console
              googleGlobalSettings.enableAsyncRendering = false;
            }
          }
          // Google services activation
          if (googleGlobalSettings.enableSingleRequest === true) {
            googletag.pubads().enableSingleRequest();
          }
          if (googleGlobalSettings.enableAsyncRendering === true) {
            googletag.pubads().enableAsyncRendering();
          } else {
            googletag.pubads().enableSyncRendering();
          }
          // Enables all GPT services that have been defined for ad slots on the page.
          googletag.enableServices();
        } else {
          throw new Error('googletag api wasn\'t ready when \'initGoogleGlobalSettings\' was called!');
        }
      }
    }]);

    return AdManager;
  }();

  var defaultConfig = dfpConfig || {};
  var resizeTimeout = 250;

  var DFP = function () {
    function DFP(config) {
      _classCallCheck(this, DFP);

      this.config = Object.assign({}, defaultConfig, config);
      this.wasInitialized = false;
      this.initStarted = false;
      this.breakpoint = getBreakpoint();
      this.initWindowResizeListener();
    }

    /**
     * This part of the object's construction is dependent on the call to 'init'
     */

    _createClass(DFP, [{
      key: 'resumeInit',
      value: function resumeInit() {
        try {
          this.adManager = this.adManager || new AdManager(this.config);
        } catch (err) {
          console.error(err); // eslint-disable-line no-console
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
          if (dfpThis.initStarted === true) {
            googletag.cmd.push(function () {
              dfpThis.wasInitialized = true;
              resolve(dfpThis);
            });
          } else {
            dfpThis.initStarted = true;
            // set up a place holder for the gpt code downloaded from google
            window.googletag = window.googletag || {};

            // this is a command queue used by GPT any methods added to it will be
            // executed when GPT code is available, if GPT is already available they
            // will be executed immediately
            window.googletag.cmd = window.googletag.cmd || [];
            // load google tag services JavaScript
            (function () {
              var tag = window.document.createElement('script');
              tag.async = true;
              tag.type = 'text/javascript';
              // Supports both https and http
              tag.setAttribute('src', '//www.googletagservices.com/tag/js/gpt.js');
              var node = window.document.getElementsByTagName('script')[0];
              tag.addEventListener('load', function () {
                dfpThis.resumeInit();
                googletag.cmd.push(function () {
                  dfpThis.wasInitialized = true;
                  resolve(_this);
                });
              });
              tag.addEventListener('error', function (error) {
                dfpThis.wasInitialized = false;
                reject(error);
              });
              node.parentNode.insertBefore(tag, node);
            })();
          }
        });
      }

      /**
       *  Returns true iff googletag was properly initialized on the page
       * @returns {boolean}
       */

    }, {
      key: 'isGoogleTagReady',
      value: function isGoogleTagReady() {
        if (this.wasInitialized === true || window.googletag && window.googletag.apiReady) {
          this.wasInitialized = true;
        }
        return this.wasInitialized;
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
          if (dfpThis.breakpoint !== currentBreakpoint) {
            dfpThis.breakpoint = currentBreakpoint;
            if (dfpThis.adManager) {
              dfpThis.adManager.refreshAllSlots();
            } else {
              throw new Error('initWindowResizeListener error - adManager instance is not available');
            }
          }
        }
        var debouncedFunction = debounce(onResize, resizeTimeout);
        window.onresize = debouncedFunction;
      }
    }]);

    return DFP;
  }();

  // generated by genversion
  var version = '2.4.5';

  // DFP version is based on the package.json
  DFP.version = version || 'VERSION';

  /*
   // Only for development mode
   if ( process.env.NODE_ENV !== 'production' ) {
   DFP.dev = '123';
   }
   */

  var config = dfpConfig;
  var version$1 = DFP.version;

  exports.config = config;
  exports.version = version$1;
  exports.default = DFP;

  return exports;

}({}));

//# sourceMappingURL=dfp.js.map