import DFP from '../index';
import globalConfig from '../globalConfig';

const breakpoints = globalConfig.breakpointsConfig.breakpoints;

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * @param func the function to run
 * @param wait the timeout period to avoid running the function
 * @param immediate leading edge modifier
 * @returns {Function} the debounced function
 * //TODO translate to ES6 format - in progress...
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}


function getBreakpoint() {
  let breakpoint = breakpoints.xl;
  let windowWidth = window.innerWidth;
  switch (true) {
    //case windowWidth < breakpoints.xl: breakpoint = breakpoints.xl; //Default
    case windowWidth < breakpoints.l: breakpoint = breakpoints.l;
    case windowWidth < breakpoints.m: breakpoint = breakpoints.m;
    case windowWidth < breakpoints.s: breakpoint = breakpoints.s;
  }
  return breakpoint
}
function breakpointChanged() {
  this.currentBreakpoint = this.getBreakpoint();
  dfp.adManager.switchedToBreakpoint(this.currentBreakpoint);
}

