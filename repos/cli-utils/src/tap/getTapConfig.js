const { getTapPath } = require('./getTapPath')
const { getKegGlobalConfig } = require('../task/getKegGlobalConfig')
const { TAP_CONFIG_NAMES } = require('../constants')
const { tryRequireSync } = require('@keg-hub/jsutils/src/node')
const { isObj } = require('@keg-hub/jsutils')
const nodePath = require('path')

/**
 * Obtains the tap config (e.g. tap.js(on)) located at the root path of the tap
 * @param {Object} options - 
 * @param {string} options.name - name of an existing linked tap (alias)
 * @param {string} options.path - file path to a tap. You don't need `name` if you pass this.
 * @param {Array<string>} options.configNames - (OPTIONAL) By default, this is
 * set to the constants' TAP_CONFIG_NAMES, but you can override it 
 * if you want the function to look for different file names.
 * @returns {Array<Object?, string>} array with two elements: 
 * - the tap's config, or null if none exists
 * - the path from which the config was derived, or null if no config exists
 * @example
 * getTapConfig({ path: '~/keg-hub/taps/tap-events-force'} )
 * // => [ { <tap's config> }, <file path to that config> ]  
 * @example
 * getTapConfig({ name: evf })
 * // => [ { <tap's config> }, <file path to that config> ]  
 */
const getTapConfig = ({ path, name, configNames=TAP_CONFIG_NAMES }={}) => {
  if (!path && !name) 
    throw new Error('Either path or name parameters for tap must be defined.')

  const tapPath = path || getTapPath(getKegGlobalConfig(), name)

  for (let i = 0; i < configNames.length; i++) {
    const possiblePath = nodePath.join(tapPath, configNames[i])
    const config = tryRequireSync(possiblePath)
    if (isObj(config)) return [ config, possiblePath ]
  }

  return [ null, null ]
}

/**
 * Obtains the tap's package.json located at root of tap
 * @param {string} options.name - name of an existing linked tap (alias)
 * @param {string} options.path - file path to a tap. You don't need `name` if you pass this.
 * @returns {Array<Object?, string>} array with two elements: 
 * - the tap's package.json, or null if none exists
 * - the path from which the package was derived, or null if no config exists
 * @example
 * getTapPackage('~/keg-hub/taps/tap-events-force')
 * // => [ { <tap's package.json> }, <file path to that config> ]  
 */
const getTapPackage = options => getTapConfig({ ...options, configNames: ['package.json'] })

module.exports = { getTapConfig, getTapPackage }