const { get, isStr } = require('@keg-hub/jsutils')
const { Logger } = require('KegLog')
const { throwTaskFailed } = require('./throwTaskFailed')

/**
 * Error helper to log and throw when docker compose command fails
 * @function
 * @param {string} command - Docker compose command that failed
 * @param {string} location - Location where the command was run
 * @param {string|Object} error - Error message that was thrown by the command
 *
 * @returns {void}
 */
const throwComposeFailed = (command, location, error) => {

  Logger.empty()

  Logger.error(`The docker compose task failed, See above output for details.`)
  Logger.pair(`Command:`, command)
  Logger.pair(`Location:`, location)
  error && Logger.error(isStr(error) && error || Logger.error(error.message))

  Logger.empty()

  throwTaskFailed()

}

module.exports = {
  throwComposeFailed
}