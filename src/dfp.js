/* globals googletag */
class DFP {

  constructor(config) {
    this.config = config;
    this.wasInitialized = false;
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
        //load googletagservices JS
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
}


export default DFP;
