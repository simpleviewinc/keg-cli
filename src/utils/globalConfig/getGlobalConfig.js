const path = require('path')
const { tryRequireSync } = require('@keg-hub/jsutils/src/node')
const { GLOBAL_CONFIG_FOLDER, GLOBAL_CONFIG_FILE } = require('KegConst/constants')
const { __getGlobalConfig, __updateGlobalConfig } = require('./globalConfigCache')

const globalConfigPath = path.join(GLOBAL_CONFIG_FOLDER, GLOBAL_CONFIG_FILE)

/**
 * Loads the global cli config from the global config folder ( ~/.kegConfig )
 * <br/> If the folder and config do not exist, it will create it
 * @function
 *
 * @returns {Object} - The global config
 */
const getGlobalConfig = () => {
  // try to load the globalConfig from cache
  let globalConfig = __getGlobalConfig()

  // If it's cached, return the cached version
  if(globalConfig) return globalConfig

  // try to load the global config
  const config = tryRequireSync(globalConfigPath)

  // Update the globalConfig cache with the loaded globalConfig, if it exists
  config && __updateGlobalConfig(config)

  // Return the global config after it's been cached
  return __getGlobalConfig()
}

module.exports = {
  getGlobalConfig,
  __updateGlobalConfig
}