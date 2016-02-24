/**
 * Htz-cookie-util
 * @module htzCookieUtil
 * @author Elia Grady elia.grady@haaretz.co.il
 * @license MIT
 */

/**
 * Translates Key-Value string into a convenient map.
 * @param {string} string String in format of "key<operator>value<separator>....."
 * @param {object} options object for overriding defaults:
 * options.separator is a String or regExp that separates between each key value pairs
 * (default is ';'). options.operator is a String or regExp that separates between each key
 * and value within a pair (default is '=').
 * @returns {object} a map object, with key-value mapping according to the passed configuration.
 */
function stringToMap(string,
  { separator: separator = ';', operator: operator = '=' } = {}) {
  const map = {};
  const itemsArr = string.split(separator);
  for (const key in itemsArr) {
    if (itemsArr.hasOwnProperty(key)) {
      const keyValue = itemsArr[key].split(operator);
      if(keyValue.length == 2 ) { //Only operate on valid splits
        map[keyValue[0]] = decodeURIComponent(keyValue[1]);
      }
    }
  }
  return map;
}
export const ssoKey = window.location.hostname.indexOf('haaretz.com') > -1 ? 'engsso' : 'tmsso';

// Translates Cookie string into a convenient map.
export default function getCookieAsMap(ssoKeyOverride) {
  const ssoKey = ssoKeyOverride || ssoKey;
  const map = stringToMap(document.cookie, { separator: /;\s?/ });
  if (map[ssoKey]) {
    map[ssoKey] = stringToMap(map[ssoKey], { separator: ':' });
  }
  return map;
}

