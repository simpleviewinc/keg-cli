const { runOptions } = require('./runOptions')
const { pullOptions } = require('./pullOptions')
const { pushOptions } = require('./pushOptions')
const { buildOptions } = require('./buildOptions')
const { startServiceOptions } = require('./startServiceOptions')
const { deepMerge, isFunc, isObj, noOpObj, noPropArr } = require('@keg-hub/jsutils')

const optionTypes = {
  build: buildOptions,
  pull: pullOptions,
  push: pushOptions,
  run: runOptions,
  startService: startServiceOptions,
}

/**
 * Builds the options for a task
 * @param {Object} task - Name of the task calling the compose service
 * @param {Object} action - Name of the action calling the compose service
 * @param {Object|string} type - Type of options to build
 * @param {Object} overrides - Override the default options
 * @param {Array} pickKeys - Keys to include in the options list
 *
 * @returns {Object} - Options for tasks using the compose service
 */
const mergeTaskOptions = (
  task='',
  action='',
  type,
  overrides=noOpObj,
  pickKeys,
) => {
  return deepMerge({
    // Add the overrides here, so key order matches 
    ...overrides,
    // If options is an object add it, or try to lookup the options in optionTypes
    ...(
      isObj(type)
        ? type
        : isFunc(optionTypes[type])
          ? optionTypes[type](task, action, pickKeys)
          : optionTypes[type] || {}
    ),
  }, overrides)
}

module.exports = {
  mergeTaskOptions
}