const { Logger } = require('KegLog')
const { throwRequired } = require('../error')
const { exists, mapEnv } = require('../helpers')
const { optionsAsk } = require('./optionsAsk')
const {
  isArr,
  isStr,
  isObj,
  isBool,
  softFalsy,
  wordCaps,
  isStrBool,
  toBool,
  reduceObj
} = require('jsutils')
const { BOOL_VALUES } = require('KegConst/constants')

const boolOpts = BOOL_VALUES.truthy.concat(BOOL_VALUES.falsy)

/**
 * Checks for a required option, and throws if it does not exist
 * @param {string|number|boolean} value
 * @param {Object} task - Task Model of current task being run
 * @param {Array} key - Name the argument to find
 * @param {string} meta - Info about the option from the task
 * @param {Array} hasVal - Does the value exist
 *
 * @returns {Void}
 */
const checkRequired = (task, key, meta) => {
  meta.required && throwRequired(task, key, meta)
}

/**
 * Checks if the value is a string bool, and auto-converts it
 * @function
 * @param {*} value - Value to check for string bool
 *
 * @returns {*} - Boolean or original value
 */
const checkBoolValue = value => {
  if(!exists(value) || isBool(value)) return value

  const lowerVal = value && value.toLowerCase()

  // Check the value is one of the joined bool options
  return boolOpts.indexOf(lowerVal) === -1
    ? value
    : BOOL_VALUES.truthy.indexOf(lowerVal) !== -1
      ? true
      : false
}

/**
 * Checks if the key is an env, and maps the value for shortcuts
 * @function
 * @param {*} key - Key to check for environment
 * @param {*} value - Value to check for string bool
 *
 * @returns {*} - The original value or mapped environment value
 */
const checkEnvKeyValue = (key, value) => {
  // Check if the arg is env, and map it from the env shortcuts
  return key === 'env' || key === 'environment'
    ? mapEnv(value)
    : value
}

/**
 * Removes an option from the options array
 * @function
 * @param {Array} options - Arguments passed in from the terminal
 * @param {string} opt - Item to remove from the array
 *
 * @returns {Array} - Updated options array
 */
const removeOption = (options, opt) => {
  options.splice(options.indexOf(opt), 1)

  return options
}

/**
 * Matches the option against the passed in matchTypes
 * Then, Compares the next value with taskKeys to ensure it's not a argument key
 * If a match is found and it's not a task key, it returns the passed in next value
 * @function
 * @param {Array} taskKeys - Names of arguments for the current task
 * @param {Array} matchTypes - Keys to match the option against
 * @param {string} option - Passed in option from the command line
 * @param {string} value - Value to set if there is a match
 *
 * @returns {string|boolean} - Passed in value, or true if taskKey match
 */
const matchParamType = (taskKeys, matchTypes, option, value) => {
  // Search for a match between the option and matchTypes
  const match = matchTypes.reduce((matched, type) => matched || option === type, false)

  // If there's a match, and it's not a taskKey return the value
  // If there's a match, but no value or is a taskKey match, return true
  // If no match return null, so the splitEqualsMatch method will run
  return match
    ? value && taskKeys.indexOf(value) === -1
      ? value
      : true
    : null
}

/**
 * Checks arguments for '=' and splits it to key value pair
 * @function
 * @param {string} option - Option passer from command line to check for '='
 * @param {string} long - Long version of the option
 * @param {string} short - Short version of the option
 * @param {string} argument - Current value of the search
 *
 * @returns {string} - Value of the current search
 */
const splitEqualsMatch = (option, matchTypes, argument) => {
  const [ key, value ] = option.split('=')
  // Check if the key exists in the matchTypes, and return the value if it does
  return matchTypes.indexOf(key) !== -1 ? value : argument
}

/**
 * Builds all possible matches for the passed in argument
 * @param {string} long - Long form name of the argument to find
 * @param {string} short - Short form name of the argument to find
 * @param {Array} [alias=[]] - Other names of the argument to find
 *
 * @returns {Array} - All possible argument names
 */
const buildMatchTypes = (long, short, alias=[]) => {
  return alias.reduce((matchTypes, type) => {
    return matchTypes.concat([ type, `--${type}`, `-${type}` ])
  }, [ long, `--${long}`, short, `-${short}` ])
}


/**
 * Checks the current argument for a starting "
 * If found, adds all other options until and end " is found
 * @param {string} argument - Found argument to check for starting "
 * @param {Array} options - Items to search for the end "
 * @param {number} index - Location in the options array to start looking for an end "
 *
 * @returns {string} - Built quoted string
 */
const checkQuotedOptions = (argument, options, index) => {
  // Check if the current option has a quote
  if(argument[0] !== '"') return argument

  // flag for when then end quote is found
  let foundEnd

  // Get all passed in options after the current option
  const slicedOpts = options.slice(index)
  return slicedOpts.reduce((joined, opt) => {
    // If foundEnd is true, just return and don't add anymore options,
    if(foundEnd) return joined

    // Remove the current option from the options array
    options = removeOption(options, opt)

    if(opt[opt.length -1] === '"'){
      foundEnd = true
      return `${joined.substring(1)} ${opt.slice(0, -1)}`
    }

    return `${joined} ${opt}`

  }, argument)
}

/**
 * Searches for a argument in the options array, and gets it's value
 * @function
 * @param {Object} params - Contains the data to be searched
 * @param {Array} params.taskKeys - All argument names of the current task
 * @param {Array} params.options - items passed from the command line
 * @param {string} params.long - Long form name of the argument to find
 * @param {string} params.short - Short form name of the argument to find
 * @param {string} params.def - Default value to use, if the argument can not be found
 *
 * @returns {string} - The found value || the passed in default
 */
const getParamValue = ({ taskKeys, options, long, short, alias }) => {

  const matchTypes = buildMatchTypes(long, short, alias)

  return (isStr(long) || isStr(short)) && isArr(options) &&
    options.reduce((argument, option, index) => {

      // If the value was already found, check for quoted string and return it 
      if(exists(argument)) return checkQuotedOptions(argument, options, index)

      const nextOpt = options[ index + 1 ]

      // Check if the current option matches any in the matchTypes array
      // Pass along the next option, so we can also set the value
      // Pass the taskKeys, to ensure the next option is not a task key option
      // This is to ensure the next option is a value, and not a key to a value
      let value = matchParamType(
        taskKeys,
        matchTypes,
        option,
        nextOpt
      )

      // If no value if found, then check for a split equals match
      if(!exists(value) && option.indexOf('=') !== -1)
        value = splitEqualsMatch(option, matchTypes, argument)

      // If value is the next option, remove it from the options array
      if(value === nextOpt) options = removeOption(options, value)

      return value

    }, null)
}

/**
 * Finds the value to the passed in keg argument
 * @function
 * @param {*} { key, meta={}, ...params }
 * @param {Object} args - Contains the data to be searched
 * @param {Array} args.options - items passed from the command line
 * @param {Object} args.task - Task Model of current task being run
 * @param {Array} args.key - Name the argument to find
 * @param {string} args.meta - Info about the argument from the task
 *
 * @returns {*} - Value of the search for argument from passed in options
 */
const findParam = ({ key, meta={}, index, task, ...args }) => {

  const value = getParamValue({
    ...args,
    long: key,
    short: key[0],
    alias: meta.alias,
  })

  // If value exists or if there's not any allowed, then return it
  if(exists(value) || !isArr(meta.allowed)) return value

  // Otherwise loop the allowed and check if one exists in the options array
  // If a allowed if found, it will be used as the value for the argument key
  const allowedMatch = meta.allowed.reduce((foundVal, allowed) => {
    return exists(foundVal)
      ? foundVal
      // The index of the found allowed option must match the index of the key
      // In the tasks options object
      : args.options.indexOf(allowed) === index
        ? allowed
        : foundVal
  }, null)

  // If there's a allowed match then remove it from the options array
  args.options = allowedMatch
    ? removeOption(args.options, allowedMatch)
    : args.options

  return allowedMatch

}

/**
 * Ensures a param value exists as needed
 * Asks for the value when ask key is defined, otherwise uses the default
 * @function
 * @param {Object} task - Task Model of current task being run
 * @param {Object} params - Existing mapped params from options
 * @param {string} key - Params key the value should be mapped to
 * @param {Object} meta - Info about the option from the task
 *
 * @returns {Object} - Mapped params object
 */
const ensureParam = async (task, params, key, meta) => {

  params[key] = checkBoolValue(params[key])
  if(exists(params[key])) return params

  let value = await optionsAsk(key, meta)

  // Treat empty string as no value
  ;!exists(value) || value === ''
    ? checkRequired(task, key, meta)
    : ( params[key] = checkBoolValue(value) )

  return params
}

/**
 * Adds default values when task is short-circuited
 * @function
 * @param {Object} task - Task Model of current task being run
 * @param {Object} mappedParams - Currently mapped args
 *
 * @returns {Object} - Mapped params object
 */
const ensureParams = async (task, mappedParams={}) => {
  return reduceObj(task.options, async (key, meta, toResolve) => {
    params = await toResolve

    return ensureParam(task, params, key, meta)
  }, Promise.resolve(mappedParams))
}

/**
 * Loops the task options looking to a match in the passed in options array
 * @function
 * @param {Object} task - Task Model of current task being run
 * @param {Object} taskKeys - Keg names of the task options
 * @param {Array} options - items passed from the command line
 *
 * @returns {Object} - Mapped arguments object
 */
const loopTaskOptions = (task, taskKeys, options) => {
  return taskKeys.reduce(async (toResolve, key, index) => {
    const params = await toResolve

    // Get the option meta for the key
    const meta = isObj(task.options[key])
      ? task.options[key]
      : { description: task.options[key] }

    // Find the value of the argument from the passed in options
    const value = findParam({
      key,
      meta,
      task,
      index,
      taskKeys,
      options,
    })

    // Check if the arg is env, and map it from the env shortcuts
    const val = checkEnvKeyValue(key, value)

    // If we get a value back, add it to the params object
    exists(val) && ( params[key] = val )

    // Ensure the param exists if needed, and return
    return ensureParam(task, params, key, meta)

  }, Promise.resolve({}))
}


/**
 * Maps all passed in options to the cmdOpts based on keys
 * @function
 * @param {Array} args.options - items passed from the command line
 * @param {Object} args.task - Task Model of current task being run
 * @param {Object} args.task.options - Options accepted by the task being run
 *
 * @returns {Object} - Mapped arguments object
 */
const getParams = async ({ options=[], task }) => {

  // If no options to parse, Add the defaults and return it
  if(!options.length) return ensureParams(task)

  // Make copy of options, so we don't affect the original
  const optsCopy = Array.from(options)

  // Get all the name of the options for the task
  // This is used later to compare the keys with the passed in options
  const taskKeys = isObj(task.options) && Object.keys(task.options)

  // If not task keys to loop, just return empty
  if(!taskKeys || !taskKeys.length) return ensureParams(task)

  // Short circuit the options parsing if there's only one option passed, and it's not a pair (=)
  return options.length !== 1 || options[0].indexOf('=') !== -1

    // Loop over the task keys and map the task options to the passed in options
    ? taskKeys && await loopTaskOptions(task, taskKeys, options)
    
    // Otherwise set it as the first key in the task options object
    : ensureParams(
        task,
        { [ taskKeys[0] ]: checkEnvKeyValue(taskKeys[0], options[0]) }
      )

}

module.exports = {
  ensureParams,
  getParams
}