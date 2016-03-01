import { ssoKey } from '../src/utils/cookieUtils';
//globalConfig for DFP
const dfpConfig = {
  get isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(window.navigator.userAgent || ""));
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
    const articleIdMatch = /\d\.\d+/g.exec(window.location.pathname);
    let articleId = null;
    if(articleIdMatch) {
      articleId = articleIdMatch.pop(); //Converts ["1.23145"] to "1.23145"
    }
    return articleId;
  },
  utm : {
    utm_content : '',
    utm_source : '',
    utm_medium : '',
    utm_campaign : '',
  },
  adSlotConfig: {

  },
  adManagerConfig : {

  },
  userConfig: {
    age: "none",
    gender: "none",
  },
  sso: ssoKey,

};

export default dfpConfig;
