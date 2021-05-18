const path = require('path')
const { GLOBAL_CONFIG_FOLDER, GLOBAL_CONFIG_FILE } = require('../constants')

/**
 * Attempts to load the Keg-CLI global config from the user home directory
 * @param {boolean} [throwError=true] - Should the method throw if the config can not be loaded
 *
 * @return {Object} - Loaded Keg-CLI global config
 */
const getKegGlobalConfig = (throwError = true) => {
  const configPath = path.join(GLOBAL_CONFIG_FOLDER, GLOBAL_CONFIG_FILE)
  try {
    return require(configPath)
  }
  catch (err) {
    if (throwError)
      throw new Error(
        `Keg CLI global config could not be loaded from path: ${configPath}!`
      )

    return {}
  }
}

module.exports = {
  getKegGlobalConfig,
}
