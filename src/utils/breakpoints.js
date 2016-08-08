import globalConfig from '../globalConfig';

const breakpoints = globalConfig.breakpointsConfig.breakpoints;

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 * @param {function} func - the function to run
 * @param {Number} wait - the timeout period to avoid running the function
 * @param {Boolean} immediate - leading edge modifier
 * @returns {function} the debounced function
 * //TODO translate to ES6 format or import lodash debounce instead
 */
export function debounce(func, wait = 100, immediate) {
  let timeout;
  return function debounced() {
    const context = this;
    const args = arguments;// eslint-disable-line prefer-rest-params
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

/**
 * Returns the current breakpoint that is closest to the window's width
 * @returns {number} the break that the current width represents
 */
export function getBreakpoint() {
  let breakpoint;
  const windowWidth = window.innerWidth;
  switch (windowWidth) {
    case windowWidth < breakpoints.xs: breakpoint = breakpoints.xxs; break;
    case windowWidth < breakpoints.s: breakpoint = breakpoints.xs; break;
    case windowWidth < breakpoints.m: breakpoint = breakpoints.s; break;
    case windowWidth < breakpoints.l: breakpoint = breakpoints.m; break;
    case windowWidth < breakpoints.xl: breakpoint = breakpoints.l; break;
    case windowWidth < breakpoints.xxl: breakpoint = breakpoints.xl; break;
    default: breakpoint = breakpoints.xxl;
  }
  return breakpoint;
}
/**
 * Returns the current breakpoint that is closest to the window's width
 * @param {string} breakpoint - the breakpoint label enumerator that the current width represents
 * @returns {string} breakpoint - the breakpoint label that the current width represents,
 * as a string
 */
export function getBreakpointName(breakpoint) {
  let resultBreakpoint;
  const windowWidth = breakpoint || window.innerWidth;
  switch (windowWidth) {
    case windowWidth < breakpoints.xs: resultBreakpoint = 'xxs'; break;
    case windowWidth < breakpoints.s: resultBreakpoint = 'xs'; break;
    case windowWidth < breakpoints.m: resultBreakpoint = 's'; break;
    case windowWidth < breakpoints.l: resultBreakpoint = 'm'; break;
    case windowWidth < breakpoints.xl: resultBreakpoint = 'l'; break;
    case windowWidth < breakpoints.xxl: resultBreakpoint = 'xl'; break;
    default: resultBreakpoint = 'xxl';
  }
  return resultBreakpoint;
}
