const { TAP_CONFIG_NAMES } = require('KegConst/constants')
const { tryRequireSync } = require('@keg-hub/jsutils/src/node')
const { isObj } = require('@keg-hub/jsutils')
const path = require('path')

/**
 * Obtains the tap config (e.g. tap.js(on)) located at tapRootPath
 * @param {string} tapRootPath - path to the root directory of a tap
 * @returns {Array<Object?, string>} array with two elements: 
 * - the tap's config, or null if none exists
 * - the path from which the config was derived, or null if no config exists
 * @example
 * getTapConfig('~/keg-hub/taps/tap-events-force')
 * // => [ { <tap's config> }, <file path to that config> ]  
 */
const getTapConfig = tapRootPath => {
  for (let i = 0; i < TAP_CONFIG_NAMES.length; i++) {
    const possiblePath = path.join(tapRootPath, TAP_CONFIG_NAMES[i])
    const config = tryRequireSync(possiblePath)
    if (isObj(config)) return [ config, possiblePath ]
  }

  return [ null, null ]
}

/**
 * Obtains the tap's package.json located at tapRootPath
 * @param {string} tapRootPath - path to the root directory of a tap
 * @returns {Array<Object?, string>} array with two elements: 
 * - the tap's package.json, or null if none exists
 * - the path from which the package was derived, or null if no config exists
 * @example
 * getTapPackage('~/keg-hub/taps/tap-events-force')
 * // => [ { <tap's package.json> }, <file path to that config> ]  
 */
const getTapPackage = tapRootPath => {
  const packagePath = path.join(tapRootPath, 'package.json')
  const config = tryRequireSync(packagePath)
  return isObj(config)
    ? [ config, packagePath ]
    : [ null, null ]
}

module.exports = { getTapConfig, getTapPackage }