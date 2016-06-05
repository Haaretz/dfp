/* globals googletag */
import AdManager  from '../src/objects/adManager';
import globalConfig from './globalConfig';
const defaultConfig = globalConfig || {};
import { getBreakpoint, getBreakpointName, debounce }  from '../src/utils/breakpoints';
const googletagInitTimeout = 10000;
const resizeTimeout = 250;

export default class DFP {

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
    try{
      this.adManager = new AdManager(this.config);
    }
    catch (err) {
      console.log(err);
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
    return new Promise((resolve,reject) => {
      if (dfpThis.wasInitialized == true || (window.googletag && window.googletag.apiReady)) {
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
        //load google tag services JavaScript
        (() => {
          const tag = window.document.createElement('script');
          tag.async = false;
          tag.type = 'text/javascript';
          //var useSSL = 'https:' == document.location.protocol;
          tag.setAttribute('src','//www.googletagservices.com/tag/js/gpt.js');
          var node = window.document.getElementsByTagName('script')[0];
          tag.onload = (() => {
            dfpThis.wasInitialized = true;
            dfpThis.resumeInit();
            resolve(this.isGoogleTagReady);
          });
          tag.onerror = ((error) => {
            dfpThis.wasInitialized = false;
            reject(error);
          });
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
    let promise = new Promise((resolve,reject) => {
      googletag.cmd.push(() => {
        resolve(this);
      });
      setTimeout(() => {
        if(!(googletag && googletag.apiReady === true)) {
          reject(new Error("googletag failed to initialize on the page!"));
        }
      },googletagInitTimeout);
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
      if(dfpThis.breakpoint != currentBreakpoint) {
        dfpThis.breakpoint = currentBreakpoint;
        if(dfpThis.adManager) {
          dfpThis.adManager.refreshAllSlots();
        }
        else {
          throw new Error("initWindowResizeListener error - adManager instance is not available")
        }
      }
    }
    const debouncedFunction = debounce(onResize,resizeTimeout);
    window.onresize = debouncedFunction;
  }
}
