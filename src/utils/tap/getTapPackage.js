const { getTapFile } = require('./getTapFile')
const { throwNoFileExists } = require('KegUtils/error/throwNoFileExists')

/**
 * Loads a taps package.json file as an object
 * 
 * @function
 * @param {string} tapName - Name of the tap to get the package.json for 
 * @param {Object} globalConfig - Global config object for the keg-cli
 * 
 * @return {Object} - taps package.json file content
 */
const getTapPackage = (tapName, globalConfig) => {
  const packagePath = getTapFile(tapName, 'package.json', globalConfig)
  try {
    return require(packagePath)
  }
  catch(err){
    throwNoFileExists(packagePath)
  }
}

module.exports = {
  getTapPackage
}