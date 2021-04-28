const { getGlobalConfig } = require('KegUtils/globalConfig/getGlobalConfig')
const { get, isStr } = require('@keg-hub/jsutils')

/**
 * Gets the path to the linked tap with name `name`
 * @param {string} name - alias name of tap
 * @param {Object} config - (optional) global config object
 * @returns {string} path
 */
const getTapPath = (name, config) => {
  if (!isStr(name)) {
    console.error(`Name must be a string. Found: ${name}`)
    return null
  }
  const globalConfig = config || getGlobalConfig()
  return get(globalConfig, `cli.taps.${name}.path`)
}

module.exports = { getTapPath }