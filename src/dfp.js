/* globals googletag */
import AdManager from '../src/objects/adManager';
import globalConfig from './globalConfig';
import { getBreakpoint, debounce } from '../src/utils/breakpoints';

const defaultConfig = globalConfig || {};
const resizeTimeout = 250;

export default class DFP {

  constructor(config) {
    this.config = Object.assign({}, defaultConfig, config);
    this.wasInitialized = false;
    this.initStarted = false;
    this.breakpoint = getBreakpoint();
    this.initWindowResizeListener();
  }

  /**
   * This part of the object's construction is dependent on the call to 'init'
   */
  resumeInit() {
    try {
      this.adManager = this.adManager || new AdManager(this.config);
    }
    catch (err) {
      console.error(err); // eslint-disable-line no-console
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
    return new Promise((resolve, reject) => {
      if (dfpThis.initStarted === true) {
        googletag.cmd.push(() => {
          dfpThis.wasInitialized = true;
          resolve(dfpThis);
        });
      }
      else {
        dfpThis.initStarted = true;
        // set up a place holder for the gpt code downloaded from google
        window.googletag = window.googletag || {};

        // this is a command queue used by GPT any methods added to it will be
        // executed when GPT code is available, if GPT is already available they
        // will be executed immediately
        window.googletag.cmd = window.googletag.cmd || [];
        // load google tag services JavaScript
        (() => {
          const tag = window.document.createElement('script');
          tag.async = true;
          tag.type = 'text/javascript';
          // Supports both https and http
          tag.setAttribute('src', '//www.googletagservices.com/tag/js/gpt.js');
          const node = window.document.getElementsByTagName('script')[0];
          tag.addEventListener('load', () => {
            dfpThis.resumeInit();
            googletag.cmd.push(() => {
              dfpThis.wasInitialized = true;
              resolve(this);
            });
          });
          tag.addEventListener('error', (error) => {
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
  isGoogleTagReady() {
    if (this.wasInitialized === true || (window.googletag && window.googletag.apiReady)) {
      this.wasInitialized = true;
    }
    return this.wasInitialized;
  }

  /**
   * Initializes the window resize listener to support responsive ad refreshes
   */
  initWindowResizeListener() {
    const dfpThis = this;
    function onResize() {
      const currentBreakpoint = getBreakpoint();
      if (dfpThis.breakpoint !== currentBreakpoint) {
        dfpThis.breakpoint = currentBreakpoint;
        if (dfpThis.adManager) {
          dfpThis.adManager.refreshAllSlots();
        }
        else {
          throw new Error('initWindowResizeListener error - adManager instance is not available');
        }
      }
    }
    const debouncedFunction = debounce(onResize, resizeTimeout);
    window.onresize = debouncedFunction;
  }
}
