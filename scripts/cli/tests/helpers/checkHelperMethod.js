const { isFunc } = require('@keg-hub/jsutils')
const { kegCmd, kegCmdAsync } = require('./kegCmd')

/**
 * Checks if a helper method exists before calling it
 * @param {Object} parent - Parent object that owns the helper method
 * @param {string} helperMethod - Name of the helper method that should be called
 * @param {*} data - Optional args to pass to the helper method
 *
 * @returns {*} Helper method response
 */
const checkHelperMethod = async (parent, helperMethod, ...data) => {
  return isFunc(parent[helperMethod]) &&
    await parent[helperMethod](kegCmd, kegCmdAsync, ...data)
}

module.exports = {
  checkHelperMethod
}