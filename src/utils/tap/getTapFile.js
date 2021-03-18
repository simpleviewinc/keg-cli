const path = require('path')
const { getTapPath } = require('KegUtils/globalConfig/getTapPath')
const { throwNoTapLoc } = require('KegUtils/error/throwNoTapLoc')
const { getGlobalConfig } = require('KegUtils/globalConfig/getGlobalConfig')

/**
 * Builds a path to a file in a taps folder
 *
 * @function
 * @param {string} tapName - Name of the tap to get the package.json for 
 * @param {string} file - Path to the file within the taps folder
 * @param {Object} globalConfig - Global config object for the keg-cli
 * 
 * @return {string} - Path to the taps file
 */
const getTapFile = (tapName, file, globalConfig) => {
  globalConfig = globalConfig || getGlobalConfig()
  const tapPath = getTapPath(globalConfig, tapName)
  !tapPath && throwNoTapLoc(globalConfig, tapName)

  return path.join(tapPath, file)
}

module.exports = {
  getTapFile
}