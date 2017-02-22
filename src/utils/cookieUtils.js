/**
 * Htz-cookie-util
 * @module htzCookieUtil
 * @author Elia Grady elia.grady@haaretz.co.il
 * @license MIT
 */

/**
 * Translates Key-Value string into a convenient map.
 * @param {String} string String in format of "key<operator>value<separator>....."
 * @param {object} options object for overriding defaults:
 * options.separator is a String or regExp that separates between each key value pairs
 * (default is ';'). options.operator is a String or regExp that separates between each key
 * and value within a pair (default is '=').
 * @returns {object} a map object, with key-value mapping according to the passed configuration.
 */
function stringToMap(string,
  { separator = ';', operator = '=' } = {}) {
  const map = {};
  const itemsArr = string.split(separator);
  itemsArr.forEach(element => {
    if (typeof element === 'string') {
      const keyValue = element.split(operator);
      if (keyValue.length === 2) {
        try {
          map[keyValue[0]] = decodeURIComponent(keyValue[1]);
        }
        catch (e) {
          // Do nothing, malformed URI
        }
      }
    }
  });
  return map;
}
export const ssoKey = window.location.hostname.indexOf('haaretz.com') > -1 ? 'engsso' : 'tmsso';

// Translates Cookie string into a convenient map.
export default function getCookieAsMap() {
  const map = stringToMap(document.cookie, { separator: /;\s?/ });
  if (typeof map.tmsso === 'string') {
    map.tmsso = stringToMap(map.tmsso, { separator: ':' });
  }
  if (typeof map.engsso === 'string') {
    map.engsso = stringToMap(map.engsso, { separator: ':' });
  }
  return map;
}
