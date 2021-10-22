const {
  deepMerge,
  isArr,
  exists,
  noOpObj,
  noOpArr,
  pickKeys,
  isFunc,
  eitherArr,
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
 * @param {boolean} mergeGroups - Should the groups be merged into the allGroup
 *
 * @example
 * sharedOptions({ ...custom task options })
 *
 * @returns {void}
 */
const setSharedOptions = (options = noOpObj, groups, mergeGroups) => {
  // If no groups, get merge with the all and return
  if(!groups) return Object.assign(__SHARED_OPTS.all, options)

  groups && Object.assign(__SHARED_OPTS.groups, options)
  
  // If mergeGroups it set to merge into the all options
  // Loop over each group type from options to get the options
  // Then merge the options with the all group
  mergeGroups &&
    Object.values(opts).map((opts) => Object.assign(__SHARED_OPTS.all, opts))
}

// TODO: update this to use setSharedOptions
// cli-utils needs to be updated to allow option sets to be a function
// Then it needs to pass in the action name to allow it to be dynamically set

/**
 * Gets the shared options to based on passed in arguments
 * @function
 * @private
 * @param {string} action - Name of the task action getting the options
 * @param {Object} taskOps - Task options defined in the task
 * @param {Array} include - Filter to include shared options by name
 * @param {Array|string} groups - Name(s) of the group to get the shared options from
 *
 * @example
 * sharedOptions('start') // Returns all shared options
 *
 * @returns {Object} - Merged task options and shared options
 */
const sharedOptions = (action, taskOps = noOpObj, include = noOpArr, groups) => {
  const groupNames = groups && eitherArr(groups, [groups])

  // If groupsNames exists, loop through and join each group together
  const shared = groupNames
    ? groupNames.reduce((joined, group) => ({
        ...joined,
        ...(__SHARED_OPTS.groups[group] || noOpObj),
      }), {})
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
