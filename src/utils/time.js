/**
 * Helper function. Adds N hours to a given date object.
 * @param {Date} date - the date to derive from
 * @param {Number} hours - the amount of hours to add, in whole numbers
 * @throws {SyntaxError} Will throw if the 'date' param is not provided
 * @throws {SyntaxError} Will throw if the 'hours' param is not provided
 * @throws {TypeError} Will throw if the 'hours' param is not a valid integer
 * @returns {Date} date - the new date, derived from adding the given hours
 */
export function addHours(date, hours) {
  if (!date) {
    throw new SyntaxError('addHours called without a required \'date\' parameter!');
  }
  if (!hours) {
    throw new SyntaxError('addHours called without a required \'hours\' parameter!');
  }
  else if (isNaN(parseInt(hours, 10))) {
    throw new TypeError('addHours called with an invalid integer \'hours\' parameter!');
  }
  const result = new Date(date);
  result.setHours(result.getHours() + parseInt(hours, 10));
  return result;
}

/**
 * Helper function. Adds N days to a given date object.
 * @param {Date} date - the date to derive from
 * @param {Integer} days - the amount of days to add
 * @throws {SyntaxError} Will throw if the 'date' param is not provided
 * @throws {SyntaxError} Will throw if the 'days' param is not provided
 * @throws {TypeError} Will throw if the 'hours' param is not a valid integer
 * @returns {Date} date - the new date, derived from adding the given days
 */
export function addDays(date, days) {
  if (!date) {
    throw new SyntaxError('addDays called without a required \'date\' parameter!');
  }
  if (!days) {
    throw new SyntaxError('addDays called without a required \'days\' parameter!');
  }
  else if (isNaN(parseInt(days, 10))) {
    throw new TypeError('addDays called with an invalid integer \'days\' parameter!');
  }
  const result = new Date(date);
  result.setDate(result.getDate() + parseInt(days, 10));
  return result;
}
