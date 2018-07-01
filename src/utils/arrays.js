/**
 * Checks whether two arrays are equal
 * @param {Array} a - the first array to check
 * @param {Array} b - the second array to check
 * @returns {Boolean} true iff both a and b are arrays, with equal values
 */
export function arraysEqual(a, b) {
  if (!a || !b) return false;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) { // eslint-disable-line no-plusplus
    if (Array.isArray(a[i]) && Array.isArray(b[i])) {
      if (!arraysEqual(a[i], b[i])) return false;
    }
    else if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
export default arraysEqual;
