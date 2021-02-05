const { exists, isFunc } = require('@keg-hub/jsutils')

// Default command timeout per command, can be overwritten by each command array
const timeoutAmount = 15000

/**
 * Creates a timeout wrapped in a promise and calls Promise.race
 * <br/>Allows setting a timeout for CLI commands
 * @param {Object} promise - Keg-CLI currently command being run
 * @param {string} cmd - Keg-CLI command as a string
 * @param {number} amount - Timeout amount for the command to finish running
 *
 * @returns {Object} response - Response from the Keg-CLI command or timeout response
 */
const promiseTimeout = (promise, cmd, amount) => {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timed out`))
    }, exists(amount) ? amount : timeoutAmount)
  })

  return Promise.race([promise, timeoutPromise])
    // If error is throw, catch and return the message
    .catch(err => ({ cmd, exitCode: 1, response: err.message }))
    // Use finally, to clear the timeout, and return what ever the response is
    .finally(response => {
      clearTimeout(timeoutId)
      return response
    })
}

module.exports = {
  promiseTimeout
}