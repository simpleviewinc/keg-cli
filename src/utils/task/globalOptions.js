const { deepMerge, get, set } = require('@keg-hub/jsutils')
const { getDefaultEnv } = require('../globalConfig/getDefaultEnv')
const { ENV_ALIAS, ENV_MAP, ENV_OPTIONS } = require('../../constants/constants')

/**
 * Builds the global options object, and returns it
 * @function
 * @param {Object} task - Task Model of current task being run
 *
 * @returns {Object} - Built global Options object
 */
const getGlobalOptions = (task, action) => {
  return {
    env: {
      alias: ENV_ALIAS,
      allowed: ENV_OPTIONS,
      description: 'Environment to run the task in',
      example: 'keg ${ task } ${ action } --env staging',
      default: getDefaultEnv(),
    },
  }
}

/**
 * Merges the passed in tasks options with the default global task options
 * @function
 * @param {Object} task - Task Model of current task being run
 *
 * @returns {Object} - Task with the task options updated
 */
const addGlobalOptions = (namedTask, name, parent) => {
  set(namedTask, `${ name }.options`, deepMerge(
    get(namedTask, `${ name }.options`),
    getGlobalOptions(parent, name),
  ))

  return namedTask
}

module.exports = {
  addGlobalOptions,
  getGlobalOptions,
  getDefaultEnv,
}