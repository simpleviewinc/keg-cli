
const { getTapFile } = require('./getTapFile')
const { throwNoFileExists } = require('KegUtils/error/throwNoFileExists')

/**
 * Loads a taps config file as an object
 * 
 * @function
 * @param {string} tapName - Name of the tap to get the package.json for 
 * @param {Object} globalConfig - Global config object for the keg-cli
 * 
 * @return {Object} - taps config file
 */
const getTapConfig = (tapName, globalConfig) => {
  // TODO: This should allow loading any type of tap config file
  // Need support for tap.json / tap.js / app.json / app.js
  const configPath = getTapFile(tapName, 'tap.js', globalConfig)
  try {
    return require(configPath)
  }
  catch(err){
    throwNoFileExists(configPath)
  }
}


module.exports = {
  getTapConfig
}