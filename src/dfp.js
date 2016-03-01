/* globals googletag */
import AdManager  from '../src/objects/adManager';
import globalConfig from './globalConfig';
const defaultConfig = globalConfig || {};
export default class DFP {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.wasInitialized = false;
    this.adManager = new AdManager(config.adManagerConfig);
  }

  /*
   * initializes the 'googletag' global namespace and add the
    * google publish tags library to the page
   */
  initGoogleTag() {
    let promise = new Promise((resolve,reject) => {
      if (this.wasInitialized == true) {
        resolve();
      }
      else {
        // set up a place holder for the gpt code downloaded from google
        window.googletag = window.googletag || {};

        // this is a command queue used by GPT any methods added to it will be
        // executed when GPT code is available, if GPT is already available they
        // will be executed immediately
        window.googletag.cmd = window.googletag.cmd || [];
        //load google tag services JavaScript
        (function() {
          var tag = document.createElement('script');
          tag.async = true;
          tag.type = 'text/javascript';
          //var useSSL = 'https:' == document.location.protocol;
          tag.setAttribute('src','//www.googletagservices.com/tag/js/gpt.js');
          var node = document.getElementsByTagName('script')[0];
          node.parentNode.insertBefore(tag, node);
          tag.onload = () => {
            this.wasInitialized = true;
            resolve();
          };
          tag.onerror = (error) => {
            this.wasInitialized = true;
            reject(error);
          };
        })();
      }
    });
    return promise;
    }
  initGoogleGlobalSettings() {
    googletag.pubads().enableAsyncRendering();
    googletag.enableServices();
  }
}
