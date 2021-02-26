const { KEG_DEFAULT_ENV } = process.env

/**
 * Cache holder for the default env
 * @string
 * Use the KEG_DEFAULT_ENV env if it's set
 * Allows overriding the default env from an exported environment variable
 */
let __defaultEnv = KEG_DEFAULT_ENV

/**
 * Gets the default env setting from the keg global config
 * @function
 *
 * @returns {string} - Default env from the global config 
 */
const getDefaultEnv = () => {
  if(__defaultEnv) return __defaultEnv
  
  const { getSetting } = require('./getSetting')
  __defaultEnv = getSetting('defaultEnv')

  return __defaultEnv
}

module.exports = {
  getDefaultEnv
}