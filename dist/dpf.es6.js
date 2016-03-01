/*!
 * DFP v0.0.2
 * (c) 2016 Elia Grady
 * Released under the MIT License.
 */
var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

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
function getCookieAsMap(ssoKeyOverride) {
  var ssoKey = ssoKeyOverride || ssoKey;
  var map = stringToMap(document.cookie, { separator: /;\s?/ });
  //console.log(map[ssoKey])
  //console.log("map[ssoKey]:",typeof map[ssoKey]);
  if (typeof map[ssoKey] === 'string') {
    map[ssoKey] = stringToMap(map[ssoKey], { separator: ':' });
  }
  console.log("map[ssoKey]:", babelHelpers.typeof(map[ssoKey]));
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

var userTypes$1 = {
  payer: 'payer',
  registered: 'registered',
  anonymous: 'anonymous'
};

var User = function () {
  function User() {
    babelHelpers.classCallCheck(this, User);

    this.type = this.getUserType();
    this.impressionManager = this.initImpressionMap();
  }

  babelHelpers.createClass(User, [{
    key: 'getUserType',
    value: function getUserType() {
      var cookieMap = getCookieAsMap();
      if (cookieMap && cookieMap[ssoKey]) {
        var payerProp = ssoKey.indexOf("haaretz.com") > -1 ? 'HdcPusr' : 'HtzPusr';
        return cookieMap[payerProp] ? userTypes$1.payer : userTypes$1.registered;
      } else {
        return userTypes$1.anonymous;
      }
    }
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
    return window.isHomepage ? 'homepage' : 'section';
  }
};

var AdManager = function () {
  function AdManager(config) {
    babelHelpers.classCallCheck(this, AdManager);

    this.config = Object.assign({}, defaultConfig$1, config);
    this.referrerBlacklist = this.initReferrerBlacklist();
    this.user = new User();
    this.conflictResolver = new ConflictResolver();
    this.adSlots = this.initAdSlots();
    this.adSlotDefinitions = this.initAdSlotDefinitions();
  }

  babelHelpers.createClass(AdManager, [{
    key: 'initAdSlots',
    value: function initAdSlots() {
      var adSlots = [];
      var adSlotPlaceholders = document.getElementsByClassName('js-dfp-ad');
      Array.prototype.forEach.call(adSlotPlaceholders, function (adSlot, index) {
        adSlots.push({
          id: adSlot.id,
          target: adSlot.attributes['data-audtarget'].value,
          responsive: adSlot.classList.contains('js-dfp-resp-refresh')
        });
      });
      return [];
    }
  }, {
    key: 'initReferrerBlacklist',
    value: function initReferrerBlacklist() {
      var list = [];
      list.push('paid.outbrain.com'); //TODO move to config
      return list;
    }
  }, {
    key: 'shouldSendRequestToDfp',
    value: function shouldSendRequestToDfp(adSlot) {
      // TODO: go over each one of the following and mark as checked once implemented
      // Conflict management check
      return this.coflictResolver.isBlocked(adSlot.id) === false &&
      // Valid Referrer check
      // Not in referrer Blacklist
      // Talkback adUnit type
      // Maavaron type
      this.isMaavaron(adSlot) === false &&
      // Popunder type
      // Responsive: breakpoint contains ad?
      this.doesBreakpointContainAd() &&
      // Targeting check (userType vs. slotTargeting)
      this.doesUserTypeMatchBannerTargeting(adSlot) &&
      // Impressions Manager check (limits number of impressions per slot)
      this.user.impressionManager.reachedQuota(adSlot.id) === false;
    }
  }, {
    key: 'doesUserTypeMatchBannerTargeting',
    value: function doesUserTypeMatchBannerTargeting(adSlot) {
      /**
       * Checked whether or not an ad slot should appear for the current user type
       * @param adSlot the slot to check
       * @returns {boolean} true iff the slot should appear for the user type
       */

      var userType = this.user.type;
      var adTarget = adSlot.target;

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
    key: 'isMaavaron',
    value: function isMaavaron(adSlot) {
      return adSlot.id.indexOf(adTypes.maavaron) > -1;
    }
  }, {
    key: 'switchedToBreakpoint',
    value: function switchedToBreakpoint(breakpoint) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.adSlots[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var adSlot = _step.value;

          if (adSlot.responsive === true) {}
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
    key: 'doesBreakpointContainAd',
    value: function doesBreakpointContainAd() {
      return true; //TODO implement
    }
  }, {
    key: 'initAdSlotDefinitions',
    value: function initAdSlotDefinitions() {
      //for each adSlot
      //adSlot mapping config
      //let slotMapping = googletag.sizeMapping().addSize([width, height],[width,
      // height])(...).build();
      //const slotDefinition = googletag.defineSlot(slotPath,[[defaultWidth,
      // defaultHeight]],adSlot.id).defineSizeMapping(slotMapping).addService(googletag.pubads()).setCollapseEmptyDiv(true);
      //this.adSlotDefinitions[adSlot.id] = slotDefinition;
    }
  }, {
    key: 'addSlotRenderedCallback',
    value: function addSlotRenderedCallback(callback) {
      googletag.pubads().addEventListener('slotRenderEnded', callback);
    }
  }, {
    key: 'initGoogleTargetingParams',
    value: function initGoogleTargetingParams() {
      function initGstatCampign() {
        //TODO change
        if (!!localStorage.GstatCampaign) {
          var GstatCampaign = JSON.parse(localStorage.GstatCampaign);
          var CampaignNumber = GstatCampaign['CampaignNumber'];
          return CampaignNumber;
        }
      }
      //targeting params //TODO refactor
      if (typeof dfpUserType != "undefined") googletag.pubads().setTargeting('UserType', [dfpUserType]);
      if (typeof dfpUrAe != "undefined") googletag.pubads().setTargeting('age', [dfpUrAe]);
      if (typeof dfpStg != "undefined") googletag.pubads().setTargeting('stg', [dfpStg]);
      if (typeof dfpUrGdr != "undefined") googletag.pubads().setTargeting('urgdr', [dfpUrGdr]);
      if (typeof dfpArticleId != "undefined") googletag.pubads().setTargeting('articleId', [dfpArticleId]);
      if (typeof CampaignNumber != "undefined" && CampaignNumber != -1) googletag.pubads().setTargeting('gstat_campaign_id', [CampaignNumber]);
      if (typeof utm_content != "undefined" && utm_content != null) googletag.pubads().setTargeting('utm_content', [utm_content]);
      if (typeof utm_source != "undefined" && utm_source != null) googletag.pubads().setTargeting('utm_source', [utm_source]);
      if (typeof utm_medium != "undefined" && utm_medium != null) googletag.pubads().setTargeting('utm_medium', [utm_medium]);
      if (typeof utm_campaign != "undefined" && utm_campaign != null) googletag.pubads().setTargeting('utm_campaign', [utm_campaign]);
    }
  }]);
  return AdManager;
}();

//globalConfig for DFP
var dfpConfig = {
  get isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent || "")
    );
  },
  /**
   * Returns a homepage
   * @returns {boolean}
     */
  get isHomepage() {
    return window.location.pathname === "/";
  },
  /**
   * returns the domain the page was loaded to. i.e: 'haaretz.co.il', 'haaretz.com'
   * @returns {string} the domain name from the windows's location hostname property
     */
  get domain() {
    return window.location.hostname.replace(/([\w|\d]+.)/, "");
  },
  /**
   * Returns the articleIf if on an article page, or null otherwise
   * @returns {string} an articleId string from the pathname, or null if none is found
   */
  get articleId() {
    var articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
    var articleId = null;
    if (articleIdMatch) {
      articleId = articleIdMatch.pop(); //Converts ["1.23145"] to "1.23145"
    }
    return articleId;
  },
  utm: {
    utm_content: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: ''
  },
  adSlotConfig: {},
  adManagerConfig: {},
  userConfig: {
    age: "none",
    gender: "none"
  },
  sso: ssoKey

};

var defaultConfig = dfpConfig || {};

var DFP = function () {
  function DFP(config) {
    babelHelpers.classCallCheck(this, DFP);

    this.config = Object.assign({}, defaultConfig, config);
    this.wasInitialized = false;
    this.adManager = new AdManager(config.adManagerConfig);
  }

  /*
   * initializes the 'googletag' global namespace and add the
    * google publish tags library to the page
   */


  babelHelpers.createClass(DFP, [{
    key: 'initGoogleTag',
    value: function initGoogleTag() {
      var _this = this;

      var promise = new Promise(function (resolve, reject) {
        if (_this.wasInitialized == true) {
          resolve();
        } else {
          // set up a place holder for the gpt code downloaded from google
          window.googletag = window.googletag || {};

          // this is a command queue used by GPT any methods added to it will be
          // executed when GPT code is available, if GPT is already available they
          // will be executed immediately
          window.googletag.cmd = window.googletag.cmd || [];
          //load google tag services JavaScript
          (function () {
            var _this2 = this;

            var tag = document.createElement('script');
            tag.async = true;
            tag.type = 'text/javascript';
            //var useSSL = 'https:' == document.location.protocol;
            tag.setAttribute('src', '//www.googletagservices.com/tag/js/gpt.js');
            var node = document.getElementsByTagName('script')[0];
            node.parentNode.insertBefore(tag, node);
            tag.onload = function () {
              _this2.wasInitialized = true;
              resolve();
            };
            tag.onerror = function (error) {
              _this2.wasInitialized = true;
              reject(error);
            };
          })();
        }
      });
      return promise;
    }
  }, {
    key: 'initGoogleGlobalSettings',
    value: function initGoogleGlobalSettings() {
      googletag.pubads().enableAsyncRendering();
      googletag.enableServices();
    }
  }]);
  return DFP;
}();

// Correct version will be set with the 'rollup-replace plugin'
DFP.version = '0.0.2';

export default DFP;