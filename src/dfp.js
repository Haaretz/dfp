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

  //get wasInitialized() {
  //  return (window.googletag && window.googletag.cmd);
  //}

  /*
   * initializes the 'googletag' global namespace and add the
   * google publish tags library to the page
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
          tag.async = true;
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

  initWindowResizeListener() {
    function onResize() {
      const currentBreakpoint = getBreakpoint();
      if(this.breakpoint != currentBreakpoint) {
        console.log(`moved to breakpoint ${getBreakpointName(currentBreakpoint)}`+
        ` from ${getBreakpointName(this.breakpoint)} - refreshing slots`);
        this.breakpoint = currentBreakpoint;
        if(this.adManager) {
          this.adManager.refreshAllSlots();
        }
      }
    }
    const debouncedFunction = debounce(onResize,resizeTimeout);
    window.onresize = debouncedFunction;
  }
}
