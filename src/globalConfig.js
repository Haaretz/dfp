/*global dfpBaseConf*/
import { ssoKey } from '../src/utils/cookieUtils';
//globalConfig for DFP
const dfpConfig = Object.assign({
  get referrer() {
    return document.referrer ? document.referrer : "";
  },
  get isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(window.navigator.userAgent || ""));
  },
  /**
   * Returns true iff the loaded page is the homepage (no inner path)
   * @returns {boolean}
   */
  get isHomepage() {
    return window.location.pathname === "/" || this.environment === 3; //'prod'
  },
  get department() {
    return this.isHomepage ? '_homepage' : '_section'
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
    const sectionArray = this.articleId ?
      window.location.pathname.split('/').slice(1,-1) :
      window.location.pathname.split('/').slice(1);
    return sectionArray
      .map(section => `.${section}`)
      .map((section, index, arr) => arr.slice(0,index+1)
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
        || window.location.pathname.indexOf('/cmlink/TheMarker.HomePage') > -1) ? env.prod : undefined;
  },
  /**
   * Returns the articleIf if on an article page, or null otherwise
   * @returns {string} an articleId string from the pathname, or null if none is found
   */
  get articleId() {
    const articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
    let articleId;
    if(articleIdMatch) {
      articleId = articleIdMatch.pop(); //Converts ["1.23145"] to "1.23145"
    }
    return articleId;
  },
  utm_ : {
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
      let results = RegExp(`(${key})(=)([^&"]+)`).exec(window.location.search);
      return results && results[3] ? results[3] : undefined;
    },
  },
  get adBlockRemoved() {
    let adBlockRemoved;
    try {
      adBlockRemoved = localStorage.getItem('adblock_removed') ?
        true : false;
    }
    catch (err) {
      adblock_removed = false;
    }
    return adBlockRemoved;
  },
  get gStatCampaignNumber() {
    let gstatCampaign;
    try {
      gstatCampaign = localStorage.getItem('GstatCampaign') ?
        JSON.parse(localStorage.getItem('GstatCampaign')) : undefined;
    }
    catch (err) {
      //In case of thrown 'SecurityError' or 'QuotaExceededError', the variable should be undefined
      gstatCampaign = undefined;
    }
    return gstatCampaign ? gstatCampaign['CampaignNumber'] : undefined;
  },
  adSlotConfig: {
    "haaretz.co.il.example.slot" : {
      id: "slotId",
      //path : "/network/base/slotId/slotId_subsection", Will be calculated from AdManager
      responsive: true,
      adSizeMapping: [['width1','height1'],...['widthN','heightN']],
      responsiveAdSizeMapping : {
        xxs: [['width1','height1'],...['widthN','heightN'],],
        xs: [['width1','height1'],...['widthN','heightN'],],
        s: [['width1','height1'],...['widthN','heightN'],],
        m: [['width1','height1'],...['widthN','heightN'],],
        l: [['width1','height1'],...['widthN','heightN'],],
        xl: [['width1','height1'],...['widthN','heightN'],],
        xxl: [['width1','height1'],...['widthN','heightN'],],
      },
      blacklistReferrers: "comma, delimited, blacklisted, referrer, list",
      whitelistReferrers: "comma, delimited, referrer, list",
    }
  },
  adManagerConfig : {
    network: '9401',
    adUnitBase: 'haaretz.co.il_Web',
  },
  breakpointsConfig : {
    get breakpoints() {
      const isType1 = true; //Override in VM from backend to control this toggle.
      return isType1 ? this.breakpoints1 : this.breakpoints2;
    },
    // Type 1
    breakpoints1 : {
      xxs: 600,
      xs: 761,
      s: 993,
      m: 1009,
      l: 1291,
      xl: 1600,
      xxl: 1900,
    },
    // Type 2
    breakpoints2 : {
      xxs: 600,
      xs: 1000,
      s: 1150,
      m: 1281,
      l: 1600,
      xl: 1920,
      xxl: 1920,
    }
  },
  userConfig: {
    type : undefined,
    age: undefined,
    gender: undefined,
  },
  conflictManagementConfig: {
    "blocking.ad.unit.name": [
      {
        onsize: "1280x200,970x250,3x3",
        avoid: "blocked.ad.unit.name"
      },
      {
        onsize: "1280x200,970x250,3x3",
        avoid: "blocked.ad.unit.name"
      }
    ]
  },
  impressionManagerConfig: {
    "ad.unit.name": {
      target: 'all|section|homepage',
      frequency: '$1/$2(day|hour)',
      exposed: 0,
      expires: (new Date).getTime()
    }
  },
  sso: ssoKey,

},window.dfpConfig);

export default dfpConfig;
