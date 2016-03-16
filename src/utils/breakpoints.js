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
export function debounce(func, wait = 100, immediate) {
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

/**
 * Returns the current breakpoint that is closest to the window's width
 * @returns {number} the break that the current width represents
 */
export function getBreakpoint() {
  let breakpoint = breakpoints.xxl;
  let windowWidth = window.innerWidth;
  if(windowWidth < breakpoints.xl) { breakpoint = breakpoints.xl }
  if(windowWidth < breakpoints.l) { breakpoint = breakpoints.l }
  if(windowWidth < breakpoints.m) { breakpoint = breakpoints.m } else { return breakpoint}
  if(windowWidth < breakpoints.s) { breakpoint = breakpoints.s }
  if(windowWidth < breakpoints.xs) { breakpoint = breakpoints.xs }
  if(windowWidth < breakpoints.xxs) { breakpoint = breakpoints.xxs }
  return breakpoint
}
/**
 * Returns the current breakpoint that is closest to the window's width
 * @returns {string} the breakpoint label that the current width represents
 */
export function getBreakpointName(breakpoint) {
  let resultBreakpoint = 'xxl';
  let windowWidth = breakpoint || window.innerWidth;
  if(windowWidth < breakpoints.xl) { resultBreakpoint = 'xl' }
  if(windowWidth < breakpoints.l) { resultBreakpoint = 'l' }
  if(windowWidth < breakpoints.m) { resultBreakpoint = 'm' }
  if(windowWidth < breakpoints.s) { resultBreakpoint = 's' }
  if(windowWidth < breakpoints.xs) { resultBreakpoint = 'xs' }
  if(windowWidth < breakpoints.xxs) { resultBreakpoint = 'xxs' }
  return resultBreakpoint
}

