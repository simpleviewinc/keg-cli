const { getTapPath } = require('./getTapPath')
const { getPackageRoot } = require('../path/getPackageRoot')
const { getKegGlobalConfig } = require('../task/getKegGlobalConfig')

/**
 * Finds the path to the a taps root folder based on passed in params
 * Uses the global keg-cli config to find a taps path when tap param exists
 * @param {Object} params - Options to help finding a taps root location
 * @param {string} params.tap - Name of a linked tap in the global keg-cli config
 * @param {string} params.location - Custom location of a tap ( Must be absolute )
 * @returns {string} - Path on the host machine to a tap's root folder
 */
 const getTapRoot = ({ tap, location }={}) => {
  if (!tap && !location)
    throw new Error('Cannot resolve tap root without a tap alias or location string!', { tap, location })

  return location
    ? getPackageRoot(location)
    : getTapPath(getKegGlobalConfig(), tap)
}

module.exports = { getTapRoot }