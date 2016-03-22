/**
 * Checks whether two arrays are equal
 * @param a the first array to check
 * @param b the second array to check
 * @returns {boolean} true iff both a and b are arrays, with equal values
 */
export function arraysEqual(a, b) {
  if (!a || !b) return false;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a === b) return true;
  if (a.length != b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
