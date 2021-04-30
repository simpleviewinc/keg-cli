const path = require('path')
const appPath = require('app-root-path').path
const cliUtilsRoot = path.join(__dirname, '../').slice(0, -1)
const { getKegGlobalConfig } = require('./task/getKegGlobalConfig')

let __APP_ROOT

/**
 * Sets the applications root directory
 * Helpful when app-root-path can not find the correct directory
 * @function
 * @public
 * @param {string} location - Path to the applications root directory
 *
 * @returns {void}
 */
const setAppRoot = location => {
  if(!__APP_ROOT && location !== appPath && location !== cliUtilsRoot)
    __APP_ROOT = location
}

/**
 * Recursively finds the root parent module, and returns its directory path
 * @function
 * @private
 * @param {Object} parentModule - parent module of the caller
 *
 * @returns {string} Found root path of the root parent module
 */
const getRootParentModule = parentModule => {
  return parentModule.parent
    ? getRootParentModule(parentModule.parent)
    : path.dirname(parentModule.path)
}

/**
 * Gets the root apps path, even when the keg-cli-utils is sym-linked
 * @function
 * @private
 *
 * @returns {string} Found root path of the calling application
 */
const getAppRoot = () => {
  return __APP_ROOT
    ? __APP_ROOT
    : cliUtilsRoot === appPath
      ? getRootParentModule(module.parent)
      : appPath
}

module.exports = {
  getAppRoot,
  setAppRoot,
}
