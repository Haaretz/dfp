/* globals googletag */
import AdManager  from '../src/objects/adManager';
import globalConfig from './globalConfig';
const defaultConfig = globalConfig || {};
export default class DFP {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.wasInitialized = false;
  }

  /**
   * This part of the object's construction is dependent on the call to 'init'
   */
  resumeInit() {
    let adManager;
    try{
      adManager = new AdManager(this.config);
      this.adManager = adManager;
    }
    catch (err) {
      console.log(err);
    }
    return this.adManager;
  }

  //get wasInitialized() {
  //  return (window.googletag && window.googletag.cmd);
  //}

  /*
   * initializes the 'googletag' global namespace and add the
    * google publish tags library to the page
   */
  initGoogleTag() {
    const dfpThis = this;
    let promise = new Promise((resolve,reject) => {
      if (dfpThis.wasInitialized == true || (window.googletag && window.googletag.apiReady)) {
        resolve(true);
      }
      else {
        // set up a place holder for the gpt code downloaded from google
        window.googletag = window.googletag || {};

        // this is a command queue used by GPT any methods added to it will be
        // executed when GPT code is available, if GPT is already available they
        // will be executed immediately
        window.googletag.cmd = window.googletag.cmd || [];
        //load google tag services JavaScript
        (() => {
          const tag = window.document.createElement('script');
          tag.async = true;
          tag.type = 'text/javascript';
          //var useSSL = 'https:' == document.location.protocol;
          tag.setAttribute('src','//www.googletagservices.com/tag/js/gpt.js');
          var node = window.document.getElementsByTagName('script')[0];
          tag.onload = (() => {
            dfpThis.wasInitialized = true;
            resolve(true);
            dfpThis.resumeInit();
          });
          tag.onerror = ((error) => {
            dfpThis.wasInitialized = true;
            reject(error);
          });
          node.parentNode.insertBefore(tag, node);
        })();
      }
    });
    return promise;
    }
  initGoogleGlobalSettings() {
    googletag.pubads().enableAsyncRendering();
    // Enables all GPT services that have been defined for ad slots on the page.
    googletag.enableServices();
  }
}
