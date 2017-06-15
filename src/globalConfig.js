/* global dfpConfig */
import getCookieAsMap, { ssoKey } from './utils/cookieUtils';
// globalConfig for DFP
let dfpBaseConf;
try {
  dfpBaseConf = window.JSON.parse(document.getElementById('dfpConfig').textContent);
}
catch (err) {
  dfpBaseConf = window.dfpConfig;
}
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
   * non articles (sections) will be given a '0' - no articleId value for targeting purposes)
   * @returns {Array.<T>} an array of path names
   */
  get path() {
    let sectionArray = this.articleId && this.articleId !== '0' ?
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
   * Returns a string representation for the name of the site
   * @return {*|string}
   */
  get site() {
    let site;
    if (window.location.hostname.indexOf('haaretz.co.il') > -1) {
      site = 'haaretz';
    }
    else if (window.location.hostname.indexOf('themarker.com') > -1) {
      site = 'themarker';
    }
    else if (window.location.hostname.indexOf('mouse.co.il') > -1) {
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
    const env = {
      dev: 1,
      test: 2,
      prod: 3,
    };
    return window.location.port === '8080' ? env.dev :
      (window.location.hostname.indexOf('pre.haaretz.co.il') > -1
      || window.location.hostname.indexOf('tmtest.themarker.com') > -1
      || window.location.hostname.indexOf('prodmouse.mouse.co.il') > -1) ? env.test :
        (window.location.pathname.indexOf('/cmlink/Haaretz.HomePage') > -1
        || window.location.pathname.indexOf('/cmlink/TheMarker.HomePage') > -1
        || window.location.pathname.indexOf('/cmlink/Mouse.HomePage') > -1)
          ? env.prod : undefined;
  },
  /**
   * Returns the articleIf if on an article page, or null otherwise
   * @returns {string} an articleId string from the pathname, or 0 if not found
   */
  get articleId() {
    const articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
    let articleId = '0';
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
  get isWriterAlerts() {
    return (location.search.indexOf('writerAlerts=true') > -1);
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
      // Override in VM from backend to control this toggle.
      let breakpoints;
      switch (dfpConfig.googleGlobalSettings.breakpointType) {
        case 'type1': breakpoints = this.breakpoints1; break;
        case 'type2': breakpoints = this.breakpoints2; break;
        case 'type3': breakpoints = this.breakpoints3; break;
        case 'type4': breakpoints = this.breakpoints4; break;
        default: breakpoints = this.breakpoints1;
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
    // Type 3
    breakpoints3: {
      xxs: 100,
      xs: 480,
      s: 600,
      m: 768,
      l: 1024,
      xl: 1280,
      xxl: 1900,
    },
    // Type 4
    breakpoints4: {
      xxs: 600,
      xs: 768,
      s: 1024,
      m: 1280,
      l: 1900,
      xl: 1900,
      xxl: 1900,
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
  googleGlobalSettings: {
    enableSingleRequest: true,
    enableAsyncRendering: true,
    refreshIntervalTime: 1000,
    breakpointType: 'type1',
  },
  sso: ssoKey,

}, dfpBaseConf);

export default dfpConfig;
