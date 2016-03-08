/*!
 * DFP v0.0.2
 * (c) 2016 Elia Grady
 * Released under the MIT License.
 */
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
  maxImpressions: 'maxImpressions',
  hours: 'hour',
  days: 'day'
};

var ImpressionsManager = function () {
  function ImpressionsManager(config) {
    babelHelpers.classCallCheck(this, ImpressionsManager);

    this.now = new Date().getTime(); //this date is used for comparisons only
    this.config = config;
    this.impressions = JSON.parse(localStorage.getItem(keys.impressions) || "{}");
    this.initImpressionMap();
  }

  babelHelpers.createClass(ImpressionsManager, [{
    key: 'saveImpressionsToLocalStorage',
    value: function saveImpressionsToLocalStorage() {
      localStorage.setItem(keys.impressions, JSON.stringify(this.impressions));
    }
  }, {
    key: 'initImpressionMap',
    value: function initImpressionMap() {
      var _this = this;

      Object.keys(this.config).map(function (key, index) {
        var slotName = key;
        var slot = undefined,
            shouldUpdateExpiryDate = false;
        if (slot = _this.impressions[slotName]) {
          //Existing slotName (update)
          if (_this.config[slotName] = !slot[keys.frequency]) {
            // Updating the frequency will trigger a new expiry date
            shouldUpdateExpiryDate = true;
            _this.impressions[keys.frequency] = _this.config[slotName];
          } else if (_this.now > slot[keys.expires]) {
            // Old value that should trigger a new expiry date
            shouldUpdateExpiryDate = true;
          }
        } else {
          //Non-existing slotName (create)
          _this.initSlotFromConfig(slotName);
          //this.impressions[slotName] = this.impressions[slotName] || {};
          //this.impressions[slotName][keys.frequency] = this.config[slotName];
        }
        if (shouldUpdateExpiryDate) {
          _this.updateExpiryDate(slotName);
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
      var frequencyMap = this.impressions[slotName][keys.frequency].match(keys.frequencyRegex);
      now.setMilliseconds(0);
      now.setSeconds(0);
      now.setMinutes(0);
      if (frequencyMap.indexOf(keys.days) > -1) {
        now.setHours(0);
      }
      this.impressions[slotName][keys.expires] = (frequencyMap.indexOf(keys.days) > -1 ? addDays(now, frequencyMap[2]) : addHours(now, frequencyMap[2])).getTime();

      //Set max impressions:
      this.impressions[slotName][keys.maxImpressions] = frequencyMap[1];
      function addHours(date, hours) {
        var result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
      }
      function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      }
    }

    /**
     * Initializes a non-existing slot from the passed global configuration for the slot
     * @param slotName the name of the slot to create
       */

  }, {
    key: 'initSlotFromConfig',
    value: function initSlotFromConfig(slotName) {
      var slot = this.impressions[slotName] || {};
      slot[keys.frequency] = this.config[slotName];
      slot[keys.exposed] = 0;
      this.impressions[slotName] = slot;
      this.updateExpiryDate(slotName);
    }
  }, {
    key: 'registerImpression',
    value: function registerImpression(slotName) {
      //TODO convert to a promise based registerImpression API
      this.impressions[slotName][keys.exposed] += 1;
      return true;
    }
  }, {
    key: 'reachedQuota',
    value: function reachedQuota(slotName) {
      var now = new Date().getTime();
      //Second element of 2/4day matches '2'
      var maxImpressions = this.impressions[slotName][keys.maxImpressions];
      //Not expired, and reached max impressions
      return this.impressions[slotName][keys.expires] < now && this.impressions[slotName][keys.exposed] <= maxImpressions;
    }
  }]);
  return ImpressionsManager;
}();

//globalConfig for DFP
var dfpConfig = {
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
    var regexMatch = /([\d|\w]+)(\.co\.il|\.com)(.*)?/.exec(location.hostname);
    var result = regexMatch ? regexMatch[0] : location.hostname;
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
    return window.location.pathname.split('/').slice(1, -1).map(function (section) {
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
    return window.location.port === '8080' ? env.dev : window.location.hostname.indexOf('pre.haaretz.co.il') > -1 || window.location.hostname.indexOf('tmtest.haaretz.com') > -1 ? env.test : window.location.pathname.indexOf('/cmlink/Haaretz.HomePage') > -1 || window.location.pathname.indexOf('/cmlink/TheMarker.HomePage') > -1 ? env.prod : undefined;
  },
  /**
   * Returns the articleIf if on an article page, or null otherwise
   * @returns {string} an articleId string from the pathname, or null if none is found
   */
  get articleId() {
    var articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
    var articleId = undefined;
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
  get gStatCampaignNumber() {
    var GstatCampaign = window.localStorage.getItem('GstatCampaign') ? JSON.parse(window.localStorage.getItem('GstatCampaign')) : undefined;
    return GstatCampaign ? GstatCampaign['CampaignNumber'] : undefined;
  },
  adSlotConfig: {
    "haaretz.co.il.example.slot": {
      id: "slotId",
      //path : "/network/base/slotId/slotId_subsection", Will be calculated from AdManager
      responsive: true,
      adSizeMapping: [['width1', 'height1']].concat(['widthN', 'heightN']),
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
  sso: ssoKey

};

var userTypes$1 = {
  payer: 'payer',
  registered: 'registered',
  anonymous: 'anonymous'
};

var defaultConfig$2 = dfpConfig;

var User = function () {
  function User(config) {
    babelHelpers.classCallCheck(this, User);

    this.config = Object.assign({}, defaultConfig$2, config);
    this.ssoKey = this.config.userConfig.ssoKey || ssoKey;
    var cookieMap = getCookieAsMap(this.ssoKey);
    this.type = this.getUserType(cookieMap);
    this.impressionManager = this.initImpressionMap();
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
      var age = undefined;
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
      var gender = undefined;
      var urgdr = cookieMap[this.ssoKey] && cookieMap[this.ssoKey].urgdr;
      if (urgdr) {
        gender = parseInt(cookieMap[this.ssoKey].urgdr);
        gender = gender === 2 || gender === 1 ? gender : undefined;
      }
      return gender;
    }

    /**
     * TODO change
     * @returns {ImpressionsManager}
       */

  }, {
    key: 'initImpressionMap',
    value: function initImpressionMap() {
      var globalConfig = {};
      if (window.adUnitsFrequencyMap) {
        Object.keys(adUnitsFrequencyMap).map(function (key, index) {
          globalConfig[key] = adUnitsFrequencyMap[key];
        });
      }
      return new ImpressionsManager(globalConfig);
    }
  }]);
  return User;
}();

/*global conflicManagementJson, conflictManagementJson*/

var ConflictResolver = function () {
  function ConflictResolver() {
    babelHelpers.classCallCheck(this, ConflictResolver);

    this.blockingQueue = this.initQueueFromJson();
  }

  babelHelpers.createClass(ConflictResolver, [{
    key: "initQueueFromJson",
    value: function initQueueFromJson() {
      var queue = [];
      var conflictManagementJson = window.conflicManagementJson || window.conflictManagementJson || {};
      //Typo in original code. //TODO fix typo

      Object.keys(conflictManagementJson).map(function (key, value) {
        var rules = conflictManagementJson[key];
        if (rules) {
          rules = rules.filter(function (item) {
            return item.onsize && item.avoid;
          });
        }
        queue.push({
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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.blockingQueue[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var adSlot = _step.value;

          if (adSlot.id = adSlotId) {
            adSlot.resolvedWith = resolvedSize; //Size, i.e. 1280x200
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
  }, {
    key: "isBlocked",
    value: function isBlocked(adSlotId) {
      if (!adSlotId) {
        throw new Error("isBlocked must be called with an adSlotId!");
      }
      var isBlocked = false;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.blockingQueue[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var adSlot = _step2.value;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = adSlot.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var adSlotRule = _step3.value;

              //Found rule specific to our target
              if (adSlotRule.avoid === adSlotId) {
                (function () {
                  var parentResolvedWith = adSlot.resolvedWith;
                  // Fail fast: parent is not resolved yet - unknown returned size.
                  if (!parentResolvedWith) {
                    isBlocked = true;
                  }
                  if (adSlotRule.onsize.split(',').find(function (size) {
                    return size === parentResolvedWith;
                  })) {
                    //Block found
                    isBlocked = true;
                  }
                })();
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

      return isBlocked;
    }
  }]);
  return ConflictResolver;
}();

var adSlot = function () {
  function adSlot(config) {
    babelHelpers.classCallCheck(this, adSlot);

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
    if (!this.config.id) {
      throw new Error("an adSlot requires an id!");
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

  babelHelpers.createClass(adSlot, [{
    key: 'isOutOfPage',
    value: function isOutOfPage() {
      switch (this.type) {
        case adTypes.maavaron:
          return true;
        case adTypes.popunder:
          return true;
        case adTypes.talkback:
          return true;
        case adTypes.regular:
          return false;
        default:
          return false;
      }
    }
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

      if (this.type === adTypes.maavaron) {
        //maavaron uses synced request by definePassback
        this.showMaavaron();
      } else {
        googletag.cmd.push(function () {
          googletag.display(_this.id);
        });
      }
    }
    /**
     * Initializes page-level slot definition for the current slot
     */

  }, {
    key: 'defineSlot',
    value: function defineSlot() {
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
      this.slot = slot;
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      var _this2 = this;

      var path = this.config.path;
      path = path.map(function (section) {
        return '' + _this2.id + section;
      }).join('/');
      path = path ? '/' + path : '';
      var calculatedPath = this.config.network + '/' + this.config.adUnitBase + '/' + this.id + this.department + path;
      console.log('Calculated path : ' + calculatedPath);
      return calculatedPath;
    }
  }, {
    key: 'slotRendered',
    value: function slotRendered(event) {
      var id = event.slot.getAdUnitPath().split('/')[3];
      var isEmpty = event.isEmpty;
      var resolvedSize = event.size;
      // Empty or onload callback
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      googletag.pubads().refresh([this.id]);
    }
  }, {
    key: 'showMaavaron',
    value: function showMaavaron() {
      if (document.referrer.match('loc.haaretz') === false) {
        var adUnitMaavaronPath = this.getPath();
        var adUnitMaavaronSize = [[2, 1]];
        googletag.pubads().definePassback(adUnitMaavaronPath, adUnitMaavaronSize).setTargeting('UserType', [this.user.type]).setTargeting('age', [this.user.age]).setTargeting('urgdr', [this.user.gender]).setTargeting('articleId', [this.config.articleId]).setTargeting('stg', [this.config.environment]).display();
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

var breakpoints = dfpConfig.breakpointsConfig.breakpoints;

/**
 * Returns the current breakpoint that is closest to the window's width
 * @returns {number} the break that the current width represents
 */
function getBreakpoint() {
  var breakpoint = breakpoints.xxl;
  var windowWidth = window.innerWidth;
  if (windowWidth < breakpoints.xl) {
    breakpoint = breakpoints.xl;
  }
  if (windowWidth < breakpoints.l) {
    breakpoint = breakpoints.l;
  }
  if (windowWidth < breakpoints.m) {
    breakpoint = breakpoints.m;
  }
  if (windowWidth < breakpoints.s) {
    breakpoint = breakpoints.s;
  }
  if (windowWidth < breakpoints.xs) {
    breakpoint = breakpoints.xs;
  }
  if (windowWidth < breakpoints.xxs) {
    breakpoint = breakpoints.xxs;
  }
  return breakpoint;
}

// There are a total of 7 adTargets:
// "all","nonPaying","anonymous","registered","paying","digitalOnly" and "digitalAndPrint"
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
  maavaron: '.web.maavaron',
  popunder: '.web.popunder',
  talkback: '.web.fullbanner.talkback',
  regular: ''
};

var defaultConfig$1 = {
  target: adTargets.all,
  type: adTypes.regular,
  responsive: false,
  get department() {
    return dfpConfig.isHomepage ? 'homepage' : 'section';
  }
};

var AdManager = function () {
  function AdManager(config) {
    babelHelpers.classCallCheck(this, AdManager);

    this.config = Object.assign({}, defaultConfig$1, config);
    this.user = new User(config);
    this.conflictResolver = new ConflictResolver();
    // Holds adSlot objects
    this.adSlots = this.initAdSlots();
    // Holds googletag.Slot objects in a Map() object. (K,V): id => Slot
    // [https://developers.google.com/doubleclick-gpt/reference#googletag.Slot]
    //this.adSlotDefinitions = this.initAdSlotDefinitions();
    this.initSlotRenderedCallback();
  }

  babelHelpers.createClass(AdManager, [{
    key: 'showAllSlots',
    value: function showAllSlots() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.adSlots[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var adSlot$$ = _step.value;

          if (this.shouldSendRequestToDfp(adSlot$$)) {
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

    //TODO use the passed config param, instead of globalConfig.

  }, {
    key: 'initAdSlots',
    value: function initAdSlots(config) {
      var _this = this;

      var adSlots = [];
      var adSlotPlaceholders = document.getElementsByClassName('js-dfp-ad');
      Array.prototype.forEach.call(adSlotPlaceholders, function (adSlot$$, index) {
        var adSlotConfig = Object.assign({}, dfpConfig.adSlotConfig[adSlot$$.id], {
          id: adSlot$$.id,
          target: adSlot$$.attributes['data-audtarget'].value,
          type: _this.getAdType(adSlot$$.id),
          responsive: adSlot$$.classList.contains('js-dfp-resp-refresh'),
          user: _this.user
        });
        try {
          adSlots.push(new adSlot(adSlotConfig));
        } catch (err) {
          console.log(err);
        }
      });
      return adSlots;
    }

    /**
     * Returns the adType based on the adSlot name.
     * @param adSlotId the adSlot's identifier.
     * @returns {*} enumerated export 'adTypes'
       */

  }, {
    key: 'getAdType',
    value: function getAdType(adSlotId) {
      if (adSlotId.indexOf(adTypes.maavaron) > -1) return adTypes.maavaron;
      if (adSlotId.indexOf(adTypes.popunder) > -1) return adTypes.popunder;
      if (adSlotId.indexOf(adTypes.talkback) > -1) return adTypes.talkback;
      return adTypes.regular;
    }

    /**
     *
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
      adSlot$$.isBlacklisted() === false &&

      //TODO refactor outOfPage adSlot checks
      adSlot$$.isOutOfPage() === false &&
      //  // Not a Talkback adUnit type
      //adSlot.id.indexOf(adTypes.talkback) > -1 === false &&
      //  // Not a Maavaron type
      //adSlot.id.indexOf(adTypes.maavaron) > -1 === false &&
      //  // Not a Popunder type
      //adSlot.id.indexOf(adTypes.popunder) > -1 === false &&

      // Responsive: breakpoint contains ad?
      this.doesBreakpointContainAd(adSlot$$) &&
      // Targeting check (userType vs. slotTargeting)
      this.doesUserTypeMatchBannerTargeting(adSlot$$) &&
      // Impressions Manager check (limits number of impressions per slot)
      this.user.impressionManager.reachedQuota(adSlot$$.id) === false;
    }
  }, {
    key: 'doesUserTypeMatchBannerTargeting',
    value: function doesUserTypeMatchBannerTargeting(adSlot$$) {
      /**
       * Checked whether or not an ad slot should appear for the current user type
       * @param adSlot the slot to check
       * @returns {boolean} true iff the slot should appear for the user type
       */

      var userType = this.user.type;
      var adTarget = adSlot$$.target;

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
  }, {
    key: 'switchedToBreakpoint',
    value: function switchedToBreakpoint(breakpoint) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.adSlots[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var adSlot$$ = _step2.value;

          if (adSlot$$.responsive === true) {}
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
     * Checks whether an adSlot is defined for a given breakpoint (Default: current breakpoint)
     * @returns {boolean} true iff the adSlot is defined for the given breakpoint.
       */

  }, {
    key: 'doesBreakpointContainAd',
    value: function doesBreakpointContainAd(adSlotId) {
      var breakpoint = arguments.length <= 1 || arguments[1] === undefined ? getBreakpoint() : arguments[1];

      return true; //TODO implement
    }
    //
    ///**
    // * Initializes page-level slot definitions for each and every slot that was found on the page.
    // */
    //initAdSlotDefinitions() {
    //  const googletag = window.googletag;
    //  let slots = new Map();
    //  const pubads = googletag.pubads();
    //  for(const adSlot of this.adSlots) {
    //    // Responsive slot
    //    let args = [];
    //    let defineFn = adSlot.isOutOfPage() ? googletag.defineOutOfPageSlot : googletag.defineSlot;
    //    args.push(this.getPath(adSlot));
    //    if(adSlot.isOutOfPage() === false) {
    //      args.push(adSlot.adSizeMapping);
    //    }
    //    args.push(adSlot.id);
    //    let slot = defineFn.apply(defineFn, args);
    //    // Responsive size Mapping
    //    if(adSlot.responsive) {
    //      let responsiveSlotSizeMapping = googletag.sizeMapping();
    //      const breakpoints = globalConfig.breakpointsConfig.breakpoints;
    //      const keys = Object.keys(adSlot.responsiveAdSizeMapping);
    //      for(const key of keys) { //['xxs','xs',...]
    //        responsiveSlotSizeMapping.addSize(
    //          [breakpoints[key],100],//100 is a default height, since it is height agnostic
    //          adSlot.responsiveAdSizeMapping[key]);
    //      }
    //      responsiveSlotSizeMapping = responsiveSlotSizeMapping.build();
    //      slot = slot.defineSizeMapping(responsiveSlotSizeMapping);
    //    }
    //    slot = slot.addService(pubads);
    //    if(adSlot.isOutOfPage() === false) {
    //      slot.setCollapseEmptyDiv(true);
    //    }
    //    slots.set(adSlot.id,slot);
    //  }
    //  return slots;
    //}
    //addSlotRenderedCallback(callback) {
    //  googletag.pubads().addEventListener('slotRenderEnded', callback);
    //}

    //TODO test
    /**
     *
     */

  }, {
    key: 'initSlotRenderedCallback',
    value: function initSlotRenderedCallback() {
      var _this2 = this;

      if (window.googletag && window.googletag.pubadsReady) {
        var pubads = window.googletag.pubads();
        pubads.addEventListener('slotRenderEnded', function (event) {
          var id = event.slot.getAdUnitPath().split('/')[3];
          var isEmpty = event.isEmpty;
          var resolvedSize = event.size;
          if (_this2.adSlots[id]) {
            _this2.adSlots[id].lastResolvedSize = resolvedSize;
            _this2.adSlots[id].lastResolvedWithBreakpoint = getBreakpoint();
          } else {
            //Log an error
          }
        });
      } else {
          throw new Error('googletag api was not ready when \'initSlotRenderedCallback\' was called!');
        }
    }

    /**
     * Initializes page-level targeting params.
     */

  }, {
    key: 'initGoogleTargetingParams',
    value: function initGoogleTargetingParams() {
      if (window.googletag && window.googletag.pubadsReady) {

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
      } else {
        throw new Error('googletag api was not ready when \'initGoogleTargetingParams\' was called!');
      }
    }
  }]);
  return AdManager;
}();

var defaultConfig = dfpConfig || {};

var DFP = function () {
  function DFP(config) {
    babelHelpers.classCallCheck(this, DFP);

    this.config = Object.assign({}, defaultConfig, config);
    this.wasInitialized = false;
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

    /*
     * initializes the 'googletag' global namespace and add the
      * google publish tags library to the page
     */

  }, {
    key: 'initGoogleTag',
    value: function initGoogleTag() {
      var dfpThis = this;
      var promise = new Promise(function (resolve, reject) {
        if (dfpThis.wasInitialized == true) {
          resolve(true);
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
            tag.async = true;
            tag.type = 'text/javascript';
            //var useSSL = 'https:' == document.location.protocol;
            tag.setAttribute('src', '//www.googletagservices.com/tag/js/gpt.js');
            var node = window.document.getElementsByTagName('script')[0];
            tag.onload = function () {
              dfpThis.wasInitialized = true;
              resolve(true);
              dfpThis.resumeInit();
            };
            tag.onerror = function (error) {
              dfpThis.wasInitialized = true;
              reject(error);
            };
            node.parentNode.insertBefore(tag, node);
          })();
        }
      });
      return promise;
    }
  }, {
    key: 'initGoogleGlobalSettings',
    value: function initGoogleGlobalSettings() {
      googletag.pubads().enableAsyncRendering();
      // Enables all GPT services that have been defined for ad slots on the page.
      googletag.enableServices();
    }
  }]);
  return DFP;
}();

// Correct version will be set with the 'rollup-replace plugin'
DFP.version = '0.0.2';

var dfpInstance = new DFP(dfpConfig);

export { dfpInstance };export default DFP;