const { checkCall } = require('@keg-hub/jsutils')
const { getKegGlobalConfig } = require('@keg-hub/cli-utils')

/**
 * Called on failed ghCli call
 * @function
 * @param {Object} response - response from the ghCli call
 *
 * @returns {*}
 */
const cliError = () => {
  
}

/**
 * Called on successful ghCli call
 * @function
 * @param {Object} response - response from the ghCli call
 *
 * @returns {*}
 */
const cliSuccess = () => {
  
}

/**
 * Injects the Keg-CLI globalConfig in the passed in arguments
 * @function
 * @param {function} method - Method to inject the globalConfig into
 *
 * @returns {*} - Response of the passed in method
 */
const injectGlobalConfig = method => (...args) => checkCall(
  method,
  getKegGlobalConfig(),
  ...args
)

module.exports = {
  cliError,
  cliSuccess,
  injectGlobalConfig
}