const {
  deepMerge,
  isArr,
  noOpObj,
  noOpArr,
  pickKeys,
} = require('@keg-hub/jsutils')

/**
 * Cache holder for options shared between tasks
 * @Object
 */
let __SHARED_OPTS = {
  all: {},
  groups: {}
}

/**
 * Sets the shared options object, to allow reusing defined task options
 * @function
 * @export
 * @param {Object} options - Task options that can be shared across tasks
 * @param {boolean} groups - Should the options be separated by group name
 *
 * @example
 * sharedOptions({ ...custom task options })
 *
 * @returns {void}
 */
const setSharedOptions = (options = noOpObj, groups) => {
  groups
    ? Object.assign(__SHARED_OPTS.groups, options)
    : Object.assign(__SHARED_OPTS.all, options)
}

/**
 * Gets the shared options to based on passed in arguments
 * @function
 * @private
 * @param {string} action - Name of the task action getting the options
 * @param {Object} taskOps - Task options defined in the task
 * @param {Array} include - Filter to include shared options by name
 * @param {string} groupName - Name of the group to get the shared options from
 *
 * @example
 * sharedOptions('start') // Returns all shared options
 *
 * @returns {Object} - Merged task options and shared options
 */
const sharedOptions = (action, taskOps = noOpObj, include = noOpArr, groupName) => {
  const shared = groupName
    ? __SHARED_OPTS.groups[groupName]
    : __SHARED_OPTS.all

  const addOpts = isArr(include)
    ? pickKeys(shared, include)
    : shared

  // taskOps is merged twice to ensure key order, then priority
  return deepMerge(taskOps, addOpts, taskOps)
}

module.exports = {
  sharedOptions,
  setSharedOptions,
}
