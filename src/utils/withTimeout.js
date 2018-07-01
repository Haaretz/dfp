/**
 * A wrapper to a promise that limits it's resolution time
 * @export
 * @param {any} promise the promise to be resolved
 * @param {number} [timeout=5000] an optional timeout, in milliseconds
 * @param {string} [msgOnTimeout='operation timed out!'] an optional on timeout rejection message
 * @returns {promise} a promise that either resolves in the timeframe, or rejects on timeout.
 */
export default function withTimeout(
  promise,
  timeout = 5000,
  msgOnTimeout = 'operation timed out!',
) {
  const timer = new Promise((resolve, reject) => setTimeout(() => {
    reject(new Error(msgOnTimeout));
  }, timeout));
  return Promise.race([promise, timer]);
}
