const { get, validate, isObj, isStr } = require('@keg-hub/jsutils')
const { GLOBAL_CONFIG_PATHS } = require('../constants/constants')

/**
 * Gets a path from the stored paths in the globalConfig object
 * @param {Object} globalConfig - Global config object for the Keg CLI
 * @param {string} tapName - Key name of the linked tap path to get
 *
 * @returns {string} - Found path
 */
const getTapPath = (globalConfig, tapName) => {
  validate(
    { globalConfig, tapName }, 
    { globalConfig: isObj, tapName: isStr }, 
    { throws: true }
  )
  return get(globalConfig, `${GLOBAL_CONFIG_PATHS.TAP_LINKS}.${tapName}.path`)
}

module.exports = {
  getTapPath
}