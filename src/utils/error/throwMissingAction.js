const { Logger } = require('KegLog')
const { throwTaskFailed } = require('./throwTaskFailed')

/*
 * Helper to log an error when an action does not exist in a value.yml file
 * @function
 * @param {string} actionLoc - path to the action within the yml file
 *
 * @returns {void}
*/
const throwMissingAction = (actionLoc) => {
  Logger.empty()
  Logger.error(`Action NOT found for path "${actionLoc}"`)
  Logger.error(`Ensure the action exists before running this command!`)
  Logger.empty()

  throwTaskFailed()
}


module.exports = {
  throwMissingAction
}