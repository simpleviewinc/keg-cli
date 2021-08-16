const { checkEnvArg } = require('./checkEnvArg')
const { optionsAsk } = require('../options/optionsAsk')
const { exists, reduceObj } = require('@keg-hub/jsutils')
const { checkRequired } = require('../utils/checkRequired')
const { checkBoolValue } = require('../options/checkBoolValue')
const { checkValueType } = require('../options/checkValueType')

/**
 * Ensures a param value exists as needed
 * Asks for the value when ask key is defined, otherwise uses the default
 * @function
 * @param {Object} task - Task Model of current task being run
 * @param {Object} args - Existing mapped args from options
 * @param {string} key - Params key the value should be mapped to
 * @param {Object} meta - Info about the option from the task
 *
 * @returns {Object} - Mapped args object
 */
const ensureArg = async (task, args, key, meta) => {

  // Ensure any boolean shortcuts are mapped to true or false
  // Allows for using shortcuts like 'yes' or 'no' for 'true' and 'false'
  // See ./configs/parse.config.js for list of boolean shortcuts
  args[key] = checkBoolValue(args[key])

  // Ensure env shortcuts are mapped to the correct environment
  // Allows for using shortcuts like 'dev' or 'prod' for 'development' and 'production'
  // See ./configs/parse.config.js for list of env options
  args[key] = checkEnvArg(key, args[key], meta.default)

  // Validate the metadata type, to ensure it matches the value
  // If no value exists, it will return the meta.default
  args[key] = checkValueType(key, args[key], meta)
  
  // If a value is found, then just return
  if(exists(args[key])) return args

  // Check if we should ask the user for an option value
  let value = await optionsAsk(key, meta)

  // Run final check to ensure the argument exists
  // If no value exist at this point, check to see if it's required
  // We treat empty strings as no value
  ;!exists(value) || value === ''
    ? checkRequired(task, key, meta)
    : ( args[key] = checkBoolValue(value) )

  return args
}

/**
 * Adds default values when task is short-circuited
 * @function
 * @param {Object} task - Task Model of current task being run
 * @param {Object} args.params - Pre mapped params
 *
 * @returns {Object} - Mapped params object
 */
const ensureArgs = async (task, mappedParams={}) => {
  return reduceObj(task.options, async (key, meta, toResolve) => {
    const params = await toResolve

    return ensureArg(task, params, key, meta)
  }, Promise.resolve(mappedParams))
}

module.exports = {
  ensureArg,
  ensureArgs
}
