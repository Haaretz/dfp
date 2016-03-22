/**
 * Helper function. Adds N hours to a given date object.
 * @param date the date to derive from
 * @param hours the amount of hours to add, in whole numbers
 * @returns {Date} the new date, derived from adding the given hours
 */
export function addHours(date, hours) {
  if(!date) {
    throw new SyntaxError(`addHours called without a required 'date' parameter!`);
  }
  if(!hours) {
    throw new SyntaxError(`addHours called without a required 'hours' parameter!`);
  }
  else if(isNaN(parseInt(hours))) {
    throw new TypeError(`addHours called with an invalid integer 'hours' parameter!`);
  }
  const result = new Date(date);
  result.setHours(result.getHours() + parseInt(hours));
  return result;
}

/**
 * Helper function. Adds N days to a given date object.
 * @param date the date to derive from
 * @param hours the amount of days to add, in whole numbers
 * @returns {Date} the new date, derived from adding the given days
 */
export function addDays(date, days) {
  if(!date) {
    throw new SyntaxError(`addDays called without a required 'date' parameter!`);
  }
  if(!days) {
    throw new SyntaxError(`addDays called without a required 'hours' parameter!`);
  }
  else if(isNaN(parseInt(days))) {
    throw new TypeError(`addDays called with an invalid integer 'hours' parameter!`);
  }
  const result = new Date(date);
  result.setDate(result.getDate() + parseInt(days));
  return result;
}
