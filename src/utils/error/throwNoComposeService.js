const { Logger } = require('KegLog')
const { throwTaskFailed } = require('./throwTaskFailed')

/**
 * Error helper to log and throw an error on invalid docker login creds
 * @function
 * @param {creds} - Creds passed in from the command line
 *
 * @returns {void}
 */
const throwNoComposeService = loadPath => {
  
  Logger.empty()
  Logger.error(`Error getting service in docker-compose file!\nNo services in file at ${ loadPath }!`)
  Logger.empty()
  
  throwTaskFailed()
}

module.exports = {
  throwNoComposeService
}